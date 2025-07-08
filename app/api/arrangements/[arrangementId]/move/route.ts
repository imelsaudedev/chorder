import { moveArrangement } from "@/prisma/data";
import { NextRequest } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ arrangementId: string }> }
) {
  const { arrangementId: arrangementIdStr } = await params;
  const arrangementId = parseInt(arrangementIdStr);
  if (isNaN(arrangementId)) {
    return new Response("Invalid arrangement ID", { status: 400 });
  }
  const { targetSong }: { targetSong: string } = await request.json();
  if (!targetSong?.length) {
    return new Response("Target song is required", { status: 400 });
  }

  await moveArrangement(arrangementId, targetSong);

  return new Response(JSON.stringify({ moved: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
