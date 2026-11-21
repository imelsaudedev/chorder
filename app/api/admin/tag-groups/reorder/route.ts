import prisma from "@/prisma/client";
import { NextRequest } from "next/server";

// Body: { ids: number[] } — nova ordem desejada (do primeiro ao último)
export async function POST(request: NextRequest) {
  const { ids } = await request.json();
  if (!Array.isArray(ids)) return Response.json({ error: "ids obrigatório" }, { status: 400 });

  await prisma.$transaction(
    ids.map((id: number, index: number) =>
      prisma.tagGroup.update({ where: { id }, data: { order: index } })
    )
  );

  return new Response(null, { status: 204 });
}
