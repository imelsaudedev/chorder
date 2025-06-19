import { retrieveArrangement } from "@/prisma/data";

export async function GET(
  request: Request,
  { params }: { params: { arrangementId: number } }
) {
  const { arrangementId } = await params;
  const arrangement = await retrieveArrangement(arrangementId, {
    includeSong: true,
    includeUnits: true,
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
