import Header from '@/components/Header';
import Main from '@/components/Main';
import { Plus, Music } from 'lucide-react';
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
        <div className="flex items-center justify-between">
          <h1 className="font-bold text-3xl sm:text-4xl leading-none text-primary tracking-tighter flex items-center gap-2">
            <Music className="w-8 sm:w-10 h-8 sm:h-10" strokeWidth={2} />
            Músicas
          </h1>
        </div>
      </div>
      <Main>
        <SongList songs={songs} />
      </Main>

      {/* Botão flutuante */}
      <div className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8">
        <Button asChild variant="secondary" size="square" rounded="full" className="shadow-lg">
          <Link href="./songs/new" className="flex items-center gap-1 sm:pr-6">
            <Plus />
            <span className="hidden sm:inline">Nova música</span>
          </Link>
        </Button>
      </div>

      <ScrollToTopButton />
    </>
  );
}
