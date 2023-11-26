"use client";

import BackArrow from "@/components/BackArrow";
import Header from "@/components/Header";
import Main from "@/components/Main";
import { Song } from "@/models/song";
import VersionViewer from "../VersionViewer";
import EditIcon from "@/components/icons/EditIcon";
import AnchorButton from "@/components/AnchorButton";

type SongViewerProps = {
  song: Song;
};

export default function SongViewer({ song }: SongViewerProps) {
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
            <AnchorButton href={`?edit=true`}>
              <EditIcon />
            </AnchorButton>
          </div>
        </div>
      </Header>
      <Main className="pt-4">
        {song?.versions[0] && <VersionViewer version={song.versions[0]} />}
      </Main>
    </>
  );
}
