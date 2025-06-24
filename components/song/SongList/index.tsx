import { ClientSong } from "@/prisma/models";
import clsx from "clsx";
import { useTranslations } from "next-intl";
import InitialAndSongs from "./InitialAndSongs";
import InitialsNav from "./InitialsNav";

type SongListProps = {
  songs: ClientSong[];
  query?: string;
  initialsInSeparateRow?: boolean;
  onSelected?: (s: ClientSong) => void;
};

export default function SongList({
  songs,
  query = "",
  initialsInSeparateRow = false,
  onSelected,
}: SongListProps) {
  const t = useTranslations("SongForm");

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
              veryBigInitial={!initialsInSeparateRow}
              key={`${letter}--section`}
            />
          );
        })}
      </section>
    </>
  );
}

function sortByTitle(songs: { title: string }[]) {
  songs.sort((a, b) =>
    a.title.toLocaleLowerCase().localeCompare(b.title.toLocaleLowerCase())
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
