import { createArrangementWithSong } from "@/prisma/data";
import { arrangementSchema } from "@/schemas/arrangement";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const arrangement = arrangementSchema.parse(await request.json());

  if (!arrangement || !arrangement.song || !arrangement.units) {
    return new Response("Invalid arrangement data", { status: 400 });
  }

  const createdArrangement = await createArrangementWithSong(arrangement, {
    includeSong: true,
    includeUnits: true,
  });

  return new Response(JSON.stringify(createdArrangement), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
