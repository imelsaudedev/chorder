import Header from '@/components/Header';
import NavBar from '@/components/NavBar';
import Heading from '@/components/Heading';
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
    <div className="flex">
      {/* Sidebar fixa */}
      <NavBar currentPage="songs" />

      {/* Conteúdo principal com deslocamento para a direita em telas grandes */}
      <div className="flex flex-col flex-grow ml-0 sm:ml-20">
        <div className="flex flex-col flex-grow justify-between gap-4 px-4 sm:px-12 lg:px-16 pt-8 sm:pt-12 lg:pt-16 pb-4 sm:pb-6 lg:pb-8">
          <Heading level={1}>Músicas</Heading>
        </div>

        <Main>
          <SongList songs={songs} />
        </Main>

        {/* Botão flutuante */}
        <div className="fixed bottom-24 right-4 sm:bottom-8 sm:right-8">
          <Button asChild variant="secondary" size="square" rounded="full" className="shadow-lg">
            <Link href="./songs/new" className="flex items-center gap-1 sm:pr-6">
              <Plus />
              <span className="hidden sm:inline">Nova música</span>
            </Link>
          </Button>
        </div>

        <ScrollToTopButton />
      </div>
    </div>
  );
}
