import SongListEntry from "@/components/song/SongListEntry";
import { ClientSong } from "@/prisma/models";
import BigLetter from "./BigLetter";

type InitialAndSongsProps = {
  letter: string;
  songs: ClientSong[];
  onSelected?: (s: ClientSong) => void;
  query: string;
};

export default function InitialAndSongs({
  letter,
  songs,
  onSelected,
  query,
}: InitialAndSongsProps) {
  return (
    <div>
      <BigLetter letter={letter} />
      <div>
        {songs.map((song) => (
          <SongListEntry
            key={`song-${song.slug}`}
            song={song}
            onSelected={onSelected}
            query={query}
          />
        ))}
      </div>
    </div>
  );
}
