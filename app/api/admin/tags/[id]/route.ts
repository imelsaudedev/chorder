import prisma from "@/prisma/client";
import { NextRequest } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { name } = await request.json();
  if (!name?.trim()) return Response.json({ error: "Nome obrigatório" }, { status: 400 });

  const tag = await prisma.tag.update({
    where: { id: parseInt(id) },
    data: { name: name.trim() },
    include: { group: { select: { id: true, name: true, color: true } } },
  });
  return Response.json(tag);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const tagId = parseInt(id);

  const count = await prisma.song.count({ where: { tags: { some: { id: tagId } } } });
  if (count > 0) {
    return Response.json(
      { error: `Tag está associada a ${count} música${count > 1 ? "s" : ""}` },
      { status: 409 }
    );
  }

  await prisma.tag.delete({ where: { id: tagId } });
  return new Response(null, { status: 204 });
}
