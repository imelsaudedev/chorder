import { retrieveSongs } from "@/prisma/data";

export async function GET(request: Request) {
  const songs = await retrieveSongs();
  return Response.json(songs);
}
