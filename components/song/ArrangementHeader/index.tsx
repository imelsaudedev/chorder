"use client";

import { useUpdateSong } from "#api-client";
import PageHeader from "@/components/common/PageHeader";
import AudioReferenceButton from "@/components/common/AudioReferenceButton";
import YoutubeReferenceButton from "@/components/common/YoutubeReferenceButton";
import KeyButtonSet from "@/components/config/KeyButtonSet";
import { useSongConfig } from "@/components/config/SongConfig";
import { useSongMetaModal } from "@/components/song/SongMetaModal/context";
import SongTags from "@/components/song/SongTags";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ClientArrangement } from "@/prisma/models";
import { NotebookPen, SlidersHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";
import { mutate } from "swr";
import ArrangementActionMenu from "./ArrangementActionMenu";
import ArrangementSelector from "./ArrangementSelector";
import Skeleton from "./Skeleton";
import SongConfig from "./SongConfig";

type ArrangementHeaderProps = {
  arrangement: ClientArrangement | null;
};

export default function ArrangementHeader({ arrangement }: ArrangementHeaderProps) {
  if (!arrangement) return <Skeleton />;
  return <ArrangementHeaderContent arrangement={arrangement} />;
}

function ArrangementHeaderContent({ arrangement }: { arrangement: ClientArrangement }) {
  const t = useTranslations("Messages");
  const { transpose, setTranspose } = useSongConfig();
  const { updateSong } = useUpdateSong(arrangement.song!.slug);
  const { openSongMetaModal } = useSongMetaModal();

  const songTitle = arrangement.song!.title;
  const songArtist = arrangement.song!.artist ?? "";
  const songTags = arrangement.song!.tags ?? [];
  const originalKey = arrangement.key ?? "";
  const hasMultipleArrangements = (arrangement.song?.arrangements?.length ?? 0) > 1;
  const hasContentActions =
    songTags.length > 0 || hasMultipleArrangements || originalKey || arrangement.youtubeUrl || (arrangement.audios?.length ?? 0) > 0;

  const handleEditSong = () => {
    openSongMetaModal({
      defaultValues: { title: songTitle, artist: songArtist || null },
      defaultTags: songTags,
      onSave: async ({ title, artist, tagIds }) => {
        const unchanged =
          title === arrangement.song!.title &&
          (artist || null) === (arrangement.song!.artist || null) &&
          tagIds === undefined;
        if (unchanged) return;

        await updateSong({ title, artist, tagIds });
        mutate(
          (key: unknown) =>
            Array.isArray(key) &&
            typeof key[0] === "string" &&
            key[0].includes(`/api/songs/${arrangement.song!.slug}/arrangements`)
        );
      },
    });
  };

  return (
    <Popover>
        <PageHeader
          backLinkHref="/songs"
          backLinkText={t("songs")}
          title={songTitle}
          subtitle={
            songArtist ? (
              <span className="flex items-center gap-1">
                <NotebookPen size={16} className="shrink-0" />
                {songArtist}
              </span>
            ) : undefined
          }
          actions={
            <div className="flex gap-2 items-center">
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon">
                  <SlidersHorizontal />
                  <span className="sr-only">{t("toggleConfig")}</span>
                </Button>
              </PopoverTrigger>
              <ArrangementActionMenu
                arrangement={arrangement}
                onEditSong={handleEditSong}
              />
            </div>
          }
          contentActions={
            hasContentActions ? (
              <>
                {songTags.length > 0 && (
                  <div className="w-full">
                    <SongTags tags={songTags} />
                  </div>
                )}
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
                    title={songTitle}
                  />
                )}
                {(arrangement.audios?.length ?? 0) > 0 && (
                  <AudioReferenceButton
                    audios={arrangement.audios!}
                    title={songTitle}
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
