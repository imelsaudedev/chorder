"use client";

import { useFetchTagGroups } from "@/app/api/api-client";
import FloatingAddLink from "@/components/common/FloatingAddLink";
import TagFilter from "@/components/song/TagFilter";
import SongMetaModal from "@/components/song/SongMetaModal";
import ClientSongList from "@/components/song/SongList/ClientSongList";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";

type ClientSongsPageProps = { query: string };

export default function ClientSongsPage({ query }: ClientSongsPageProps) {
  const t = useTranslations("Messages");
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const { tagGroups } = useFetchTagGroups();

  return (
    <>
      {tagGroups.length > 0 && (
        <div className="mb-4">
          <TagFilter
            tagGroups={tagGroups}
            selectedTagIds={selectedTagIds}
            onChange={setSelectedTagIds}
          />
        </div>
      )}
      <ClientSongList query={query} tagIds={selectedTagIds} />

      <FloatingAddLink label={t("newSong")} onClick={() => setModalOpen(true)} />

      <SongMetaModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        loading={isNavigating}
        isNew
        onSave={(values) => {
          const params = new URLSearchParams();
          params.set("title", values.title.trim());
          if (values.artist) params.set("artist", values.artist.trim());
          setIsNavigating(true);
          setTimeout(() => router.push(`/songs/new?${params.toString()}`), 0);
          return false;
        }}
      />
    </>
  );
}
