import { canEditServiceArrangementCopy } from "@/lib/arrangement-copy-access";
import { getLiveUserAuth, requireSongEditor } from "@/lib/auth-guard";
import {
  deleteArrangement,
  retrieveArrangement,
  updateArrangement,
  updateServiceArrangementUnits,
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
  const guard = await requireSongEditor();
  if (!guard.ok) return guard.response;

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
  const guard = await requireSongEditor();
  if (!guard.ok) return guard.response;

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
    const audios: { id?: number; url: string; label: string; order: number }[] =
      body.audios;
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
          data: {
            arrangementId: id,
            url: audio.url,
            label: audio.label,
            order: audio.order,
          },
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
  const guard = await requireSongEditor();
  if (!guard.ok) {
    // Quem não edita músicas pode salvar a cifra da cópia que está na liturgia que ele edita
    // ("Só nesta liturgia"): só a cifra dessa cópia, nunca a música, o original ou as mídias.
    const live = await getLiveUserAuth();
    const copyId = parseInt(arrangementId);
    const preserveMedia = request.nextUrl.searchParams.get("preserveMedia") === "true";
    if (!preserveMedia || !(await canEditServiceArrangementCopy(copyId, live))) return guard.response;
    const body = arrangementSchema.parse(await request.json());
    if (body.id !== copyId || !body.units) {
      return new Response("Invalid arrangement data", { status: 400 });
    }
    return Response.json(await updateServiceArrangementUnits(copyId, body.units));
  }

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

  const preserveMedia =
    request.nextUrl.searchParams.get("preserveMedia") === "true";
  const createdArrangement = await updateArrangement(arrangement, {
    includeSong: true,
    includeUnits: true,
    preserveMedia,
  });

  return new Response(JSON.stringify(createdArrangement), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
