import AnchorButton from '@/components/AnchorButton';
import Main from '@/components/Main';
import PlusIcon from '@/components/icons/PlusIcon';
import { retrieveAllSongs } from '@/database/song';
import PageHeader from '@/fragments/PageHeader';
import { groupSongsByFirstLetter } from '@/models/song';
import { Fragment, cache } from 'react';

export default async function ServiceListPage() {
  return (
    <>
      <PageHeader currentPage="services" />
      <Main className="pt-4">
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
          href="./services/new"
        >
          <PlusIcon />
        </AnchorButton>
      </Main>
    </>
  );
}
