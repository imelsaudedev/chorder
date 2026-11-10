import { parseTagGroupFields } from "@/lib/tag-fields";
import prisma from "@/prisma/client";
import { NextRequest } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { name, color } = body;

  const fields = parseTagGroupFields(body);
  if ("error" in fields) return Response.json({ error: fields.error }, { status: 400 });

  const data: { name?: string; color?: string } & typeof fields.data = { ...fields.data };
  if (name?.trim()) data.name = name.trim();
  if (color) data.color = color;

  const group = await prisma.tagGroup.update({ where: { id: parseInt(id) }, data });
  return Response.json(group);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const groupId = parseInt(id);

  const tagsWithSongs = await prisma.tag.findFirst({
    where: { tagGroupId: groupId, songs: { some: { isDeleted: false } } },
  });
  if (tagsWithSongs) {
    return Response.json(
      { error: "Grupo possui tags associadas a músicas" },
      { status: 409 }
    );
  }

  await prisma.tag.deleteMany({ where: { tagGroupId: groupId } });
  await prisma.tagGroup.delete({ where: { id: groupId } });
  return new Response(null, { status: 204 });
}
