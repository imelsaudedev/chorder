/**
 * Quantos chips ficam de fora para a lista caber em `maxLines` linhas.
 *
 * `tops` é a posição vertical (offsetTop) de cada chip, na ordem em que aparecem.
 * Chips na mesma linha têm o mesmo `top`. Devolve 0 quando tudo cabe.
 */
export function hiddenChipCount(tops: number[], maxLines: number): number {
  if (tops.length === 0 || maxLines < 1) return 0;
  const lines = [...new Set(tops)].sort((a, b) => a - b);
  if (lines.length <= maxLines) return 0;
  const lastAllowedTop = lines[maxLines - 1];
  return tops.filter((t) => t > lastAllowedTop).length;
}
