"use client";

import AudioReferenceButton from "@/components/common/AudioReferenceButton";
import HighlightKeyword from "@/components/common/HighlightKeyword";
import YoutubeReferenceButton from "@/components/common/YoutubeReferenceButton";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClientArrangement, ClientSong } from "@/prisma/models";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const BTN_SM = "h-7 w-7";

function isSectionMarker(line: string): boolean {
  if (line.startsWith("{")) return true;
  if (line.length < 40 && /^[^\n]{1,30}:$/.test(line)) return true;
  return false;
}

function getVerse1Lines(lyrics: string): string[] {
  const result: string[] = [];
  let started = false;
  for (const raw of lyrics.split("\n")) {
    const line = raw.trim();
    if (isSectionMarker(line)) {
      if (started) break;
      continue;
    }
    if (!line) {
      if (started) break;
      continue;
    }
    started = true;
    result.push(line);
  }
  return result;
}

function getArrangementLabel(
  arr: ClientArrangement,
  index: number,
  total: number
): string {
  if (arr.name?.trim()) return arr.name.trim();
  if (total === 1) return "Arranjo principal";
  return `Arranjo ${index + 1}`;
}

type SongListEntryProps = {
  song: ClientSong;
  query?: string;
  onSelected?: (song: ClientSong) => void;
};

export default function SongListEntry({
  song,
  query = "",
  onSelected,
}: SongListEntryProps) {
  const arrangements = (song.arrangements ?? []).filter(
    (a) => !a.isServiceArrangement && !a.isDeleted
  );

  const defaultIdx = Math.max(0, arrangements.findIndex((a) => a.isDefault));
  const [selectedIdx, setSelectedIdx] = useState(String(defaultIdx));

  const selectedArr = arrangements[Number(selectedIdx)] ?? arrangements[0];
  const playTitle = selectedArr?.name?.trim()
    ? `${song.title} — ${selectedArr.name.trim()}`
    : song.title;

  const verse1Lines = getVerse1Lines(song.lyrics);

  const hasAnyMedia = arrangements.some((a) => a.youtubeUrl || a.audioUrl);

  const arrangementDropdown =
    arrangements.length > 1 && hasAnyMedia ? (
      <Select value={selectedIdx} onValueChange={setSelectedIdx}>
        <SelectTrigger size="compact" className="w-full border-zinc-200">
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="end">
          {arrangements.map((arr, i) => (
            <SelectItem key={i} value={String(i)} className="text-xs">
              {getArrangementLabel(arr, i, arrangements.length)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    ) : null;

  return (
    // Mobile: 2 cols [title | icons]
    // Tablet: 3 cols [title | lyrics | (dropdown+icons)]
    // Desktop: 4 cols [title | lyrics | dropdown | icons]
    // display:none removes children from grid flow, enabling correct column count per breakpoint
    <div className="relative grid grid-cols-[1fr_auto] md:grid-cols-[2fr_3fr_12rem] lg:grid-cols-[2fr_3fr_8rem_5rem] items-start gap-x-2 py-2.5 px-2 hover:bg-zinc-50 transition-colors group">

      {/* Overlay: navega em modo lista, seleciona em modo picker */}
      {onSelected ? (
        <button
          type="button"
          className="absolute inset-0 z-0 w-full"
          aria-label={song.title}
          onClick={() => onSelected(song)}
        />
      ) : (
        <Link href={`/songs/${song.slug}`} className="absolute inset-0 z-0" aria-label={song.title} />
      )}

      {/* Col 1 — título e artista */}
      <div className="relative z-10 min-w-0 pointer-events-none">
        <div className="flex items-center gap-1.5 min-w-0">
          <p className="font-medium text-base text-primary leading-snug truncate">
            <HighlightKeyword text={song.title} keyword={query} />
          </p>
          {arrangements.length > 1 && (
            <span className="shrink-0 text-[10px] font-medium text-zinc-400 bg-zinc-100 rounded px-1 leading-5">
              {arrangements.length}
            </span>
          )}
        </div>
        {song.artist && (
          <p className="text-xs text-zinc-500 truncate mt-0.5">
            <HighlightKeyword text={song.artist} keyword={query} />
          </p>
        )}
      </div>

      {/* Col 2 — primeiras linhas da letra (oculto no mobile) */}
      <div className="hidden md:block min-w-0">
        {verse1Lines.slice(0, 2).map((line, i) => (
          <p key={i} className="text-xs text-zinc-500 truncate leading-relaxed">
            <HighlightKeyword text={line} keyword={query} />
          </p>
        ))}
      </div>

      {/* Col 3 — seletor de arranjo standalone (apenas desktop) */}
      <div className="hidden lg:block relative z-10">
        {arrangementDropdown}
      </div>

      {/* Col 4 — ícones de mídia + ação (sempre visível) */}
      {/* No tablet, inclui o seletor de arranjo inline antes dos ícones */}
      <div className="relative z-10 flex items-center justify-end gap-1">
        {arrangements.length > 1 && (
          <div className="hidden md:flex lg:hidden flex-1 min-w-0 mr-1">
            {arrangementDropdown}
          </div>
        )}
        {selectedArr?.youtubeUrl && (
          <YoutubeReferenceButton
            youtubeUrl={selectedArr.youtubeUrl}
            title={playTitle}
            className={BTN_SM}
          />
        )}
        {selectedArr?.audioUrl && (
          <AudioReferenceButton
            audioUrl={selectedArr.audioUrl}
            title={playTitle}
            className={BTN_SM}
          />
        )}
        {onSelected && (
          <Plus className="w-3.5 h-3.5 text-zinc-400 shrink-0 pointer-events-none" />
        )}
      </div>
    </div>
  );
}
