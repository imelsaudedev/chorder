'use client';

import Heading from '@/components/Heading';
import HighlightKeyword, { findKeyword } from '@/components/HighlightKeyword';
import SearchBar from '@/components/SearchBar';
import useUpdateParams from '@/hooks/useUpdateParams';
import { groupSongsByFirstLetter, Song, WithoutArrangements } from '@/models/song';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Fragment, ReactNode, useMemo, useState } from 'react';

type SongListProps = {
  songs: WithoutArrangements<Song>[];
  initialsStyle?: 'grid' | 'row';
  onSelected?: (song: WithoutArrangements<Song>) => void;
};

export default function SongList({ songs: baseSongs, initialsStyle = 'grid', onSelected }: SongListProps) {
  const t = useTranslations('SongForm');
  const searchParams = useSearchParams();
  const updateParams = useUpdateParams();
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const handleSetSearch = (value: string) => {
    setSearch(value);
    updateParams('q', value);
  };

  const songs = useMemo(() => {
    if (!search) return baseSongs;
    const lowerSearch = search.toLocaleLowerCase();
    return baseSongs.filter(
      (song) =>
        song.title.toLocaleLowerCase().includes(lowerSearch) ||
        song.artist?.toLocaleLowerCase().includes(lowerSearch) ||
        song.lyrics.toLocaleLowerCase().includes(lowerSearch)
    );
  }, [baseSongs, search]);

  const songsByFirstLetter = useMemo(() => {
    const byFirstLetter = groupSongsByFirstLetter(songs);
    byFirstLetter.forEach((songs) =>
      songs.sort((a, b) => a.title.toLocaleLowerCase().localeCompare(b.title.toLocaleLowerCase()))
    );
    return byFirstLetter;
  }, [songs]);
  const existingInitials = useMemo(() => {
    const initials = Array.from(songsByFirstLetter.keys());
    initials.sort();
    return initials;
  }, [songsByFirstLetter]);
  const allInitials = useMemo(() => {
    const initials = Array.from(new Set([...Array.from('abcdefghijklmnopqrstuvwxyz'), ...existingInitials]));
    initials.sort();
    return initials;
  }, [existingInitials]);

  let sectionStyle = {};
  let initialsTitleClassName = 'font-bricolage text-xl md:text-4xl font-bold text-secondary py-2 text-left';
  if (initialsStyle === 'grid') {
    sectionStyle = { display: 'grid', gridTemplateColumns: 'auto 1fr' };
    initialsTitleClassName =
      'font-bricolage font-light text-4xl md:text-8xl col-span-2 md:col-span-1 pr-4 pt-2 text-secondary';
  }

  return (
    <>
      <div className="sm:px-6 lg:px-8">
        <div className="mb-4">
          <SearchBar value={search} setValue={handleSetSearch} />
        </div>
        <nav className="flex flex-wrap mb-4">
          {allInitials.map((initial) => {
            const className = 'font-bricolage text-xl px-2';
            if (existingInitials.indexOf(initial) < 0)
              return (
                <span key={`link-to--${initial}`} className={`${className} text-muted`}>
                  {initial.toUpperCase()}
                </span>
              );
            return (
              <a href={`#${initial}`} key={`link-to--${initial}`} className={`${className} text-secondary`}>
                {initial.toUpperCase()}
              </a>
            );
          })}
        </nav>
        <section style={sectionStyle}>
          {(!existingInitials || existingInitials.length === 0) && (
            <p className="text-muted text-center">{t('noSongs')}</p>
          )}
          {existingInitials.map((letter) => {
            const songs = songsByFirstLetter.get(letter);
            if (!songs) return null;
            return (
              <Fragment key={`${letter}--section`}>
                <span id={letter} className={initialsTitleClassName}>
                  {letter.toUpperCase()}
                </span>
                <div>
                  {songs.map((song) => {
                    const lyrics = song.lyrics
                      .split('\n')
                      .map((line) => line.trim())
                      .filter((line) => !!line);
                    let firstLines = lyrics.slice(0, 2);
                    if (
                      search &&
                      findKeyword(song.title, search) < 0 &&
                      (!song.artist || findKeyword(song.artist, search) < 0) &&
                      firstLines.every((line) => findKeyword(line, search) < 0)
                    ) {
                      firstLines = [lyrics[0]];
                      const lineWithSearch = lyrics.find((line) => findKeyword(line, search) >= 0);
                      if (lineWithSearch) {
                        firstLines.push('...');
                        firstLines.push(lineWithSearch);
                      }
                    }

                    return (
                      <AnchorOrButton song={song} onSelected={onSelected} key={`song-${song.slug}`}>
                        <Heading level={3}>
                          <HighlightKeyword text={song.title} keyword={search} />
                        </Heading>
                        {song.artist && (
                          <div className="flex text-sm items-center text-zinc-600 gap-1 mb-2">
                            <HighlightKeyword text={song.artist} keyword={search} />
                          </div>
                        )}
                        {firstLines.map((line, idx) => (
                          <p className="text-sm text-primary text-zinc-400" key={`line-${idx}`}>
                            <HighlightKeyword text={line} keyword={search} />
                          </p>
                        ))}
                      </AnchorOrButton>
                    );
                  })}
                </div>
              </Fragment>
            );
          })}
        </section>
      </div>
    </>
  );
}

type AnchorOrButtonProps = {
  song: WithoutArrangements<Song>;
  onSelected?: (song: WithoutArrangements<Song>) => void;
  children: ReactNode;
};

function AnchorOrButton({ song, onSelected, children }: AnchorOrButtonProps) {
  if (onSelected) {
    const handleClick = (event: React.MouseEvent) => {
      event.preventDefault();
      onSelected(song);
    };
    return (
      <button
        className="flex flex-col items-start text-left pt-4 pb-4 border-b border-zinc-200 w-full"
        onClick={handleClick}
      >
        {children}
      </button>
    );
  }
  return (
    <Link
      href={`/songs/${song.slug}`}
      className="flex flex-col items-start text-left text-zinc-400 border-b border-zinc-100 py-4 sm:p-4 w-full sm:rounded-lg hover:bg-zinc-100"
    >
      {children}
    </Link>
  );
}
