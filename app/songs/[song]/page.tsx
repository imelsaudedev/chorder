import SongViewer from '@/fragments/SongViewer';
import { deleteArrangement, getSong, postSong } from './actions';
import { Song } from '@/models/song';
import Header from '@/components/Header';

export const dynamic = 'force-dynamic';

export default async function SongPage({
  params,
  searchParams,
}: {
  params: { song: string };
  searchParams: { edit?: string; arrangement?: number };
}) {
  const songSlug = params.song;
  const song = (songSlug && songSlug !== 'new' && (await getSong(songSlug))) || new Song({});
  const writeMode = searchParams.edit === 'true' || songSlug === 'new';

  return (
    <>
      <Header currentPage="songs" />
      <SongViewer
        song={song.serialize()}
        arrangementId={searchParams.arrangement || null}
        initialWriteMode={writeMode}
        postSong={postSong}
        deleteArrangement={deleteArrangement}
      />
    </>
  );
}
