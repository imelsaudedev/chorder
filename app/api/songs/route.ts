import { getLiveUserAuth } from "@/lib/auth-guard";
import { canEditSongs, canSeeUsageStats } from "@/lib/permissions";
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
  const tagIds = (request.nextUrl.searchParams.get("tagIds") || "")
    .split(",")
    .map((id) => parseInt(id))
    .filter((id) => !isNaN(id));
  const live = await getLiveUserAuth();
  // Uso em liturgias é informação da equipe: quem não é da equipe nunca recebe, mesmo pedindo.
  const withUsageStats =
    request.nextUrl.searchParams.get("withUsageStats") === "true" && canSeeUsageStats(live.roles);

  const songs = await retrieveSongs({
    query,
    limitLines: limitLinesNumber,
    forceIncludeFirstLine,
    excludedSongSlugs,
    tagIds,
    withUsageStats,
  });
  // O id do Holyrics só serve a quem edita músicas.
  const visible = canEditSongs(live.roles) ? songs : songs.map((song) => ({ ...song, holyricsId: null }));
  return Response.json(visible);
}
