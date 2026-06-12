"use client";

import { ClientTag } from "@/prisma/models";
import { createContext, useCallback, useContext, useRef, useState } from "react";
import SongMetaModal, { SongMeta, SongMetaSavePayload } from "./index";

type OpenModalOptions = {
  defaultValues: Partial<SongMeta>;
  defaultTags?: ClientTag[];
  onSave: (values: SongMetaSavePayload) => void;
};

type SongMetaModalContextType = {
  openSongMetaModal: (opts: OpenModalOptions) => void;
};

const SongMetaModalContext = createContext<SongMetaModalContextType | null>(null);

export function SongMetaModalProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [defaultValues, setDefaultValues] = useState<Partial<SongMeta>>({});
  const [defaultTags, setDefaultTags] = useState<ClientTag[]>([]);
  const onSaveRef = useRef<(values: SongMetaSavePayload) => void>(() => {});

  const openSongMetaModal = useCallback(({ defaultValues, defaultTags, onSave }: OpenModalOptions) => {
    setDefaultValues(defaultValues);
    setDefaultTags(defaultTags ?? []);
    onSaveRef.current = onSave;
    setOpen(true);
  }, []);

  return (
    <SongMetaModalContext.Provider value={{ openSongMetaModal }}>
      {children}
      <SongMetaModal
        open={open}
        onOpenChange={setOpen}
        defaultValues={defaultValues}
        defaultTags={defaultTags}
        onSave={(values) => {
          onSaveRef.current(values);
        }}
      />
    </SongMetaModalContext.Provider>
  );
}

export function useSongMetaModal() {
  const ctx = useContext(SongMetaModalContext);
  if (!ctx) throw new Error("useSongMetaModal must be used within SongMetaModalProvider");
  return ctx;
}
