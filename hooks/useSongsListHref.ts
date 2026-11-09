"use client";

import { readSongsListMemory } from "@/lib/songs-list-memory";
import { useEffect, useState } from "react";

/**
 * Para onde o "Voltar" de uma música deve ir: a lista como estava (com busca,
 * categorias e ordenação) se a pessoa chegou nesta música por ela; senão, /songs.
 */
export default function useSongsListHref(slug: string | undefined): string {
  const [href, setHref] = useState("/songs");

  useEffect(() => {
    const memory = readSongsListMemory();
    setHref(memory && slug && memory.slug === slug ? memory.url : "/songs");
  }, [slug]);

  return href;
}
