"use client";

import { jumpToLetter } from "@/lib/songs-list-sticky";
import { useRef, useState } from "react";

const ALPHABET = Array.from("abcdefghijklmnopqrstuvwxyz");
const ROW = 14; // altura de cada letra (px)

/**
 * Trilho de letras na borda direita (só celular, só na ordem por título): arraste o dedo
 * e a lista pula de letra em letra, com um balão mostrando a letra atual.
 */
export default function LetterRail({ initials }: { initials: string[] }) {
  const letters = ALPHABET.filter((l) => initials.includes(l));
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<string | null>(null);

  function at(e: React.PointerEvent) {
    const r = ref.current?.getBoundingClientRect();
    if (!r || letters.length === 0) return;
    const i = Math.max(0, Math.min(letters.length - 1, Math.floor((e.clientY - r.top - 6) / ROW)));
    const letter = letters[i];
    if (letter !== active) {
      setActive(letter);
      jumpToLetter(letter);
    }
  }

  return (
    <>
      <div
        ref={ref}
        role="presentation"
        className="fixed right-0.5 top-1/2 z-30 flex -translate-y-1/2 touch-none select-none flex-col items-center rounded-xl bg-background/70 px-0.5 py-1.5 sm:hidden"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          at(e);
        }}
        onPointerMove={(e) => e.currentTarget.hasPointerCapture(e.pointerId) && at(e)}
        onPointerUp={() => setActive(null)}
        onPointerCancel={() => setActive(null)}
      >
        {letters.map((l) => (
          <span key={l} className="w-[18px] text-center text-[10px] font-semibold uppercase leading-[14px] text-secondary">
            {l}
          </span>
        ))}
      </div>
      {active && (
        <div className="fixed right-10 top-1/2 z-40 size-14 -translate-y-1/2 rounded-xl bg-foreground text-center font-display text-3xl font-semibold uppercase leading-[56px] text-background sm:hidden">
          {active}
        </div>
      )}
    </>
  );
}
