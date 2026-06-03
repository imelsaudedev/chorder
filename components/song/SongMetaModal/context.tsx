"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import SongMetaModal, { SongMeta } from "./index";

type OpenModalOptions = {
  defaultValues: Partial<SongMeta>;
  onSave: (values: SongMeta) => void | Promise<void>;
};

type SongMetaModalContextType = {
  openSongMetaModal: (opts: OpenModalOptions) => void;
};

const SongMetaModalContext = createContext<SongMetaModalContextType | null>(null);

export function SongMetaModalProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [defaultValues, setDefaultValues] = useState<Partial<SongMeta>>({});
  const [isLoading, setIsLoading] = useState(false);
  const onSaveRef = useRef<(values: SongMeta) => void | Promise<void>>(() => {});

  const openSongMetaModal = useCallback(({ defaultValues, onSave }: OpenModalOptions) => {
    setDefaultValues(defaultValues);
    onSaveRef.current = onSave;
    setOpen(true);
  }, []);

  const handleSave = async (values: SongMeta) => {
    setIsLoading(true);
    try {
      await onSaveRef.current(values);
    } finally {
      setIsLoading(false);
      setOpen(false);
    }
  };

  return (
    <SongMetaModalContext.Provider value={{ openSongMetaModal }}>
      {children}
      <SongMetaModal
        open={open}
        onOpenChange={setOpen}
        defaultValues={defaultValues}
        loading={isLoading}
        onSave={handleSave}
      />
    </SongMetaModalContext.Provider>
  );
}

export function useSongMetaModal() {
  const ctx = useContext(SongMetaModalContext);
  if (!ctx) throw new Error("useSongMetaModal must be used within SongMetaModalProvider");
  return ctx;
}
