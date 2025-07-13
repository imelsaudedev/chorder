import Heading from "@/components/common/Heading";
import HighlightKeyword, {
  findKeyword,
} from "@/components/common/HighlightKeyword";
import { ClientSong } from "@/prisma/models";

type SongListEntry = {
  song: ClientSong;
  query?: string;
};

export default function SongListEntry({ song, query = "" }: SongListEntry) {
  const lyrics = song.lyrics
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => !!line);
  let firstLines = lyrics.slice(0, 2);
  if (
    query &&
    findKeyword(song.title, query) < 0 &&
    (!song.artist || findKeyword(song.artist, query) < 0) &&
    firstLines.every((line) => findKeyword(line, query) < 0)
  ) {
    firstLines = [lyrics[0]];
    const lineWithSearch = lyrics.find((line) => findKeyword(line, query) >= 0);
    if (lineWithSearch) {
      firstLines.push("...");
      firstLines.push(lineWithSearch);
    }
  }

  return (
    <>
      <Heading level={3}>
        <HighlightKeyword text={song.title} keyword={query} />
      </Heading>
      {song.artist && (
        <div className="flex text-sm items-center text-zinc-600 whitespace-pre-wrap mb-2">
          <HighlightKeyword text={song.artist} keyword={query} />
        </div>
      )}
      {firstLines.map((line, idx) => (
        <p className="text-sm text-primary text-zinc-400" key={`line-${idx}`}>
          <HighlightKeyword text={line} keyword={query} />
        </p>
      ))}
    </>
  );
}
