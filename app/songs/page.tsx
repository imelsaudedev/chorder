import Header from "@/components/Header";
import Main from "@/components/Main";
import messages from "@/i18n/messages";
import { fetchAllSongs } from "@/models/song";

export default async function SongListPage() {
  const songs = await fetchAllSongs();

  return (
    <>
      <Header>
        <span className="font-bold text-lg leading-none">
          {messages.messages.songs}
        </span>
      </Header>
      <Main className="pt-4">
        {songs.map((song) => {
          const lyrics = song.lyrics
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => !!line);
          const firstLines = lyrics.slice(0, 2);

          return (
            <a
              href={`/songs/${song.id}`}
              key={`song-${song.id}`}
              className="flex flex-col pt-2 pb-3 border-b-gray-300 border-b-2"
            >
              <div className="font-bold text-lg leading-none">{song.title}</div>
              {song.artist && (
                <div className="text-sm text-gray-400 leading-tight mb-1">
                  {song.artist}
                </div>
              )}
              {firstLines.map((line, idx) => (
                <p className="leading-tight" key={`line-${idx}`}>
                  {line}
                </p>
              ))}
            </a>
          );
        })}
      </Main>
    </>
  );
}
