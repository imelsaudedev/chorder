import { retrieveSongs } from '@/database/song';

export const dynamic = 'force-dynamic'; // defaults to auto

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const songs = await retrieveSongs({}).then((songs) => songs.map((song) => song.serialize()));

  return Response.json({ songs });
}
