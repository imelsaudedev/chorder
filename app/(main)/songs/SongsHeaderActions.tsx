"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useNewSong } from "./NewSongProvider";

/** Ação do cabeçalho de Músicas: Nova música a partir do tablet; no celular vale o botão flutuante. */
export default function SongsHeaderActions() {
  const t = useTranslations("Messages");
  const { openNewSong } = useNewSong();

  return (
    <Button type="button" variant="secondary" className="max-sm:hidden" onClick={openNewSong}>
      <Plus />
      {t("newSong")}
    </Button>
  );
}
