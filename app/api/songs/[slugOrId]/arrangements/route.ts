import { createMinimalArrangementForSong, retrieveSongArrangements } from "@/prisma/data";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slugOrId: string }> }
) {
  const { slugOrId } = await params;
  const searchParams = request.nextUrl.searchParams;
  const includeUnits = searchParams.get("includeUnits") === "true";
  const includeSong = searchParams.get("includeSong") === "true";
  const arrangements = await retrieveSongArrangements(slugOrId, {
    includeUnits,
    includeSong,
  });
  if (!arrangements) {
    return new Response("Arrangements not found", { status: 404 });
  }
  return new Response(JSON.stringify(arrangements), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

// Cria (ou reaproveita, se já existir) um arranjo mínimo sem cifra para a
// música — usado quando uma música é adicionada à liturgia sem nenhum
// arranjo ainda, e alguém quer anexar a primeira referência de mídia a ela.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slugOrId: string }> }
) {
  const { slugOrId } = await params;
  const arrangement = await createMinimalArrangementForSong(slugOrId);
  return new Response(JSON.stringify(arrangement), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
}
