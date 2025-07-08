import { retrieveArrangement } from "@/prisma/data";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ slugOrId: string; arrangementId: string | "default" }>;
  }
) {
  const { slugOrId, arrangementId } = await params;
  const searchParams = request.nextUrl.searchParams;
  const includeUnits = searchParams.get("includeUnits") === "true";
  const includeSong = searchParams.get("includeSong") === "true";
  const arrangement = await retrieveArrangement(
    arrangementId === "default" ? null : parseInt(arrangementId),
    {
      songSlugOrId: slugOrId,
      includeUnits,
      includeSong,
    }
  );
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
