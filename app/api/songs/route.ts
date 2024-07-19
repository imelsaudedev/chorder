import { cachedRetrieveSongs } from '@/database/song';
import {
  excludeArrangements,
  getDefaultArrangementId,
  RequiredArrangement,
  setArrangement,
  Song,
  SongWith,
} from '@/models/song';
import { Filter } from 'mongodb';

export const dynamic = 'force-dynamic'; // defaults to auto

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const shouldExcludeArrangements = searchParams.get('exclude-arrangements') === 'true';
  const shouldSelectArrangement = searchParams.get('select-arrangement') === 'true';
  const slug = searchParams.get('slug');

  const filter: Filter<Song> = {};
  if (slug) {
    filter.slug = slug;
  }
  const songs = await cachedRetrieveSongs({ filter }).then((songs) =>
    songs.map((song) => {
      let returnSong = song;
      if (shouldSelectArrangement) {
        returnSong.currentArrangementId = getDefaultArrangementId(returnSong);
        returnSong = setArrangement(returnSong) as SongWith<RequiredArrangement>;
      }
      if (shouldExcludeArrangements) {
        return excludeArrangements(returnSong);
      }
      return returnSong;
    })
  );

  if (slug) {
    if (songs.length === 0) {
      return Response.json({ song: null });
    }
    return Response.json({ song: songs[0] });
  }
  return Response.json({ songs });
}
