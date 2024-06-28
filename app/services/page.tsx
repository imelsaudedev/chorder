import AnchorButton from '@/components/AnchorButton';
import Main from '@/components/Main';
import PlusIcon from '@/components/icons/PlusIcon';
import { retrieveAllSongs } from '@/database/song';
import PageHeader from '@/fragments/PageHeader';
import { groupSongsByFirstLetter } from '@/models/song';
import { Fragment, cache } from 'react';

export default async function SongListPage() {
  const songs = await cache(() => retrieveAllSongs())();
  const songsByFirstLetter = groupSongsByFirstLetter(songs);
  const existingInitials = Array.from(songsByFirstLetter.keys());
  const allInitials = Array.from(new Set([...Array.from('abcdefghijklmnopqrstuvwxyz'), ...existingInitials]));
  allInitials.sort();
  existingInitials.sort();

  return (
    <>
      <PageHeader currentPage="services" />
      <Main className="pt-4">
        <nav className="mb-4">
          {allInitials.map((initial) => {
            const className = 'text-xl px-2';
            if (existingInitials.indexOf(initial) < 0)
              return (
                <span key={`link-to--${initial}`} className={`${className} text-gray-300`}>
                  {initial.toUpperCase()}
                </span>
              );
            return (
              <a href={`#${initial}`} key={`link-to--${initial}`} className={className}>
                {initial.toUpperCase()}
              </a>
            );
          })}
        </nav>
        <section style={{ display: 'grid', gridTemplateColumns: 'auto 1fr' }}>
          {existingInitials.map((letter) => {
            const songs = songsByFirstLetter.get(letter);
            if (!songs) return null;
            return (
              <Fragment key={`${letter}--section`}>
                <h2
                  id={letter}
                  className="text-4xl md:text-9xl col-span-2 md:col-span-1 pr-6 text-purple-400 text-center"
                >
                  {letter.toUpperCase()}
                </h2>
                <div>
                  {songs.map((song) => {
                    const lyrics = song.lyrics
                      .split('\n')
                      .map((line) => line.trim())
                      .filter((line) => !!line);
                    const firstLines = lyrics.slice(0, 2);

                    return (
                      <a
                        href={`/songs/${song.slug}`}
                        key={`song-${song.slug}`}
                        className="flex flex-col pt-2 pb-3 border-b-gray-300 border-b-2"
                      >
                        <div className="font-bold text-lg leading-none">{song.title}</div>
                        {song.artist && <div className="text-sm text-gray-400 leading-tight mb-1">{song.artist}</div>}
                        {firstLines.map((line, idx) => (
                          <p className="leading-tight" key={`line-${idx}`}>
                            {line}
                          </p>
                        ))}
                      </a>
                    );
                  })}
                </div>
              </Fragment>
            );
          })}
        </section>
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
