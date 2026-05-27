"use client";

import PageHeader from "@/components/common/PageHeader";
import KeyButtonSet from "@/components/config/KeyButtonSet";
import { useSongConfig } from "@/components/config/SongConfig";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ClientArrangement, ClientSong } from "@/prisma/models";
import YoutubeReferenceButton from "@/components/common/YoutubeReferenceButton";
import { NotebookPen, SlidersHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";
import ArrangementActionMenu from "./ArrangementActionMenu";
import ArrangementSelector from "./ArrangementSelector";
import Skeleton from "./Skeleton";
import SongConfig from "./SongConfig";

type ArrangementHeaderProps = {
  arrangement: ClientArrangement | null;
};
export default function ArrangementHeader({
  arrangement,
}: ArrangementHeaderProps) {
  const t = useTranslations("Messages");
  const { transpose, setTranspose } = useSongConfig();

  if (!arrangement) {
    return <Skeleton />;
  }

  const originalKey = arrangement.key ?? "";
  const hasMultipleArrangements = (arrangement.song?.arrangements?.length ?? 0) > 1;
  const hasContentActions = hasMultipleArrangements || originalKey || arrangement.youtubeUrl;

  return (
    <Popover>
      <PageHeader
        backLinkHref="/songs"
        backLinkText={t("songs")}
        title={arrangement.song!.title}
        subtitle={<Subtitle song={arrangement.song} />}
        actions={
          <div className="flex gap-2 items-center">
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon">
                <SlidersHorizontal />
                <span className="sr-only">{t("toggleConfig")}</span>
              </Button>
            </PopoverTrigger>
            <ArrangementActionMenu arrangement={arrangement} />
          </div>
        }
        contentActions={
          hasContentActions ? (
            <>
              {hasMultipleArrangements && (
                <ArrangementSelector
                  arrangements={arrangement.song!.arrangements!}
                  currentArrangementId={arrangement.id}
                />
              )}
              {originalKey && (
                <KeyButtonSet
                  originalKey={originalKey}
                  transpose={transpose}
                  setTranspose={setTranspose}
                />
              )}
              {arrangement.youtubeUrl && (
                <YoutubeReferenceButton
                  youtubeUrl={arrangement.youtubeUrl}
                  title={arrangement.song!.title}
                />
              )}
            </>
          ) : undefined
        }
      />

      <PopoverContent className="w-80" align="end">
        <SongConfig />
      </PopoverContent>
    </Popover>
  );
}

function Subtitle({ song }: { song?: ClientSong | null }) {
  if (!song?.artist) {
    return null;
  }

  return (
    <span className="flex items-center gap-1">
      <NotebookPen className="w-4 h-4" />
      {song.artist}
    </span>
  );
}
