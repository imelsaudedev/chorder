"use client";

import { X } from "lucide-react";
import { useYoutubePlayer } from "./context";

function extractYoutubeId(url: string): string | null {
  const patterns = [
    /[?&]v=([^&#]+)/,
    /youtu\.be\/([^?&#]+)/,
    /youtube\.com\/embed\/([^?&#]+)/,
    /youtube\.com\/shorts\/([^?&#]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export default function YoutubePlayerWidget() {
  const { url, title, isOpen, close } = useYoutubePlayer();

  if (!isOpen || !url) return null;

  const videoId = extractYoutubeId(url);
  if (!videoId) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] shadow-2xl rounded-xl overflow-hidden border border-zinc-200 bg-black">
      <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900">
        <span className="text-white text-xs font-medium truncate max-w-48">
          {title ?? "Referência"}
        </span>
        <button
          type="button"
          className="h-6 w-6 flex items-center justify-center text-white rounded hover:bg-zinc-700"
          onClick={close}
        >
          <X size={14} />
        </button>
      </div>
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
        allow="autoplay; encrypted-media"
        allowFullScreen
        className="w-72 aspect-video block"
      />
    </div>
  );
}
