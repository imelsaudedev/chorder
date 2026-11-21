import prisma from "@/prisma/client";
import { NextRequest } from "next/server";

// POST /api/admin/tags/merge — move todas as associações de sourceId para targetId e deleta sourceId
export async function POST(request: NextRequest) {
  const { sourceId, targetId } = await request.json();
  if (!sourceId || !targetId || sourceId === targetId) {
    return Response.json({ error: "sourceId e targetId distintos são obrigatórios" }, { status: 400 });
  }

  const songsWithSource = await prisma.song.findMany({
    where: { tags: { some: { id: sourceId } } },
    select: { id: true },
  });

  for (const song of songsWithSource) {
    await prisma.song.update({
      where: { id: song.id },
      data: {
        tags: {
          disconnect: { id: sourceId },
          connect: { id: targetId },
        },
      },
    });
  }

  await prisma.tag.delete({ where: { id: sourceId } });

  return Response.json({ merged: songsWithSource.length });
}
