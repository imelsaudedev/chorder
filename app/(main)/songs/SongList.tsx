import { groupSongsByFirstLetter } from "@/models/song";
import { retrieveSongs } from "@/prisma/data";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Fragment, ReactNode } from "react";
import InitialsNav from "./InitialsNav";
import BigLetter from "./BigLetter";
import SongListEntry from "@/app/lib/components/SongListEntry";
import { ClientSong } from "@/prisma/models";
import { Skeleton } from "@/components/ui/skeleton";
import clsx from "clsx";

type SongListProps = {
  query?: string;
};

export default async function SongList({ query = "" }: SongListProps) {
  const songs = await retrieveSongs({
    query,
    limitLines: 3,
    forceIncludeFirstLine: true,
  });
  const t = await getTranslations("SongForm");

  const songsByFirstLetter = groupSongsByFirstLetter(songs);
  songsByFirstLetter.forEach(sortByTitle);
  const existingInitials = Array.from(songsByFirstLetter.keys());
  existingInitials.sort();

  return (
    <>
      <InitialsNav existingInitials={existingInitials} />
      <section className="grid grid-cols-[auto_1fr]">
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

function sortByTitle(songs: { title: string }[]) {
  songs.sort((a, b) =>
    a.title.toLocaleLowerCase().localeCompare(b.title.toLocaleLowerCase())
  );
}

type InitialAndSongsProps = {
  letter: string;
  songs: ClientSong[];
  query: string;
};

function InitialAndSongs({ letter, songs, query }: InitialAndSongsProps) {
  return (
    <Fragment key={`${letter}--section`}>
      <BigLetter letter={letter} />
      <div>
        {songs.map((song) => {
          return (
            <SongLink songSlug={song.slug} key={`song-${song.slug}`}>
              <SongListEntry song={song} query={query} />
            </SongLink>
          );
        })}
      </div>
    </Fragment>
  );
}
