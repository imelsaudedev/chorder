"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useNewSong } from "./NewSongProvider";

type SongsHeaderActionsProps = {
  canEdit?: boolean;
};

/** Ação do cabeçalho de Músicas: Nova música a partir do tablet; no celular vale o botão flutuante. */
export default function SongsHeaderActions({
  canEdit = true,
}: SongsHeaderActionsProps) {
  const t = useTranslations("Messages");
  const { openNewSong } = useNewSong();

  // Quem não edita músicas não vê a ação (em vez de um botão apagado).
  if (!canEdit) return null;

  return (
    <Button
      type="button"
      variant="secondary"
      className="max-sm:hidden"
      onClick={openNewSong}
    >
      <Plus />
      {t("newSong")}
    </Button>
  );
}
