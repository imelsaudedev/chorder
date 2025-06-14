"use client";

import { useFetchSongs } from "@/app/api/api-client";
import SongListEntry from "@components/SongListEntry";
import { Skeleton } from "@ui/skeleton";
import { ClientSong } from "@/prisma/models";
import clsx from "clsx";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Fragment, ReactNode } from "react";
import BigLetter from "./BigLetter";
import InitialsNav from "./InitialsNav";

type SongListProps = {
  query?: string;
  excludedSongSlugs?: string[];
  initialsInSeparateRow?: boolean;
  onSelected?: (s: ClientSong) => void;
};

export default function SongList({
  query = "",
  excludedSongSlugs = [],
  initialsInSeparateRow = false,
  onSelected,
}: SongListProps) {
  const { songs, isLoading } = useFetchSongs({
    query,
    limitLines: 3,
    forceIncludeFirstLine: true,
    excludedSongSlugs,
  });
  const t = useTranslations("SongForm");

  if (isLoading) {
    return <SongListSkeleton />;
  }

  const songsByFirstLetter = groupSongsByFirstLetter(songs);
  songsByFirstLetter.forEach(sortByTitle);
  const existingInitials = Array.from(songsByFirstLetter.keys());
  existingInitials.sort();

  return (
    <>
      <InitialsNav existingInitials={existingInitials} />
      <section
        className={clsx({
          "grid grid-cols-[auto_1fr]": !initialsInSeparateRow,
        })}
      >
        {(!existingInitials || existingInitials.length === 0) && (
          <p className="text-muted text-center">{t("noSongs")}</p>
        )}
        {existingInitials.map((letter) => {
          const songs = songsByFirstLetter.get(letter);
          if (!songs) return null;
          return (
            <InitialAndSongs
              songs={songs}
              letter={letter}
              query={query}
              onSelected={onSelected}
              initialsInSeparateRow={initialsInSeparateRow}
              key={`${letter}--section`}
            />
          );
        })}
      </section>
    </>
  );
}

export function SongListSkeleton() {
  const lineWidths = [
    ["w-1/2", "w-1/3", "w-4/5", "w-3/4"],
    ["w-1/4", "w-1/5", "w-3/4", "w-2/3"],
    ["w-1/3", "w-1/4", "w-5/6", "w-1/2"],
  ];

  return (
    <>
      <InitialsNav existingInitials={[]} />
      <section className="grid grid-cols-[auto_1fr]">
        {new Array(3).fill(0).map((_, idx) => (
          <Fragment key={`skeleton-${idx}`}>
            <Skeleton className="col-span-2 md:col-span-1 my-4 mr-4 pt-2 bg-secondary/50 size-10 md:size-20" />
            <div className="col-span-2 md:col-span-1">
              {lineWidths.map((widths, idx) => (
                <div
                  className="flex flex-col items-start border-b border-zinc-100 py-4 sm:p-4 w-full sm:rounded-lg"
                  key={`skeleton-${idx}`}
                >
                  <Skeleton
                    className={clsx(widths[0], "h-6 bg-primary mb-1 sm:mb-2")}
                  />
                  <Skeleton
                    className={clsx(widths[1], "h-4 bg-zinc-400 mb-2")}
                  />
                  <div className="flex flex-col gap-1 w-full">
                    {widths.slice(2).map((width, idx) => (
                      <Skeleton
                        className={clsx("h-4 bg-zinc-200", width)}
                        key={`line-${idx}`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Fragment>
        ))}
      </section>
    </>
  );
}

type SongLinkProps = {
  songSlug: string;
  children: ReactNode;
};

function SongLink({ songSlug, children }: SongLinkProps) {
  return (
    <Link
      href={`/songs/${songSlug}`}
      className="flex flex-col items-start text-left text-zinc-400 border-b border-zinc-100 py-4 sm:p-4 w-full sm:rounded-lg hover:bg-zinc-100"
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
      className="flex flex-col items-start text-left pt-4 pb-4 border-b border-zinc-200 w-full"
      onClick={handleClick}
    >
      {children}
    </button>
  );
}

function sortByTitle(songs: { title: string }[]) {
  songs.sort((a, b) =>
    a.title.toLocaleLowerCase().localeCompare(b.title.toLocaleLowerCase())
  );
}

type InitialAndSongsProps = {
  letter: string;
  songs: ClientSong[];
  onSelected?: (s: ClientSong) => void;
  query: string;
  initialsInSeparateRow: boolean;
};

function InitialAndSongs({
  letter,
  songs,
  onSelected,
  query,
  initialsInSeparateRow,
}: InitialAndSongsProps) {
  return (
    <Fragment key={`${letter}--section`}>
      <BigLetter letter={letter} veryBig={!initialsInSeparateRow} />
      <div>
        {songs.map((song) => {
          return (
            <Fragment key={`song-${song.slug}`}>
              {!onSelected && (
                <SongLink songSlug={song.slug}>
                  <SongListEntry song={song} query={query} />
                </SongLink>
              )}
              {!!onSelected && (
                <SongButton song={song} onSelected={onSelected}>
                  <SongListEntry song={song} query={query} />
                </SongButton>
              )}
            </Fragment>
          );
        })}
      </div>
    </Fragment>
  );
}

function groupSongsByFirstLetter(
  songs: ClientSong[]
): Map<string, ClientSong[]> {
  const byFirstLetter = new Map<string, ClientSong[]>();

  songs.forEach((song) => {
    const firstLetter = song.title
      .trim()
      .charAt(0)
      .toLowerCase()
      .normalize("NFKD")
      .replace(/\p{Diacritic}/gu, "");
    let letterGroup = byFirstLetter.get(firstLetter);
    if (!letterGroup) {
      letterGroup = [];
      byFirstLetter.set(firstLetter, letterGroup);
    }

    letterGroup.push(song);
  });

  return byFirstLetter;
}
