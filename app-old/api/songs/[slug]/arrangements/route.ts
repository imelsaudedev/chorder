import { retrieveSongArrangements } from "@/prisma/data";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = await params;
  const searchParams = request.nextUrl.searchParams;
  const includeUnits = searchParams.get("includeUnits");
  const arrangements = await retrieveSongArrangements(
    slug,
    includeUnits === "true"
  );
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
