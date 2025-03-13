import Header from '@/components/Header';
import Main from '@/components/Main';
import { Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cachedRetrieveSongs } from '@/database/song';
import SongList from '@/fragments/SongList';
import { excludeArrangements } from '@/models/song';
import Link from 'next/link';
import ScrollToTopButton from '@/components/ScrollToTopButton';

export const dynamic = 'force-dynamic';

export default async function SongListPage() {
  const songs = (await cachedRetrieveSongs({})).map(excludeArrangements);

  return (
    <>
      <Header currentPage="songs" />
      <div className="px-4 sm:px-6 lg:px-8 mb-2 sm:mb-4">
        {/* Container flexível para o título e o botão */}
        <div className="flex items-center justify-between">
          <h1 className="font-bold text-3xl sm:text-4xl leading-none text-primary tracking-tighter flex items-center gap-2">
            <Music className="w-10 h-10" />
            Músicas
          </h1>

          <Button variant="secondary" asChild>
            <Link href="./songs/new" className="flex items-center gap-1">
              <Music className="w-5 h-5" />
              <span>Nova Música</span>
            </Link>
          </Button>
        </div>
      </div>
      <Main>
        <SongList songs={songs} />
      </Main>

      <ScrollToTopButton />
    </>
  );
}
