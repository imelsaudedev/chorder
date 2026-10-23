"use client";

import { useFetchSongArrangements } from "@/app/api/api-client";
import AudioReferenceButton from "@/components/common/AudioReferenceButton";
import YoutubeReferenceButton from "@/components/common/YoutubeReferenceButton";
import SongConfigProvider from "@/components/config/SongConfig";
import ArrangementView from "@/components/song/ArrangementView";
import CompactSongPicker from "@/components/song/SongPicker/CompactSongPicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ClientArrangement,
  ClientServiceUnit,
  ClientSong,
} from "@/prisma/models";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { PanelShell } from "./ServiceItemPanel";

// Fluxo de Música: buscar → escolher arranjo (com prévia da cifra, áudio e
// vídeo) → confirmar. Ao editar uma música já escolhida, abre num cartão com
// as opções de trocar música/arranjo e ajustar a duração.
//
// Usado dentro do painel lateral (desktop) e do drawer (celular/template).

type Step = "card" | "songs" | "arrangement";

type SongFlowProps = {
  /** Música já escolhida neste item; `undefined` ao adicionar uma nova. */
  unit?: ClientServiceUnit;
  onAdd: (unit: Omit<ClientServiceUnit, "order">) => void;
  onUpdate: (changes: Partial<ClientServiceUnit>) => void;
  onClose: () => void;
  /** Troca o cabeçalho "Voltar" do shell por um botão próprio do container. */
  variant?: "panel" | "drawer";
  /** Filtros por tag do seletor, guardados por quem usa para durarem entre uma música e outra. */
  tagIds?: number[];
  onTagIdsChange?: (tagIds: number[]) => void;
};

function buildArrangementCopy(song: ClientSong, source: ClientArrangement | null, name: string | null) {
  return {
    id: undefined,
    songId: song.id,
    originalArrangementId: source?.id ?? null,
    key: source?.key ?? "C",
    // O nome é "congelado" na cópia: guarda o rótulo que a pessoa viu ao escolher
    // ("Arranjo principal", "Arranjo 2" ou o nome próprio), para o item do culto
    // continuar mostrando qual arranjo é mesmo que a lista do original mude.
    name: name ?? source?.name ?? null,
    isDefault: false,
    isDeleted: false,
    isServiceArrangement: true,
    youtubeUrl: source?.youtubeUrl ?? null,
    audios: source?.audios ?? [],
    song,
    units: source?.units,
  };
}

export default function SongFlow({
  unit,
  onAdd,
  onUpdate,
  onClose,
  variant = "panel",
  tagIds,
  onTagIdsChange,
}: SongFlowProps) {
  const hasSong = !!unit?.arrangement?.song;
  const [step, setStep] = useState<Step>(hasSong ? "card" : "songs");
  // Passo de onde o usuário veio, para o botão Voltar.
  const [songBack, setSongBack] = useState<Step | null>(null);
  const [arrangementBack, setArrangementBack] = useState<Step>("songs");
  const [pickedSong, setPickedSong] = useState<ClientSong | null>(null);

  // "Trocar" só faz sentido quando já há música; um item pendente adiciona.
  const isEditing = hasSong;

  const commit = useCallback(
    (song: ClientSong, source: ClientArrangement | null, name: string | null) => {
      const arrangement = buildArrangementCopy(song, source, name);
      if (unit) {
        onUpdate({ arrangementId: null, semitoneTranspose: 0, arrangement });
      } else {
        onAdd({
          clientId: crypto.randomUUID(),
          type: "SONG",
          arrangementId: null,
          semitoneTranspose: 0,
          durationMin: 5,
          label: null,
          metadata: null,
          arrangement,
        });
      }
      onClose();
    },
    [unit, onAdd, onUpdate, onClose]
  );

  if (step === "songs") {
    return (
      <PanelShell
        title={isEditing ? "Trocar música" : "Adicionar música"}
        iconType="SONG"
        tall
        variant={variant}
        onBack={songBack ? () => setStep(songBack) : undefined}
        onClose={onClose}
      >
        <CompactSongPicker
          tagIds={tagIds}
          onTagIdsChange={onTagIdsChange}
          onSelected={(song) => {
            setPickedSong(song);
            setArrangementBack("songs");
            setStep("arrangement");
          }}
        />
      </PanelShell>
    );
  }

  if (step === "arrangement") {
    const song = pickedSong ?? unit?.arrangement?.song ?? null;
    if (!song) {
      return null;
    }
    return (
      <PanelShell
        title={song.title}
        iconType="SONG"
        tall
        variant={variant}
        onBack={() => setStep(arrangementBack)}
        onClose={onClose}
      >
        <ArrangementStep
          song={song}
          isEditing={isEditing}
          currentArrangementId={unit?.arrangement?.originalArrangementId ?? null}
          onConfirm={(arrangement, name) => commit(song, arrangement, name)}
        />
      </PanelShell>
    );
  }

  // step === "card": música já escolhida
  const arrangement = unit?.arrangement;
  const song = arrangement?.song;
  return (
    <PanelShell title="Editar música" iconType="SONG" variant={variant} onClose={onClose}>
      <SongCard
        title={song?.title ?? ""}
        arrangementName={arrangement?.name ?? null}
        musicalKey={arrangement?.key ?? null}
        durationMin={unit?.durationMin ?? null}
        onSwapSong={() => {
          setSongBack("card");
          setStep("songs");
        }}
        onSwapArrangement={() => {
          if (!song) return;
          setPickedSong(song);
          setArrangementBack("card");
          setStep("arrangement");
        }}
        onSave={(durationMin) => {
          onUpdate({ durationMin });
          onClose();
        }}
      />
    </PanelShell>
  );
}

// --- Cartão da música escolhida ---

function SongCard({
  title,
  arrangementName,
  musicalKey,
  durationMin,
  onSwapSong,
  onSwapArrangement,
  onSave,
}: {
  title: string;
  arrangementName: string | null;
  musicalKey: string | null;
  durationMin: number | null;
  onSwapSong: () => void;
  onSwapArrangement: () => void;
  onSave: (durationMin: number | null) => void;
}) {
  const [duration, setDuration] = useState(durationMin != null ? String(durationMin) : "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = duration ? parseFloat(duration) : null;
    onSave(parsed !== null && Number.isFinite(parsed) && parsed >= 0 ? parsed : null);
  }

  return (
    <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4">
        <div className="rounded-lg border border-border p-4">
          <p className="font-medium">{title}</p>
          <p className="text-sm text-muted-foreground">
            {[arrangementName, musicalKey ? `Tom ${musicalKey}` : null].filter(Boolean).join(" · ") ||
              "Sem arranjo"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" className="h-11" onClick={onSwapSong}>
            Trocar música
          </Button>
          <Button type="button" variant="outline" className="h-11" onClick={onSwapArrangement}>
            Trocar arranjo
          </Button>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="song-duration" className="text-xs font-medium text-muted-foreground">
            Duração
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id="song-duration"
              type="number"
              inputMode="decimal"
              min={0}
              step={0.5}
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="—"
              className="h-11 w-28"
            />
            <span className="text-sm text-muted-foreground">min</span>
          </div>
        </div>
      </div>
      <div className="shrink-0 border-t border-border bg-background px-4 py-3">
        <Button type="submit" variant="secondary" className="h-11 w-full">
          Salvar
        </Button>
      </div>
    </form>
  );
}

// --- Passo de arranjo ---

function ArrangementStep({
  song,
  isEditing,
  currentArrangementId,
  onConfirm,
}: {
  song: ClientSong;
  isEditing: boolean;
  currentArrangementId: number | null;
  onConfirm: (arrangement: ClientArrangement | null, name: string | null) => void;
}) {
  const t = useTranslations("Messages");
  const { arrangements, isLoading, isError } = useFetchSongArrangements(song.slug, {
    includeSong: true,
    includeUnits: true,
  });
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Pré-seleciona o arranjo atual (ao trocar), o padrão ou o primeiro.
  useEffect(() => {
    if (!arrangements?.length || selectedIndex !== null) return;
    const current = arrangements.findIndex((a) => a.id === currentArrangementId);
    const preferred = current >= 0 ? current : arrangements.findIndex((a) => a.isDefault);
    setSelectedIndex(preferred >= 0 ? preferred : 0);
  }, [arrangements, currentArrangementId, selectedIndex]);

  const selected = selectedIndex !== null ? arrangements?.[selectedIndex] ?? null : null;
  const hasArrangements = !isLoading && !isError && (arrangements?.length ?? 0) > 0;
  const noArrangements = !isLoading && !isError && (arrangements?.length ?? 0) === 0;
  const hasMultiple = (arrangements?.length ?? 0) > 1;

  // Nome que fica guardado na cópia do arranjo: o próprio nome, ou o rótulo gerado.
  function storedNameOf(arrangement: ClientArrangement, index: number): string {
    return (
      arrangement.name?.trim() ||
      (arrangement.isDefault ? t("defaultArrangement") : `${t("arrangement")} ${index + 1}`)
    );
  }

  // Mesmo critério de nomes da tela da música: nome próprio, ou "Arranjo principal"
  // / "Arranjo N", com o tom ao lado para ajudar a escolher.
  function labelOf(arrangement: ClientArrangement, index: number): string {
    let label = arrangement.name?.trim() || "";
    if (!label) {
      label = arrangement.isDefault ? t("defaultArrangement") : `${t("arrangement")} ${index + 1}`;
    } else if (arrangement.isDefault) {
      label = `${label} (${t("defaultArrangement")})`;
    }
    return arrangement.key ? `${label} · Tom ${arrangement.key}` : label;
  }

  return (
    <>
      {/* Topo fixo: seletor de arranjo + áudio/vídeo do arranjo escolhido */}
      {hasArrangements && selected && (
        <div className="flex shrink-0 items-center gap-2 border-b border-border px-4 py-3">
          {hasMultiple ? (
            <Select value={String(selectedIndex)} onValueChange={(value) => setSelectedIndex(Number(value))}>
              <SelectTrigger aria-label="Arranjo" className="min-w-0 flex-1 cursor-pointer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {arrangements.map((arrangement, index) => (
                  <SelectItem key={arrangement.id ?? index} value={String(index)} className="min-h-11 cursor-pointer">
                    {labelOf(arrangement, index)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <p className="min-w-0 flex-1 truncate text-sm font-medium">
              {labelOf(selected, selectedIndex ?? 0)}
            </p>
          )}
          {(selected.audios?.length ?? 0) > 0 && (
            <AudioReferenceButton audios={selected.audios!} title={song.title} className="shrink-0" />
          )}
          {selected.youtubeUrl && (
            <YoutubeReferenceButton
              youtubeUrl={selected.youtubeUrl}
              title={song.title}
              className="shrink-0"
            />
          )}
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4">
        {isLoading && <Skeleton className="h-40 w-full" />}
        {isError && (
          <p role="alert" className="text-sm text-destructive">
            Não foi possível carregar os arranjos. Tente novamente.
          </p>
        )}
        {noArrangements && (
          <p className="text-sm text-muted-foreground">
            Esta música ainda não tem arranjo. Você pode usá-la mesmo assim e adicionar a cifra depois.
          </p>
        )}

        {selected && (
          <div
            tabIndex={0}
            role="region"
            aria-label={`Cifra de ${selected.name || song.title}`}
            className="shrink-0 rounded-md border border-border p-3 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <SongConfigProvider columns={1}>
              <ArrangementView arrangement={selected} />
            </SongConfigProvider>
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-border bg-background px-4 py-3">
        <Button
          type="button"
          variant="secondary"
          className="h-11 w-full"
          disabled={isLoading || !!isError || (!noArrangements && !selected)}
          onClick={() =>
            onConfirm(
              noArrangements ? null : selected,
              !noArrangements && selected ? storedNameOf(selected, selectedIndex ?? 0) : null
            )
          }
        >
          {noArrangements
            ? "Usar sem arranjo"
            : isEditing
            ? "Trocar para este arranjo"
            : "Usar este arranjo"}
        </Button>
      </div>
    </>
  );
}
