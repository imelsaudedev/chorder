/**
 * Modos de visualização da cifra:
 * - chords: cifra (acordes + letra + convenções)
 * - lyrics: só a letra, sem acordes nem convenções (e sem o espaço reservado a elas)
 * - conventions: letra + convenções, sem acordes (ex.: o baterista acompanha a letra e vê onde atuar)
 * - text: texto simples monoespaçado
 */
export type Mode = "chords" | "lyrics" | "conventions" | "text";
export type Density = "compact" | "normal";
