import { groupSongsByFirstLetter, Song } from '@/models/song';
import Link from 'next/link';
import { Fragment, ReactNode } from 'react';

type SongListProps = {
  songs: Song[];
  initialsStyle?: 'grid' | 'row';
  onSelected?: (song: Song, arrangementId: number) => void;
};

export default function SongList({ songs, initialsStyle = 'grid', onSelected }: SongListProps) {
  const songsByFirstLetter = groupSongsByFirstLetter(songs);
  const existingInitials = Array.from(songsByFirstLetter.keys());
  const allInitials = Array.from(new Set([...Array.from('abcdefghijklmnopqrstuvwxyz'), ...existingInitials]));
  allInitials.sort();
  existingInitials.sort();

  let sectionStyle = {};
  let initialsTitleClassName =
    'text-xl md:text-2xl font-bold bg-secondary text-secondary-foreground text-white p-2 text-center';
  if (initialsStyle === 'grid') {
    sectionStyle = { display: 'grid', gridTemplateColumns: 'auto 1fr' };
    initialsTitleClassName = 'text-4xl md:text-9xl col-span-2 md:col-span-1 pr-6 text-secondary text-center';
  }

  return (
    <>
      <nav className="mb-4">
        {allInitials.map((initial) => {
          const className = 'text-xl px-2 text-primary';
          if (existingInitials.indexOf(initial) < 0)
            return (
              <span key={`link-to--${initial}`} className={`${className} text-muted`}>
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
      <section style={sectionStyle}>
        {existingInitials.map((letter) => {
          const songs = songsByFirstLetter.get(letter);
          if (!songs) return null;
          return (
            <Fragment key={`${letter}--section`}>
              <h2 id={letter} className={initialsTitleClassName}>
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
                    <AnchorOrButton song={song} onSelected={onSelected} key={`song-${song.slug}`}>
                      <div className="font-bold text-lg leading-none text-primary">{song.title}</div>
                      {song.artist && <div className="text-sm text-muted leading-tight mb-1">{song.artist}</div>}
                      {firstLines.map((line, idx) => (
                        <p className="leading-tight" key={`line-${idx}`}>
                          {line}
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
    </>
  );
}

type AnchorOrButtonProps = {
  song: Song;
  onSelected?: (song: Song, arrangementId: number) => void;
  children: ReactNode;
};

function AnchorOrButton({ song, onSelected, children }: AnchorOrButtonProps) {
  if (onSelected) {
    const handleClick = (event: React.MouseEvent) => {
      event.preventDefault();
      onSelected(song, song.defaultArrangementId);
    };
    return (
      <button className="flex flex-col pt-2 pb-3 border-b-gray-300 border-b-2 w-full" onClick={handleClick}>
        {children}
      </button>
    );
  }
  return (
    <Link href={`/songs/${song.slug}`} className="flex flex-col pt-2 pb-3 border-b-gray-300 border-b-2">
      {children}
    </Link>
  );
}
