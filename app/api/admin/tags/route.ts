import prisma from "@/prisma/client";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const { name, tagGroupId } = await request.json();
  if (!name?.trim() || !tagGroupId) {
    return Response.json({ error: "Nome e grupo são obrigatórios" }, { status: 400 });
  }

  const existing = await prisma.tag.findUnique({
    where: { name_tagGroupId: { name: name.trim(), tagGroupId } },
  });
  if (existing) return Response.json({ error: "Tag já existe neste grupo" }, { status: 409 });

  // Anti-sprawl: buscar tags com nome similar (distância de edição simples)
  const similar = await prisma.tag.findMany({
    where: {
      name: { contains: name.trim().substring(0, Math.max(3, name.trim().length - 2)), mode: "insensitive" },
    },
    include: { group: { select: { id: true, name: true, color: true } } },
    take: 3,
  });

  const tag = await prisma.tag.create({
    data: { name: name.trim(), tagGroupId },
    include: { group: { select: { id: true, name: true, color: true } } },
  });

  return Response.json({ tag, similar: similar.filter((s) => s.id !== tag.id) }, { status: 201 });
}
