import { getLiveUserAuth } from "@/lib/auth-guard";
import prisma from "@/prisma/client";
import { NextResponse } from "next/server";

export type PersonOption = { id: string; name: string; image: string | null; recent?: boolean };

const LIMIT = 8;
const RECENT = 5;

/**
 * Pessoas com conta, para escolher quem conduz ou prega uma liturgia.
 * Só id, nome e foto: o e-mail nunca sai daqui. Qualquer pessoa logada pode buscar
 * (quem monta uma liturgia pessoal também escolhe quem conduz); `/api/admin/users` segue só do Admin.
 */
export async function GET(request: Request) {
  const live = await getLiveUserAuth();
  if (!live.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";

  // Campo ainda vazio: quem conduziu os últimos cultos da igreja vem primeiro, depois a ordem alfabética.
  // Só cultos publicados da igreja entram, para não expor liturgias pessoais de outras pessoas.
  const recentRows = q
    ? []
    : await prisma.serviceLeader.findMany({
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
  const recent: PersonOption[] = recentRows.flatMap((r) =>
    r.user?.name ? [{ id: r.user.id, name: r.user.name, image: r.user.image, recent: true }] : []
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
