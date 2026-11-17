import { getLyrics } from "@/chopro/music";
import { readStorage, writeStorage } from "@/hooks/useLocalStorageState";
import { ClientArrangement } from "@/prisma/models";

export type HolyricsConfig = { token: string; host: string };

export const HOLYRICS_DEFAULT_HOST = "localhost:8091";
export const HOLYRICS_CONFIG_KEY = "holyrics:config";

/** Aceita "http://192.168.0.5:8091/" ou "192.168.0.5:8091"; vazio volta ao padrão. */
export function normalizeHost(raw: string | null | undefined): string {
  const host = (raw ?? "").trim().replace(/^https?:\/\//i, "").replace(/\/+$/, "");
  return host || HOLYRICS_DEFAULT_HOST;
}

/**
 * Configuração do Holyrics DESTE aparelho (localStorage). Fica por aparelho de propósito:
 * o Holyrics roda num computador específico, e quem fala com ele é o navegador.
 * Sem configuração salva, o host é localhost:8091 (o operador no próprio computador do Holyrics).
 *
 * Migração: o token já salvo no servidor (versão anterior) é usado uma única vez como ponto
 * de partida e copiado para o aparelho. O host do servidor NÃO é reaproveitado.
 */
export async function loadHolyricsConfig(): Promise<HolyricsConfig> {
  const local = readStorage<Partial<HolyricsConfig> | null>(HOLYRICS_CONFIG_KEY, null);
  if (local?.token) return { token: local.token, host: normalizeHost(local.host) };

  let token = "";
  try {
    const res = await fetch("/api/holyrics-config");
    if (res.ok) token = (await res.json())?.token ?? "";
  } catch {
    // sem servidor: segue sem token
  }
  const config = { token, host: normalizeHost(local?.host) };
  if (token) saveHolyricsConfig(config);
  return config;
}

export function saveHolyricsConfig(config: HolyricsConfig): HolyricsConfig {
  const saved = { token: config.token.trim(), host: normalizeHost(config.host) };
  writeStorage(HOLYRICS_CONFIG_KEY, saved);
  return saved;
}

/** Chamada de leitura (não altera nada) para saber se o Holyrics responde neste host/token. */
export async function holyricsPing(token: string, host: string): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const res = await fetch(apiUrl("GetLyricsPlaylist", token, host), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    const json = await res.json();
    if (json?.status === "error") return { ok: false, error: "token sem permissão ou inválido" };
    return { ok: true };
  } catch {
    return { ok: false, error: "sem resposta" };
  }
}

function apiUrl(action: string, token: string, host: string) {
  return `http://${host}/api/${action}?token=${token}`;
}

// O Holyrics retorna erros (ex: permissão negada) com HTTP 200 e
// { status: "error", error: ... } no corpo — checar só res.ok não basta.
async function holyricsApiCall(action: string, token: string, host: string, body: unknown = {}): Promise<any> {
  const res = await fetch(apiUrl(action, token, host), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`${action} falhou (HTTP ${res.status}). Verifique se o Holyrics está aberto e acessível.`);
  }
  const json = await res.json();
  if (json?.status === "error") {
    const err = json.error;
    const message = typeof err === "string" ? err : err?.message ?? JSON.stringify(err);
    throw new Error(`${action} falhou: ${message}. Verifique se a permissão "${action}" está habilitada para o token.`);
  }
  return json;
}

export async function holyricsPopupCreateSong(
  title: string,
  artist: string | null | undefined,
  arrangement: ClientArrangement,
  host: string = HOLYRICS_DEFAULT_HOST
): Promise<void> {
  const units = [...(arrangement.units ?? [])].sort((a, b) => a.order - b.order);

  const paragraphs = units
    .map((unit) => ({
      text: getLyrics(unit.content)?.trim() ?? "",
      description: unit.type.toLowerCase(),
    }))
    .filter((p) => p.text.length > 0);

  const body: Record<string, unknown> = { title, paragraphs };
  if (artist) body.artist = artist;

  const res = await fetch(`http://${host}/api/popup-createsong`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`popup-createsong falhou: ${res.status}`);
}

export async function holyricsSearchSong(token: string, host: string, title: string): Promise<string | null> {
  const json = await holyricsApiCall("SearchSong", token, host, { text: title, search_title: true });
  const results: { id: string; title: string }[] = json?.data ?? [];
  const exact = results.find(
    (s) => s.title.toLowerCase().trim() === title.toLowerCase().trim()
  );
  return exact?.id ?? results[0]?.id ?? null;
}

export async function holyricsSetPlaylist(token: string, host: string, holyricsIds: string[]): Promise<void> {
  // Busca a playlist atual
  const currentData = await holyricsApiCall("GetLyricsPlaylist", token, host, {});
  const currentPlaylist = currentData?.data ?? [];

  // Remove TODOS os itens atuais (limpa a playlist)
  if (currentPlaylist.length > 0) {
    const indexesToRemove = Array.from({ length: currentPlaylist.length }, (_, i) => i);
    await holyricsApiCall("RemoveFromLyricsPlaylist", token, host, { indexes: indexesToRemove });
  }

  // Adiciona as novas músicas (SetLyricsPlaylistItem só altera item já existente,
  // não cria; para adicionar é necessário usar AddLyricsToPlaylist)
  if (holyricsIds.length > 0) {
    await holyricsApiCall("AddLyricsToPlaylist", token, host, { ids: holyricsIds });
  }
}
