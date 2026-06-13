import {
  deleteArrangement,
  retrieveArrangement,
  updateArrangement,
} from "@/prisma/data";
import prisma from "@/prisma/client";
import { arrangementSchema } from "@/schemas/arrangement";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ arrangementId: string }> }
) {
  const { arrangementId } = await params;
  const searchParams = request.nextUrl.searchParams;
  const includeUnits = searchParams.get("includeUnits") === "true";
  const includeSong = searchParams.get("includeSong") === "true";
  const arrangement = await retrieveArrangement(parseInt(arrangementId), {
    includeSong,
    includeUnits,
  });
  if (!arrangement) {
    return new Response("Arrangement not found", { status: 404 });
  }
  return new Response(JSON.stringify(arrangement), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ arrangementId: string }> }
) {
  const { arrangementId } = await params;
  const success = await deleteArrangement(parseInt(arrangementId));
  if (!success) {
    return new Response("Failed to delete arrangement", { status: 500 });
  }
  return new Response(null, { status: 204 });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ arrangementId: string }> }
) {
  const { arrangementId } = await params;
  const id = parseInt(arrangementId);
  const body = await request.json();

  if ("youtubeUrl" in body) {
    await prisma.songArrangement.update({
      where: { id },
      data: { youtubeUrl: body.youtubeUrl || null },
    });
  }

  if (Array.isArray(body.audios)) {
    const audios: { id?: number; url: string; label: string; order: number }[] = body.audios;
    const keptIds = audios.filter((a) => a.id).map((a) => a.id!);
    await prisma.arrangementAudio.deleteMany({
      where: {
        arrangementId: id,
        ...(keptIds.length > 0 ? { id: { notIn: keptIds } } : {}),
      },
    });
    for (const audio of audios) {
      if (audio.id) {
        await prisma.arrangementAudio.update({
          where: { id: audio.id },
          data: { label: audio.label, order: audio.order },
        });
      } else {
        await prisma.arrangementAudio.create({
          data: { arrangementId: id, url: audio.url, label: audio.label, order: audio.order },
        });
      }
    }
  }

  return Response.json({ success: true });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ arrangementId: string }> }
) {
  const { arrangementId } = await params;
  const arrangement = arrangementSchema.parse(await request.json());
  if (arrangement.id !== parseInt(arrangementId)) {
    return new Response("Arrangement ID mismatch", { status: 400 });
  }
  if (
    !arrangement.id ||
    !arrangement ||
    !arrangement.song ||
    !arrangement.units
  ) {
    return new Response("Invalid arrangement data", { status: 400 });
  }

  const createdArrangement = await updateArrangement(arrangement, {
    includeSong: true,
    includeUnits: true,
  });

  return new Response(JSON.stringify(createdArrangement), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
