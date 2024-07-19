import Header from '@/components/Header';
import Main from '@/components/Main';
import PlusIcon from '@/components/icons/PlusIcon';
import { Button } from '@/components/ui/button';
import { cachedRetrieveSongs } from '@/database/song';
import SongList from '@/fragments/SongList';
import { excludeArrangements } from '@/models/song';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function SongListPage() {
  const songs = (await cachedRetrieveSongs({})).map(excludeArrangements);

  return (
    <>
      <Header currentPage="songs" />
      <Main>
        <SongList songs={songs} />
        <Button variant="secondary" className="p-0 rounded-full aspect-square fixed bottom-4 right-4" asChild>
          <Link href="./songs/new">
            <PlusIcon />
          </Link>
        </Button>
      </Main>
    </>
  );
}
