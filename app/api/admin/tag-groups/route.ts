import prisma from "@/prisma/client";
import { NextRequest } from "next/server";

export async function GET() {
  const groups = await prisma.tagGroup.findMany({
    orderBy: { order: "asc" },
    include: {
      tags: {
        orderBy: { name: "asc" },
        include: { _count: { select: { songs: true } } },
      },
    },
  });
  return Response.json(groups);
}

export async function POST(request: NextRequest) {
  const { name, color } = await request.json();
  if (!name?.trim()) return Response.json({ error: "Nome obrigatório" }, { status: 400 });

  const existing = await prisma.tagGroup.findUnique({ where: { name: name.trim() } });
  if (existing) return Response.json({ error: "Grupo já existe" }, { status: 409 });

  const last = await prisma.tagGroup.findFirst({ orderBy: { order: "desc" }, select: { order: true } });
  const group = await prisma.tagGroup.create({
    data: { name: name.trim(), color: color ?? "#6b7280", order: (last?.order ?? -1) + 1 },
  });
  return Response.json(group, { status: 201 });
}
