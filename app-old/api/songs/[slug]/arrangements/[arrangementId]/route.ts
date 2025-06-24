import { retrieveArrangement } from "@/prisma/data";

export async function GET(
  request: Request,
  { params }: { params: { slug: string; arrangementId: number | "default" } }
) {
  const { slug, arrangementId } = await params;
  const arrangement = await retrieveArrangement(arrangementId, {
    songSlug: slug,
    includeUnits: true,
    includeSong: true,
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
