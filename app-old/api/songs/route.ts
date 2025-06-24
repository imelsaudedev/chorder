import { retrieveSongs } from "@/prisma/data";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("query") || "";
  const limitLines = url.searchParams.get("limitLines");
  const forceIncludeFirstLine =
    url.searchParams.get("forceIncludeFirstLine") === "true";
  const limitLinesNumber = limitLines ? parseInt(limitLines) : undefined;
  const excludedSongSlugs = (url.searchParams.get("excludedSongSlugs") || "")
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
