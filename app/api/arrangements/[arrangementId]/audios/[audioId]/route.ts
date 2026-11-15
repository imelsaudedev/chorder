import { removeArrangementAudio, renameArrangementAudio } from "@/prisma/data";
import { NextRequest } from "next/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ arrangementId: string; audioId: string }> }
) {
  const { arrangementId: arrangementIdStr, audioId: audioIdStr } = await params;
  const arrangementId = parseInt(arrangementIdStr);
  const audioId = parseInt(audioIdStr);
  if (isNaN(arrangementId) || isNaN(audioId)) {
    return new Response("Invalid ID", { status: 400 });
  }

  const removed = await removeArrangementAudio(arrangementId, audioId);
  if (!removed) {
    return new Response("Audio not found", { status: 404 });
  }

  return new Response(JSON.stringify(removed), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ arrangementId: string; audioId: string }> }
) {
  const { arrangementId: arrangementIdStr, audioId: audioIdStr } = await params;
  const arrangementId = parseInt(arrangementIdStr);
  const audioId = parseInt(audioIdStr);
  if (isNaN(arrangementId) || isNaN(audioId)) {
    return new Response("Invalid ID", { status: 400 });
  }

  const { label }: { label?: string } = await request.json();
  if (!label?.length) {
    return new Response("label é obrigatório", { status: 400 });
  }

  const renamed = await renameArrangementAudio(arrangementId, audioId, label);
  if (!renamed) {
    return new Response("Audio not found", { status: 404 });
  }

  return new Response(null, { status: 204 });
}
