import { cn } from "@/lib/utils";

export type TextVariant =
  | "heading-xl"   // títulos de página — h1 scale
  | "heading-lg"   // títulos de seção — h2 scale
  | "heading-md"   // subtítulos — h3 scale
  | "heading-sm"   // UI chrome: barras de edição, drawers, cards
  | "body"         // texto corrido
  | "label"        // labels de form, metadados inline
  | "caption"      // texto secundário, datas, artistas
  | "overline";    // letras iniciais, categorias em caps

const styles: Record<TextVariant, string> = {
  "heading-xl": "font-bricolage font-semibold text-3xl sm:text-4xl lg:text-5xl tracking-tighter text-primary",
  "heading-lg": "font-bricolage font-semibold text-xl sm:text-2xl lg:text-3xl tracking-tighter leading-none text-primary",
  "heading-md": "font-bricolage font-semibold text-lg lg:text-xl tracking-tight leading-tight text-primary",
  "heading-sm": "font-bricolage font-semibold text-base tracking-tight leading-snug text-primary",
  "body":       "text-base text-foreground",
  "label":      "text-sm font-medium text-foreground",
  "caption":    "text-sm text-muted-foreground",
  "overline":   "text-xs font-semibold text-secondary uppercase tracking-wider",
};

const defaultTag: Record<TextVariant, keyof React.JSX.IntrinsicElements> = {
  "heading-xl": "h1",
  "heading-lg": "h2",
  "heading-md": "h3",
  "heading-sm": "span",
  "body":       "p",
  "label":      "span",
  "caption":    "span",
  "overline":   "span",
};

type TextProps = {
  variant: TextVariant;
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
  children?: React.ReactNode;
};

export default function Text({ variant, as, className, children }: TextProps) {
  const Component = (as ?? defaultTag[variant]) as React.ElementType;
  return (
    <Component className={cn(styles[variant], className)}>
      {children}
    </Component>
  );
}
