/**
 * Contraste de cor (WCAG 2.x) e "tinta legível" para chips com cor vinda do banco.
 *
 * A cor de uma categoria é livre (qualquer #rrggbb), então não dá para escolher
 * à mão um par de tons como numa paleta fixa. `readableTint` gera o fundo claro e
 * escurece o texto da mesma cor até o contraste ficar legível.
 */

export type Rgb = [number, number, number];

const WHITE: Rgb = [255, 255, 255];
const BLACK: Rgb = [0, 0, 0];
const FALLBACK_HEX = "#71717a";

/** Aceita #rgb e #rrggbb (com ou sem #). Devolve null se não for uma cor válida. */
export function parseHex(hex: string): Rgb | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

/** Luminância relativa (0 = preto, 1 = branco), como na WCAG. */
export function relativeLuminance([r, g, b]: Rgb): number {
  const f = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

/** Razão de contraste entre duas cores, de 1 (iguais) a 21 (preto e branco). */
export function contrastRatio(a: Rgb, b: Rgb): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** Mistura `a` com `b`; `t` é o peso de `b` (0 = só a, 1 = só b). */
export function mixRgb(a: Rgb, b: Rgb, t: number): Rgb {
  return [0, 1, 2].map((i) => Math.round(a[i] * (1 - t) + b[i] * t)) as Rgb;
}

export const rgbCss = (c: Rgb) => `rgb(${c[0]}, ${c[1]}, ${c[2]})`;

export type ReadableTint = {
  /** Fundo claro da cor (CSS). */
  background: string;
  /** Texto da mesma cor, escurecido até o contraste mínimo (CSS). */
  foreground: string;
  /** Contraste final entre texto e fundo. */
  ratio: number;
};

/**
 * Fundo = a cor misturada com branco (`tint` = quanto de branco, 0.85 = 85%);
 * texto = a cor escurecida em passos de 5% até chegar a `minContrast`.
 * Cor inválida cai num cinza neutro.
 */
export function readableTint(
  hex: string,
  { minContrast = 4.5, tint = 0.85 }: { minContrast?: number; tint?: number } = {}
): ReadableTint {
  const base = parseHex(hex) ?? (parseHex(FALLBACK_HEX) as Rgb);
  const bg = mixRgb(base, WHITE, tint);
  let fg = base;
  for (let t = 0; contrastRatio(fg, bg) < minContrast && t < 1; ) {
    t = Math.min(1, t + 0.05);
    fg = mixRgb(base, BLACK, t);
  }
  return { background: rgbCss(bg), foreground: rgbCss(fg), ratio: contrastRatio(fg, bg) };
}
