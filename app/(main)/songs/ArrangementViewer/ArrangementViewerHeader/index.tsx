"use client";

import AdjustmentIcon from "@components/icons/AdjustmentIcon";
import PageHeader from "@components/PageHeader";
import { Button } from "@ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@ui/collapsible";
import { NotebookPen } from "lucide-react";
import { useTranslations } from "next-intl";
import { useArrangement, useSong } from "../ArrangementViewContext";
import ArrangementActionMenu from "./ArrangementActionMenu";
import ArrangementSelector from "./ArrangementSelector";
import SongConfig from "./SongConfig";

export default function ArrangementViewerHeader() {
  const t = useTranslations("Messages");
  const { song } = useSong();
  const { arrangement, arrangementId, setArrangementId } = useArrangement();

  if (!song) {
    return null;
  }

  const subtitle = song.artist ? (
    <span className="flex items-center gap-1">
      <NotebookPen className="w-4 h-4" />
      {song.artist}
    </span>
  ) : null;

  const handleArrangementChange = (arrangementId: number) => {
    setArrangementId(arrangementId);
  };

  return (
    <Collapsible>
      <PageHeader
        backLinkHref="/songs"
        backLinkText={t("songs")}
        title={song.title}
        subtitle={subtitle}
        actions={
          <div className="flex gap-2 md:self-end">
            <ArrangementSelector
              songSlug={song.slug}
              onArrangementChange={handleArrangementChange}
              initialArrangementId={arrangementId}
            />
            <ArrangementActionMenu
              songSlug={song.slug}
              arrangementId={arrangementId}
            />
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="icon">
                <AdjustmentIcon />
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
