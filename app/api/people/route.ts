import { getLiveUserAuth } from "@/lib/auth-guard";
import prisma from "@/prisma/client";
import type { ServicePlan } from "@/prisma/models";
import { NextResponse } from "next/server";

export type PersonOption = { id: string; name: string; image: string | null; recent?: boolean };

const LIMIT = 8;
const RECENT = 5;
/** Quantos cultos recentes olhar para achar quem pregou. */
const RECENT_SERVICES = 40;

type PersonRow = { id: string; name: string | null; image: string | null };

/** Quem conduziu os últimos cultos da igreja (tabela de dirigentes), do mais recente. */
async function recentLeaders(): Promise<PersonRow[]> {
  const rows = await prisma.serviceLeader.findMany({
    where: {
      userId: { not: null },
      service: { isDeleted: false, scope: "CHURCH", status: "PUBLISHED" },
      user: { name: { not: null } },
    },
    orderBy: { service: { date: "desc" } },
    distinct: ["userId"],
    take: RECENT,
    select: { user: { select: { id: true, name: true, image: true } } },
  });
  return rows.flatMap((r) => (r.user ? [r.user] : []));
}

/**
 * Quem pregou nos últimos cultos da igreja, do mais recente: lê os itens Sermão dos planos.
 * O item guarda a conta (`preacherId`) quando o pregador foi escolhido na lista; itens antigos só
 * têm o nome, que vira conta quando bate exatamente com o de alguém (sem diferenciar maiúsculas).
 */
async function recentPreachers(): Promise<PersonRow[]> {
  const services = await prisma.service.findMany({
    where: { isDeleted: false, scope: "CHURCH", status: "PUBLISHED" },
    orderBy: { date: "desc" },
    take: RECENT_SERVICES,
    select: { plan: true },
  });

  const ordered: { id: string | null; name: string | null }[] = [];
  for (const { plan } of services) {
    const sections = [...((plan as ServicePlan | null)?.sections ?? [])].sort((a, b) => a.order - b.order);
    for (const section of sections) {
      for (const unit of [...section.units].sort((a, b) => a.order - b.order)) {
        if (unit.type !== "SERMAO") continue;
        const meta = unit.metadata as { preacher?: string | null; preacherId?: string | null } | null;
        const id = meta?.preacherId?.trim() || null;
        const name = meta?.preacher?.trim() || null;
        if (id || name) ordered.push({ id, name });
      }
    }
  }
  if (ordered.length === 0) return [];

  const ids = [...new Set(ordered.flatMap((o) => (o.id ? [o.id] : [])))];
  const names = [...new Set(ordered.flatMap((o) => (o.name ? [o.name] : [])))];
  const users = await prisma.user.findMany({
    where: { name: { not: null }, OR: [{ id: { in: ids } }, { name: { in: names, mode: "insensitive" } }] },
    select: { id: true, name: true, image: true },
  });
  const byId = new Map(users.map((u) => [u.id, u]));
  const byName = new Map(users.map((u) => [u.name!.toLocaleLowerCase("pt-BR"), u]));

  const result: PersonRow[] = [];
  for (const { id, name } of ordered) {
    const user = (id ? byId.get(id) : undefined) ?? (name ? byName.get(name.toLocaleLowerCase("pt-BR")) : undefined);
    if (user && !result.some((r) => r.id === user.id)) result.push(user);
    if (result.length === RECENT) break;
  }
  return result;
}

/**
 * Pessoas com conta, para escolher quem conduz ou prega uma liturgia.
 * Só id, nome e foto: o e-mail nunca sai daqui. Qualquer pessoa logada pode buscar
 * (quem monta uma liturgia pessoal também escolhe quem conduz); `/api/admin/users` segue só do Admin.
 *
 * `?for=preacher` troca quem vem primeiro com o campo vazio: quem pregou recentemente, em vez de quem
 * conduziu (o padrão, `?for=leader`).
 */
export async function GET(request: Request) {
  const live = await getLiveUserAuth();
  if (!live.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = new URL(request.url).searchParams;
  const q = params.get("q")?.trim() ?? "";
  const kind = params.get("for") === "preacher" ? "preacher" : "leader";

  // Campo ainda vazio: quem fez o papel nos últimos cultos da igreja vem primeiro, depois a ordem alfabética.
  // Só cultos publicados da igreja entram, para não expor liturgias pessoais de outras pessoas.
  const recentRows = q ? [] : kind === "preacher" ? await recentPreachers() : await recentLeaders();
  const recent: PersonOption[] = recentRows.flatMap((u) =>
    u.name ? [{ id: u.id, name: u.name, image: u.image, recent: true }] : []
  );

  const people = await prisma.user.findMany({
    where: {
      name: q ? { contains: q, mode: "insensitive" } : { not: null },
    },
    select: { id: true, name: true, image: true },
    orderBy: { name: "asc" },
    take: LIMIT + recent.length,
  });

  const recentIds = new Set(recent.map((p) => p.id));
  const rest = people.flatMap((p) =>
    p.name && !recentIds.has(p.id) ? [{ id: p.id, name: p.name, image: p.image } satisfies PersonOption] : []
  );
  return NextResponse.json([...recent, ...rest].slice(0, LIMIT + recent.length));
}
