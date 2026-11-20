import prisma from "@/prisma/client";
import { NextRequest } from "next/server";

// Body: { tagGroupId: number, ids: number[] } — nova ordem das tags do grupo (da primeira à última)
export async function POST(request: NextRequest) {
  const { tagGroupId, ids } = await request.json();
  if (!Number.isInteger(tagGroupId) || !Array.isArray(ids) || !ids.every(Number.isInteger)) {
    return Response.json({ error: "tagGroupId e ids são obrigatórios" }, { status: 400 });
  }

  // Só reordena tags que realmente são do grupo informado.
  const inGroup = await prisma.tag.findMany({ where: { tagGroupId }, select: { id: true } });
  const valid = new Set(inGroup.map((t) => t.id));
  if (!ids.every((id: number) => valid.has(id))) {
    return Response.json({ error: "há tags que não pertencem ao grupo" }, { status: 400 });
  }

  await prisma.$transaction(
    ids.map((id: number, index: number) => prisma.tag.update({ where: { id }, data: { order: index } }))
  );

  return new Response(null, { status: 204 });
}
