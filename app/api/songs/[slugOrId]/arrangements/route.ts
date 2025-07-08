import { retrieveSongArrangements } from "@/prisma/data";
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
