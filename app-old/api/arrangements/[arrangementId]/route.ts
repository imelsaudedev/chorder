import { deleteArrangement, retrieveArrangement } from "@/prisma/data";

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

export async function DELETE(
  request: Request,
  { params }: { params: { arrangementId: number } }
) {
  const { arrangementId } = await params;
  const success = await deleteArrangement(arrangementId);
  if (!success) {
    return new Response("Failed to delete arrangement", { status: 500 });
  }
  return new Response(null, { status: 204 });
}
