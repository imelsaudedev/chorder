"use client";

import BackArrow from "@/components/BackArrow";
import Header from "@/components/Header";
import Main from "@/components/Main";
import VersionViewer from "../VersionViewer";
import EditIcon from "@/components/icons/EditIcon";
import AnchorButton from "@/components/AnchorButton";
import { Song } from "@/models/song";

type SongViewerProps = {
  song: Song;
  versionIdx: number;
};

export default function SongViewer({ song, versionIdx }: SongViewerProps) {
  return (
    <>
      <Header>
        <BackArrow href="/songs" />
        <div className="flex mx-4 gap-2 flex-grow justify-between items-center">
          <div className="flex flex-col">
            <span className="font-bold text-lg leading-none">
              {song?.title}
            </span>
            {song?.artist && <span className="text-sm">{song?.artist}</span>}
          </div>
          <div>
            <AnchorButton href={`?version=${versionIdx}&edit=true`}>
              <EditIcon />
            </AnchorButton>
          </div>
        </div>
      </Header>
      <Main className="pt-4">
        {song?.versions[versionIdx] && (
          <VersionViewer version={song.versions[versionIdx]} />
        )}
      </Main>
    </>
  );
}
