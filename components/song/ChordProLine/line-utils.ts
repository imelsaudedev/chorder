export function isConnection(items: any[], itemIdx: number) {
  if (itemIdx === items.length - 1) {
    return false;
  }
  const currentItem = items[itemIdx];
  const nextItem = items[itemIdx + 1];
  if (currentItem._name === "comment" || nextItem._name === "comment") {
    return false;
  }
  if (!currentItem.lyrics?.trim() || !nextItem.lyrics?.trim()) {
    return false;
  }
  // Só é a MESMA palavra partida por um acorde/convenção quando não há
  // espaço nenhum entre os dois pedaços. O chordsheetjs anexa o espaço
  // final de uma palavra à lyrics do item ANTERIOR ao próximo acorde —
  // "Deus [C]te" vira items lyrics "Deus " e "te", com o espaço dentro do
  // primeiro — então são duas palavras diferentes, não uma só partida
  // (achado: o tracinho aparecia ali igual a "gra[D]tidão", que não tem
  // esse espaço). Checar o último caractere da lyrics ANTES do trim
  // distingue os dois casos.
  return /\S$/.test(currentItem.lyrics);
}
