import { makeArrangementDefault } from "@/prisma/data";
import { NextRequest } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: { arrangementId: string } }
) {
  const { arrangementId: arrangementIdStr } = await params;
  const arrangementId = parseInt(arrangementIdStr);
  if (isNaN(arrangementId)) {
    return new Response("Invalid arrangement ID", { status: 400 });
  }

  await makeArrangementDefault(arrangementId);

  return new Response(JSON.stringify({ isDefault: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
