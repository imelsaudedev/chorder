import { addArrangementAudio } from "@/prisma/data";
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

  const { url, label, order }: { url?: string; label?: string; order?: number } =
    await request.json();
  if (!url?.length || !label?.length) {
    return new Response("url e label são obrigatórios", { status: 400 });
  }

  const audio = await addArrangementAudio(arrangementId, { url, label, order });
  return new Response(JSON.stringify(audio), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
}
