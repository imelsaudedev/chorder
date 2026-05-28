import SongListEntry from "@/components/song/SongListEntry";
import { ClientSong } from "@/prisma/models";
import clsx from "clsx";
import Link from "next/link";
import { ReactNode } from "react";
import BigLetter from "./BigLetter";

type InitialAndSongsProps = {
  letter: string;
  songs: ClientSong[];
  onSelected?: (s: ClientSong) => void;
  query: string;
  veryBigInitial: boolean;
};

export default function InitialAndSongs({
  letter,
  songs,
  onSelected,
  query,
  veryBigInitial,
}: InitialAndSongsProps) {
  return (
    <>
      <BigLetter letter={letter} veryBig={veryBigInitial} />
      <div className="max-w-full">
        {songs.map((song) => (
          <SongLinkOrButton
            key={`song-${song.slug}`}
            song={song}
            onSelected={onSelected}
            query={query}
          />
        ))}
      </div>
    </>
  );
}

type SongLinkOrButtonProps = {
  song: ClientSong;
  onSelected?: (s: ClientSong) => void;
  query?: string;
};
function SongLinkOrButton({ song, onSelected, query }: SongLinkOrButtonProps) {
  if (onSelected) {
    return (
      <SongButton song={song} onSelected={onSelected}>
        <SongListEntry song={song} query={query} />
      </SongButton>
    );
  }
  return (
    <SongLink songSlug={song.slug} className="text-wrap">
      <SongListEntry song={song} query={query} />
    </SongLink>
  );
}

type SongLinkProps = {
  songSlug: string;
  children: ReactNode;
  className?: string;
};
function SongLink({ songSlug, children, className }: SongLinkProps) {
  return (
    <Link
      href={`/songs/${songSlug}`}
      className={clsx(
        "flex flex-col items-start text-left text-zinc-400 border-b border-zinc-100 py-4 sm:p-4 w-full sm:rounded-lg hover:bg-zinc-100 cursor-pointer",
        className
      )}
    >
      {children}
    </Link>
  );
}

type SongButtonProps = {
  song: ClientSong;
  onSelected: (s: ClientSong) => void;
  children: ReactNode;
};
function SongButton({ song, onSelected, children }: SongButtonProps) {
  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    onSelected(song);
  };
  return (
    <button
      className="flex flex-col items-start text-left pt-4 pb-4 border-b border-zinc-200 w-full cursor-pointer"
      onClick={handleClick}
    >
      {children}
    </button>
  );
}
