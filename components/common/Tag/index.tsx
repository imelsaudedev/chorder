import { readableTint, readableTintDark } from "@/lib/color-contrast";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export type TagVariant = "default" | "success" | "warning" | "error" | "info" | "muted";
export type TagSize = "xs" | "sm";

// Chip: fundo claro, texto escuro da mesma família, sem borda (referência Flowbite).
const variantClasses: Record<TagVariant, string> = {
  default: "bg-surface-strong text-foreground",
  success: "bg-success-muted text-success-text",
  warning: "bg-warning-muted text-warning-text",
  error:   "bg-danger-muted text-danger-text",
  info:    "bg-info-muted text-info-text",
  muted:   "bg-surface-muted text-muted-foreground",
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
    const light = readableTint(color);
    const dark = readableTintDark(color);
    // Cada tema lê o seu par de cores por variável CSS (a classe `dark` decide qual vale).
    const style = {
      "--tag-bg": light.background,
      "--tag-fg": light.foreground,
      "--tag-bg-dark": dark.background,
      "--tag-fg-dark": dark.foreground,
    } as React.CSSProperties;
    return (
      <span
        className={cn(base, "bg-(--tag-bg) text-(--tag-fg) dark:bg-(--tag-bg-dark) dark:text-(--tag-fg-dark)", sizeClasses[size], className)}
        style={style}
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
