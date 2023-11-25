"use client";

import BackArrow from "@/components/BackArrow";
import Header from "@/components/Header";
import Main from "@/components/Main";
import { Song } from "@/models/song";
import VersionViewer from "../VersionViewer";

type SongViewerProps = {
  song: Song;
};

export default function SongViewer({ song }: SongViewerProps) {
  return (
    <>
      <Header>
        <BackArrow href="/songs" />
        <div className="flex mx-4 gap-2">
          <div className="flex flex-col">
            <span className="font-bold">{song?.title}</span>
            {song?.artist && (
              <span className="text-gray-500">{song?.artist}</span>
            )}
          </div>
        </div>
      </Header>
      <Main className="pt-4">
        {song?.versions[0] && <VersionViewer version={song.versions[0]} />}
      </Main>
    </>
  );
}
