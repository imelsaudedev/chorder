import {
  deleteArrangement,
  retrieveArrangement,
  updateArrangement,
} from "@/prisma/data";
import { arrangementSchema } from "@/schemas/arrangement";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ arrangementId: string }> }
) {
  const { arrangementId } = await params;
  const searchParams = request.nextUrl.searchParams;
  const includeUnits = searchParams.get("includeUnits") === "true";
  const includeSong = searchParams.get("includeSong") === "true";
  const arrangement = await retrieveArrangement(parseInt(arrangementId), {
    includeSong,
    includeUnits,
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
  { params }: { params: Promise<{ arrangementId: string }> }
) {
  const { arrangementId } = await params;
  const success = await deleteArrangement(parseInt(arrangementId));
  if (!success) {
    return new Response("Failed to delete arrangement", { status: 500 });
  }
  return new Response(null, { status: 204 });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ arrangementId: string }> }
) {
  const { arrangementId } = await params;
  const arrangement = arrangementSchema.parse(await request.json());
  if (arrangement.id !== parseInt(arrangementId)) {
    return new Response("Arrangement ID mismatch", { status: 400 });
  }
  if (
    !arrangement.id ||
    !arrangement ||
    !arrangement.song ||
    !arrangement.units
  ) {
    return new Response("Invalid arrangement data", { status: 400 });
  }

  const createdArrangement = await updateArrangement(arrangement, {
    includeSong: true,
    includeUnits: true,
  });

  return new Response(JSON.stringify(createdArrangement), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
