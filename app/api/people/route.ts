import { getLiveUserAuth } from "@/lib/auth-guard";
import prisma from "@/prisma/client";
import { NextResponse } from "next/server";

export type PersonOption = { id: string; name: string; image: string | null };

const LIMIT = 8;

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
  const people = await prisma.user.findMany({
    where: {
      name: q ? { contains: q, mode: "insensitive" } : { not: null },
    },
    select: { id: true, name: true, image: true },
    orderBy: { name: "asc" },
    take: LIMIT,
  });

  return NextResponse.json(
    people.flatMap((p) => (p.name ? [{ id: p.id, name: p.name, image: p.image } satisfies PersonOption] : []))
  );
}
