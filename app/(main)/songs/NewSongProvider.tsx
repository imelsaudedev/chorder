"use client";

import SongMetaModal from "@/components/song/SongMetaModal";
import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useMemo, useState } from "react";

type NewSongContextValue = { openNewSong: () => void };

const NewSongContext = createContext<NewSongContextValue | null>(null);

/** Abre o modal de nova música a partir do cabeçalho e do botão flutuante do celular. */
export function useNewSong(): NewSongContextValue {
  const ctx = useContext(NewSongContext);
  if (!ctx) throw new Error("useNewSong precisa estar dentro de NewSongProvider");
  return ctx;
}

export default function NewSongProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const openNewSong = useCallback(() => setOpen(true), []);
  const value = useMemo(() => ({ openNewSong }), [openNewSong]);

  return (
    <NewSongContext.Provider value={value}>
      {children}
      <SongMetaModal
        open={open}
        onOpenChange={setOpen}
        loading={isNavigating}
        isNew
        onSave={(values) => {
          const params = new URLSearchParams();
          params.set("title", values.title.trim());
          if (values.artist) params.set("artist", values.artist.trim());
          if (values.tagIds?.length) params.set("tagIds", values.tagIds.join(","));
          setIsNavigating(true);
          setTimeout(() => router.push(`/songs/new?${params.toString()}`), 0);
          return false;
        }}
      />
    </NewSongContext.Provider>
  );
}
