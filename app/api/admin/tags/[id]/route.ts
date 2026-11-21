import { parseTagFields } from "@/lib/tag-fields";
import prisma from "@/prisma/client";
import { NextRequest } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { name } = body;
  // O nome continua opcional no PATCH, mas se vier não pode ser vazio.
  if (name !== undefined && !String(name).trim()) {
    return Response.json({ error: "Nome obrigatório" }, { status: 400 });
  }
  const fields = parseTagFields(body);
  if ("error" in fields) return Response.json({ error: fields.error }, { status: 400 });
  if (name === undefined && Object.keys(fields.data).length === 0) {
    return Response.json({ error: "Nada para atualizar" }, { status: 400 });
  }

  const tag = await prisma.tag.update({
    where: { id: parseInt(id) },
    data: { ...fields.data, ...(name !== undefined && { name: String(name).trim() }) },
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

  // Só músicas ativas travam; as arquivadas são soltas junto (a ligação some em cascata).
  const count = await prisma.song.count({ where: { isDeleted: false, tags: { some: { id: tagId } } } });
  if (count > 0) {
    return Response.json(
      { error: `Tag está associada a ${count} música${count > 1 ? "s" : ""}` },
      { status: 409 }
    );
  }

  await prisma.tag.delete({ where: { id: tagId } });
  return new Response(null, { status: 204 });
}
