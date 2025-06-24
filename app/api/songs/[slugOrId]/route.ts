import { retrieveSong } from "@/prisma/data";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { slugOrId: string } }
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
