import { retrieveSong } from "@/prisma/data";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const { slug } = await params;
  const song = await retrieveSong(slug);
  if (!song) {
    return new Response("Song not found", { status: 404 });
  }
  return new Response(JSON.stringify(song), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
