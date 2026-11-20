import { Rgb, contrastRatio, mixRgb, parseHex, rgbCss } from "./color-contrast";

/**
 * Tema da capa de uma categoria (protótipo: docs/prototipo-musicas/musicas-explorar.html).
 * Uma tinta só (branca ou escura) para tudo que fica sobre a capa, escolhida pelo contraste.
 * O topo (onde fica o "Voltar") e a base (onde fica o texto) têm fundos diferentes; testa
 * branco + degradê escuro e tinta escura + degradê claro, reforçando o degradê até as duas
 * regiões chegarem a `minContrast`. Vence o modo que precisa de menos reforço.
 */

const WHITE: Rgb = [255, 255, 255];
const BLACK: Rgb = [0, 0, 0];
const INK_DARK: Rgb = [11, 18, 32];
const FALLBACK_HEX = "#71717a";

export type CoverTheme = {
  /** Cor da tinta sobre a capa (CSS). */
  ink: string;
  /** true = tinta branca (precisa de sombra no texto). */
  light: boolean;
  /** Contraste mínimo atingido (topo × base). */
  ratio: number;
  /** Degradê: transparência do reforço no topo e na base (CSS rgba). */
  scrimTop: string;
  scrimBottom: string;
  /** Fundo do botão de ícone sobre a capa. */
  iconBg: string;
};

export function coverTheme(top: Rgb, bottom: Rgb, minContrast = 4.5): CoverTheme {
  const modes = [
    { ink: WHITE, css: "#fff", scrim: BLACK, light: true },
    { ink: INK_DARK, css: rgbCss(INK_DARK), scrim: WHITE, light: false },
  ];
  let best: { m: (typeof modes)[number]; k: number; r: number } | null = null;
  for (const m of modes) {
    for (let k = 1; k <= 1.8 + 1e-9; k += 0.1) {
      const bT = mixRgb(top, m.scrim, Math.min(0.9, 0.1 * k));
      const bX = mixRgb(bottom, m.scrim, Math.min(0.9, 0.4 * k));
      const r = Math.min(contrastRatio(m.ink, bT), contrastRatio(m.ink, bX));
      if (r >= minContrast) {
        if (!best || k < best.k - 1e-9) best = { m, k, r };
        break;
      }
    }
  }
  if (!best) {
    const m = modes[0];
    const k = 1.8;
    const r = Math.min(
      contrastRatio(m.ink, mixRgb(top, m.scrim, 0.18)),
      contrastRatio(m.ink, mixRgb(bottom, m.scrim, 0.72))
    );
    best = { m, k, r };
  }
  const { m, k, r } = best;
  const rgb = m.scrim.join(",");
  return {
    ink: m.css,
    light: m.light,
    ratio: r,
    scrimTop: `rgba(${rgb},${Math.min(0.9, 0.05 * k).toFixed(2)})`,
    scrimBottom: `rgba(${rgb},${Math.min(0.9, 0.5 * k).toFixed(2)})`,
    iconBg: m.light ? "rgba(0,0,0,.4)" : "rgba(255,255,255,.55)",
  };
}

/** Capa só de cor: topo = a cor; base = a cor um pouco escurecida (degradê de 135°). */
export function coverFromColor(hex: string | null | undefined): {
  theme: CoverTheme;
  background: string;
} {
  const base = parseHex(hex ?? "") ?? (parseHex(FALLBACK_HEX) as Rgb);
  const dark = mixRgb(base, BLACK, 0.23);
  return {
    theme: coverTheme(base, dark),
    background: `linear-gradient(135deg, ${rgbCss(base)}, ${rgbCss(dark)})`,
  };
}
