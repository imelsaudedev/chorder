import SongViewer from '@/fragments/SongViewer';
import { deleteArrangement, getSong, postSong } from './actions';
import { Song } from '@/models/song';
import { cache } from 'react';

export const dynamic = 'force-dynamic';

export default async function SongPage({
  params,
  searchParams,
}: {
  params: { song: string };
  searchParams: { edit?: string; arrangement?: number };
}) {
  const songSlug = params.song;
  const song =
    (songSlug && songSlug !== 'new' && (await cache((songSlug: string) => getSong(songSlug))(songSlug))) ||
    new Song({});
  const writeMode = searchParams.edit === 'true' || songSlug === 'new';

  return (
    <SongViewer
      song={song.serialize()}
      arrangementId={searchParams.arrangement || null}
      initialWriteMode={writeMode}
      postSong={postSong}
      deleteArrangement={deleteArrangement}
    />
  );
}
