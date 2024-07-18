import SongViewer from '@/fragments/SongViewer';
import { deleteArrangement, getSongOrCreate, moveArrangement, postSong } from './actions';
import Header from '@/components/Header';

export const dynamic = 'force-dynamic';

export default async function SongPage({
  params,
  searchParams,
}: {
  params: { song: string };
  searchParams: { edit?: string; arr?: number };
}) {
  const songSlug = params.song;
  const song = await getSongOrCreate(songSlug, searchParams.arr);
  const writeMode = searchParams.edit === 'true' || songSlug === 'new';

  return (
    <>
      <Header currentPage="songs" />
      <SongViewer
        song={song}
        writeMode={writeMode}
        postSong={postSong}
        deleteArrangement={deleteArrangement}
        moveArrangement={moveArrangement}
      />
    </>
  );
}
