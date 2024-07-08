import { retrieveSongs } from '@/database/song';
import { getDefaultArrangementId, RequiredArrangement, setArrangement, SongWith } from '@/models/song';

export const dynamic = 'force-dynamic'; // defaults to auto

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const songs = await retrieveSongs({}).then((songs) =>
    songs.map((song) => {
      song.currentArrangementId = getDefaultArrangementId(song);
      return setArrangement(song) as SongWith<RequiredArrangement>;
    })
  );

  return Response.json({ songs });
}
