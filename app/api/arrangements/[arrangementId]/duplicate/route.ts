import { requireSongEditor } from "@/lib/auth-guard";
import { duplicateArrangement } from "@/prisma/data";
import { NextRequest } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ arrangementId: string }> }
) {
  const guard = await requireSongEditor();
  if (!guard.ok) return guard.response;

  const { arrangementId: arrangementIdStr } = await params;
  const arrangementId = parseInt(arrangementIdStr);
  if (isNaN(arrangementId)) {
    return new Response("Invalid arrangement ID", { status: 400 });
  }

  const duplicatedArrangement = await duplicateArrangement(arrangementId);
  return new Response(JSON.stringify(duplicatedArrangement), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
