import AnchorButton from '@/components/AnchorButton';
import Main from '@/components/Main';
import PlusIcon from '@/components/icons/PlusIcon';
import { retrieveSongs } from '@/database/song';
import PageHeader from '@/fragments/PageHeader';
import SongList from '@/fragments/SongList';
import { cache } from 'react';

export default async function SongListPage() {
  const songs = await cache(() => retrieveSongs({}))();

  return (
    <>
      <PageHeader currentPage="songs" />
      <Main className="pt-4">
        <SongList songs={songs} />
        <AnchorButton
          additionalClasses={[
            'bg-purple-400',
            'text-white',
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
