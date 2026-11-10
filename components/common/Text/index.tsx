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

// Tamanho explícito — sobrepõe o tamanho padrão da variante.
// Use quando o contexto exige densidade diferente do padrão desktop.
export type TextSize = "xs" | "sm" | "base" | "lg" | "xl";

const sizeClass: Record<TextSize, string> = {
  xs:   "text-xs",
  sm:   "text-sm",
  base: "text-base",
  lg:   "text-lg",
  xl:   "text-xl",
};

// Classes sem o tamanho, para que o prop `size` possa sobrepor
const stylesNoSize: Record<TextVariant, string> = {
  "heading-xl": "font-display font-semibold tracking-tighter text-primary",
  "heading-lg": "font-display font-semibold tracking-tighter leading-none text-primary",
  "heading-md": "font-display font-semibold tracking-tight leading-tight text-primary",
  "heading-sm": "font-display font-semibold tracking-tight leading-snug text-primary",
  "body":       "text-foreground",
  "label":      "font-medium text-foreground",
  "caption":    "text-muted-foreground",
  "overline":   "font-semibold text-secondary uppercase tracking-wider",
};

// Tamanho padrão de cada variante (desktop = normal)
// Escala de ~1,25 entre degraus (ver docs/estudo-hierarquia-visual.md):
// h1 28/32/40 · h2 20/22/24 · h3 16/17/18 · item 16 · UI 14 · meta 12.
// A densidade das cifras (compact/normal) não usa esta escala: ela só muda
// a entrelinha das linhas de cifra (ChordProLine/Item).
const defaultSize: Record<TextVariant, string> = {
  "heading-xl": "text-[1.75rem] leading-[1.15] sm:text-[2rem] lg:text-[2.5rem]",
  "heading-lg": "text-xl leading-tight sm:text-[1.375rem] lg:text-2xl",
  "heading-md": "text-base leading-snug sm:text-[1.0625rem] lg:text-lg",
  "heading-sm": "text-base",
  "body":       "text-base",
  "label":      "text-sm",
  "caption":    "text-sm",
  "overline":   "text-xs",
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
  size?: TextSize;
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
  children?: React.ReactNode;
};

export default function Text({ variant, size, as, className, children }: TextProps) {
  const Component = (as ?? defaultTag[variant]) as React.ElementType;
  const sizeStr = size ? sizeClass[size] : defaultSize[variant];
  return (
    <Component className={cn(stylesNoSize[variant], sizeStr, className)}>
      {children}
    </Component>
  );
}
