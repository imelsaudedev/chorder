"use client";

import { useEffect, useState } from "react";

// Cache em memória — evita refazer a chamada ao oEmbed pro mesmo vídeo caso
// o popover de referências seja reaberto ou apareça em mais de um lugar.
const titleCache = new Map<string, string>();

// Só busca o título quando `url` não é nulo (ver uso em ServiceMediaReferences:
// passamos null enquanto o popover está fechado, pra não disparar uma
// chamada externa por música carregada na tela, só quando o usuário abre).
export function useYoutubeTitle(url: string | null): string | null {
  const [title, setTitle] = useState<string | null>(url ? titleCache.get(url) ?? null : null);

  useEffect(() => {
    if (!url) {
      setTitle(null);
      return;
    }
    const cached = titleCache.get(url);
    if (cached) {
      setTitle(cached);
      return;
    }
    setTitle(null);
    let active = true;
    fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active || !data?.title) return;
        titleCache.set(url, data.title);
        setTitle(data.title);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [url]);

  return title;
}
