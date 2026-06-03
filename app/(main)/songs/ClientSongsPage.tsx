"use client";

import { useNavigationLoader } from "@/components/common/NavigationLoader";
import SongMetaModal from "@/components/song/SongMetaModal";
import ClientSongList from "@/components/song/SongList/ClientSongList";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

type ClientSongsPageProps = { query: string };

export default function ClientSongsPage({ query }: ClientSongsPageProps) {
  const t = useTranslations("Messages");
  const { navigateTo } = useNavigationLoader();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <ClientSongList query={query} />

      <div className="fixed bottom-24 right-4 sm:bottom-8 sm:right-8">
        <Button
          variant="secondary"
          size="lg"
          className="rounded-full shadow-lg"
          onClick={() => setModalOpen(true)}
        >
          <Plus className="hidden sm:inline" />
          <span className="sm:hidden">
            <Plus />
          </span>
          <span className="hidden sm:inline">{t("newSong")}</span>
        </Button>
      </div>

      <SongMetaModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        isNew
        onSave={(values) => {
          const params = new URLSearchParams();
          params.set("title", values.title.trim());
          if (values.artist) params.set("artist", values.artist.trim());
          navigateTo(`/songs/new?${params.toString()}`);
        }}
      />
    </>
  );
}
