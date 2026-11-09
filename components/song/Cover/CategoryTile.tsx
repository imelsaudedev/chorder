import { coverFromColor } from "@/lib/cover-theme";
import Link from "next/link";

type CategoryTileProps = {
  tagId: number;
  name: string;
  color: string;
  songCount: number;
  className?: string;
};

/** Card de uma categoria (home): cor + degradê; texto com contraste calculado. */
export default function CategoryTile({ tagId, name, color, songCount, className = "" }: CategoryTileProps) {
  const { theme, background } = coverFromColor(color);
  return (
    <Link
      href={`/songs/categoria/${tagId}`}
      className={`relative isolate flex min-h-28 flex-col justify-end overflow-hidden rounded-lg p-3 active:scale-[.98] ${className}`}
      style={{ background, color: theme.ink }}
    >
      <span
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{ background: `linear-gradient(to top, ${theme.scrimBottom}, ${theme.scrimTop})` }}
      />
      <b
        className="font-display text-base font-semibold leading-5 tracking-tight"
        style={theme.light ? { textShadow: "0 1px 2px rgba(0,0,0,.35)" } : undefined}
      >
        {name}
      </b>
      <small className="text-xs opacity-95">
        {songCount} música{songCount === 1 ? "" : "s"}
      </small>
    </Link>
  );
}
