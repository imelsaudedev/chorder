/**
 * Menu fixo da lista de Músicas (protótipo: docs/prototipo-musicas/sticky-menu.html).
 * A barra de filtros fica fixa no topo; no celular ela some ao descer e volta ao subir.
 * A faixa da letra atual fica fixa logo abaixo da barra (ou no topo, com a barra escondida).
 * A variável CSS abaixo diz a altura da barra que está visível; a faixa usa como `top`.
 */
export const STICKY_TOP_VAR = "--songs-sticky-top";
export const JUMP_EVENT = "songs:jump";
/** Mesmo ponto de quebra do `sm:` do Tailwind. */
export const DESKTOP_QUERY = "(min-width: 640px)";

/**
 * Rola até a faixa da letra. No celular a barra some ao descer, então a faixa fica no
 * topo; no desktop a barra continua fixa e a faixa para logo abaixo dela.
 */
export function jumpToLetter(letter: string) {
  const el = document.getElementById(letter);
  if (!el) return;
  const desktop = window.matchMedia(DESKTOP_QUERY).matches;
  const bar = document.querySelector<HTMLElement>("[data-songs-filter-bar]");
  const lead = desktop && bar ? bar.offsetHeight : 0;
  window.dispatchEvent(new CustomEvent(JUMP_EVENT));
  const top = el.getBoundingClientRect().top + window.scrollY - lead;
  window.scrollTo({ top, behavior: "instant" as ScrollBehavior });
}
