import { cn } from "@/lib/utils";

export type TagVariant = "default" | "success" | "warning" | "error" | "info" | "muted";
export type TagSize = "xs" | "sm";

const variantClasses: Record<TagVariant, string> = {
  default: "bg-muted text-foreground border-border",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  error:   "bg-red-50 text-red-700 border-red-200",
  info:    "bg-blue-50 text-blue-700 border-blue-200",
  muted:   "bg-muted/60 text-muted-foreground border-border/60",
};

const sizeClasses: Record<TagSize, string> = {
  xs: "text-[10px] px-1.5 py-px leading-4",
  sm: "text-xs px-2 py-0.5 leading-5",
};

type TagProps = {
  label: string;
  // cor dinâmica (vinda do banco) — sobrepõe variant
  color?: string;
  variant?: TagVariant;
  size?: TagSize;
  className?: string;
};

export default function Tag({ label, color, variant = "default", size = "xs", className }: TagProps) {
  if (color) {
    return (
      <span
        className={cn("inline-flex items-center rounded-md font-medium border", sizeClasses[size], className)}
        style={{
          backgroundColor: `${color}26`,
          color,
          borderColor: `${color}4d`,
        }}
      >
        {label}
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-center rounded-md font-medium border", variantClasses[variant], sizeClasses[size], className)}>
      {label}
    </span>
  );
}
