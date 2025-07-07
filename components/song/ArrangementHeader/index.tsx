"use client";

import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ClientArrangement, ClientSong } from "@/prisma/models";
import { NotebookPen, Settings2 } from "lucide-react";
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

  if (!arrangement) {
    return <Skeleton />;
  }

  return (
    <Collapsible>
      <PageHeader
        backLinkHref="/songs"
        backLinkText={t("songs")}
        title={arrangement.song!.title}
        subtitle={<Subtitle song={arrangement.song} />}
        actions={
          <div className="flex gap-2 md:self-end">
            <ArrangementSelector
              arrangements={arrangement.song!.arrangements!}
              currentArrangementId={arrangement.id}
            />
            <ArrangementActionMenu arrangement={arrangement} />
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings2 />
                <span className="sr-only">{t("toggleConfig")}</span>
              </Button>
            </CollapsibleTrigger>
          </div>
        }
      />

      <CollapsibleContent>
        <SongConfig originalKey={arrangement?.key ?? ""} />
      </CollapsibleContent>
    </Collapsible>
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
