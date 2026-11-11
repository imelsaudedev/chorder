import { readableTint } from "@/lib/color-contrast";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export type TagVariant = "default" | "success" | "warning" | "error" | "info" | "muted";
export type TagSize = "xs" | "sm";

// Chip: fundo claro, texto escuro da mesma família, sem borda (referência Flowbite).
const variantClasses: Record<TagVariant, string> = {
  default: "bg-zinc-200 text-zinc-800",
  success: "bg-emerald-100 text-emerald-800",
  warning: "bg-amber-100 text-amber-800",
  error:   "bg-red-100 text-red-800",
  info:    "bg-blue-100 text-blue-800",
  muted:   "bg-zinc-100 text-zinc-600",
};

const sizeClasses: Record<TagSize, string> = {
  xs: "text-[11px] px-1.5 py-px leading-4",
  sm: "text-xs px-2 py-0.5 leading-4",
};

type TagProps = {
  label: ReactNode;
  // cor dinâmica (vinda do banco) — sobrepõe variant. O fundo é um tom claro da cor e
  // o texto é a mesma cor escurecida até o contraste ficar legível (>= 4,5).
  color?: string;
  variant?: TagVariant;
  size?: TagSize;
  className?: string;
};

export default function Tag({ label, color, variant = "default", size = "xs", className }: TagProps) {
  const base = "inline-flex items-center rounded-sm font-medium whitespace-nowrap";

  if (color) {
    const { background, foreground } = readableTint(color);
    return (
      <span
        className={cn(base, sizeClasses[size], className)}
        style={{ backgroundColor: background, color: foreground }}
      >
        {label}
      </span>
    );
  }

  return (
    <span className={cn(base, variantClasses[variant], sizeClasses[size], className)}>
      {label}
    </span>
  );
}
