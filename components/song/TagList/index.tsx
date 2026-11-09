"use client";

import Tag from "@/components/common/Tag";
import { cn } from "@/lib/utils";
import { ClientTag } from "@/prisma/models";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { hiddenChipCount } from "./fit-lines";

// No servidor não existe layout: useLayoutEffect só roda no navegador.
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

type TagListProps = {
  tags: ClientTag[];
  /** Máximo de linhas; o que não couber vira "+N". */
  maxLines?: number;
  className?: string;
};

/**
 * Chips de categoria em no máximo `maxLines` linhas. Mede o layout real:
 * primeiro desenha todos, vê quantos passam da última linha permitida e
 * troca esses por um "+N" (que também precisa caber na última linha).
 */
export default function TagList({ tags, maxLines = 2, className }: TagListProps) {
  const ref = useRef<HTMLDivElement>(null);
  // null = mostrando todos (fase de medir); número = quantos chips aparecem.
  const [visible, setVisible] = useState<number | null>(null);
  const [width, setWidth] = useState(0);

  // Remede quando a largura muda (inclusive quando a coluna passa de oculta para visível).
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([entry]) => {
      const w = Math.round(entry.contentRect.width);
      setWidth((prev) => {
        if (prev !== w) setVisible(null);
        return w;
      });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const chips = Array.from(el.querySelectorAll<HTMLElement>("[data-chip]"));
    if (chips.length === 0) return;

    if (visible === null) {
      const hidden = hiddenChipCount(chips.map((c) => c.offsetTop), maxLines);
      if (hidden > 0) setVisible(chips.length - hidden);
      return;
    }

    // Já com "+N": se ele caiu para uma linha além do limite, tira mais um chip.
    const more = el.querySelector<HTMLElement>("[data-more]");
    if (!more || visible <= 0) return;
    const lines = [...new Set(chips.map((c) => c.offsetTop))].sort((a, b) => a - b);
    const lastAllowedTop = lines[Math.min(maxLines, lines.length) - 1];
    if (more.offsetTop > lastAllowedTop) setVisible(visible - 1);
  }, [visible, tags, width, maxLines]);

  // Se a lista de tags mudar, volta a medir.
  useEffect(() => {
    setVisible(null);
  }, [tags]);

  if (tags.length === 0) return null;

  const shown = visible === null ? tags : tags.slice(0, visible);
  const hiddenCount = tags.length - shown.length;

  return (
    <div ref={ref} className={cn("flex flex-wrap gap-x-1.5 gap-y-1 min-w-0", className)}>
      {shown.map((tag) => (
        <span key={tag.id} data-chip className="inline-flex">
          <Tag label={tag.name} color={tag.group.color} size="sm" />
        </span>
      ))}
      {hiddenCount > 0 && (
        <span data-more className="inline-flex" title={tags.slice(shown.length).map((t) => t.name).join(", ")}>
          <Tag label={`+${hiddenCount}`} variant="muted" size="sm" />
        </span>
      )}
    </div>
  );
}
