"use client";

import AdjustmentIcon from "@/app-old/lib/components/icons/AdjustmentIcon";
import PageHeader from "@/app-old/lib/components/PageHeader";
import { Button } from "@/components-old/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components-old/ui/collapsible";
import { Skeleton } from "@/components-old/ui/skeleton";
import { NotebookPen } from "lucide-react";
import { useTranslations } from "next-intl";
import { useArrangement, useSong } from "../ArrangementViewContext";
import ArrangementActionMenu from "./ArrangementActionMenu";
import ArrangementSelector from "./ArrangementSelector";
import SongConfig from "./SongConfig";
import { useSearchParams } from "next/navigation";

export default function ArrangementViewerHeader() {
  const t = useTranslations("Messages");
  const { song } = useSong();
  const { arrangement, arrangementId, setArrangementId } = useArrangement();

  const searchParams = useSearchParams();

  if (!song) {
    return <ArrangementViewerHeaderSkeleton />;
  }

  const subtitle = song.artist ? (
    <span className="flex items-center gap-1">
      <NotebookPen className="w-4 h-4" />
      {song.artist}
    </span>
  ) : null;

  const handleArrangementChange = (arrangementId: number) => {
    setArrangementId(arrangementId);
    const params = new URLSearchParams(searchParams);
    if (arrangementId) {
      params.set("arrangement", arrangementId.toString());
    } else {
      params.delete("arrangement");
    }
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}?${params.toString()}`
    );
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

function ArrangementViewerHeaderSkeleton() {
  const t = useTranslations("Messages");

  return (
    <PageHeader
      backLinkHref="/songs"
      backLinkText={t("songs")}
      title={<Skeleton className="h-10 w-72 my-2 bg-primary" />}
      subtitle={<Skeleton className="h-6 w-1/3 bg-zinc-500" />}
    />
  );
}
