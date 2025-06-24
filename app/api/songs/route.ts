import { retrieveSongs } from "@/prisma/data";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query") || "";
  const limitLines = request.nextUrl.searchParams.get("limitLines");
  const forceIncludeFirstLine =
    request.nextUrl.searchParams.get("forceIncludeFirstLine") === "true";
  const limitLinesNumber = limitLines ? parseInt(limitLines) : undefined;
  const excludedSongSlugs = (
    request.nextUrl.searchParams.get("excludedSongSlugs") || ""
  )
    .split(",")
    .map((slug) => slug.trim())
    .filter(Boolean);

  const songs = await retrieveSongs({
    query,
    limitLines: limitLinesNumber,
    forceIncludeFirstLine,
    excludedSongSlugs,
  });
  return Response.json(songs);
}
