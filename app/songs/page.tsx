import AnchorButton from '@/components/AnchorButton';
import Header from '@/components/Header';
import Main from '@/components/Main';
import PlusIcon from '@/components/icons/PlusIcon';
import { retrieveSongs } from '@/database/song';
import SongList from '@/fragments/SongList';

export const dynamic = 'force-dynamic';

export default async function SongListPage() {
  const songs = await retrieveSongs({ options: { excludeArrangements: true } });

  return (
    <>
      <Header currentPage="songs" />
      <Main>
        <SongList songs={songs} />
        <AnchorButton
          additionalClasses={[
            'bg-secondary',
            'text-secondary-foreground',
            'rounded-full',
            'aspect-square',
            'fixed',
            'bottom-4',
            'right-4',
            'border-none',
          ]}
          href="./songs/new"
        >
          <PlusIcon />
        </AnchorButton>
      </Main>
    </>
  );
}
