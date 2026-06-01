import { archiveSong, retrieveSong, updateSongInfo } from "@/prisma/data";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slugOrId: string }> }
) {
  const { slugOrId } = await params;
  const song = await retrieveSong(slugOrId, {
    includeArrangements:
      request.nextUrl.searchParams.get("forceIncludeFirstLine") === "true",
    includeUnits: request.nextUrl.searchParams.get("includeUnits") === "true",
  });
  if (!song) {
    return new Response("Song not found", { status: 404 });
  }
  return new Response(JSON.stringify(song), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slugOrId: string }> }
) {
  const { slugOrId } = await params;
  const body = await request.json();

  if (body.isDeleted === true) {
    await archiveSong(slugOrId);
    return Response.json({ success: true });
  }

  if (body.title !== undefined || "artist" in body) {
    const data: { title?: string; artist?: string | null } = {};
    if (body.title !== undefined) data.title = body.title;
    if ("artist" in body) data.artist = body.artist ?? null;
    await updateSongInfo(slugOrId, data);
    return Response.json({ success: true });
  }

  return new Response("Bad request", { status: 400 });
}
