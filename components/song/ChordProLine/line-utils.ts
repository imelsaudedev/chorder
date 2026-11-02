import type { ChordProItem } from "@/chopro/music";
import type { Mode } from "@/components/config/config";

/**
 * Prepara os itens de uma linha para o modo de visualização. Devolve `null` quando a linha
 * não deve aparecer.
 *
 * - "lyrics" (Letra): sem convenções — nem o rótulo nem o espaço reservado a ele. Uma linha que
 *   só tinha convenção some por inteiro (antes deixava uma linha em branco).
 * - "conventions" (Convenções): sem acordes. Como o acorde era o que partia uma palavra em
 *   pedaços ("gra" + "tidão"), os pedaços entre duas convenções são juntados num só item (senão
 *   apareceria o tracinho que liga as partes de uma palavra). A convenção continua marcando o
 *   ponto da letra onde começa o item seguinte.
 * - "chords" e "text": a linha como está.
 */
export function prepareItemsForMode(items: ChordProItem[], mode: Mode): ChordProItem[] | null {
  if (mode === "lyrics") {
    const withoutComments = items.filter((item) => item._name !== "comment");
    if (items.length > 0 && withoutComments.length === 0) return null;
    return withoutComments;
  }

  if (mode === "conventions") {
    const prepared: ChordProItem[] = [];
    items.forEach((item) => {
      if (item._name === "comment") {
        prepared.push(item);
        return;
      }
      const previous = prepared[prepared.length - 1];
      if (previous && previous._name !== "comment") {
        prepared[prepared.length - 1] = { ...previous, chords: "", lyrics: `${previous.lyrics ?? ""}${item.lyrics ?? ""}` };
      } else {
        prepared.push({ ...item, chords: "" });
      }
    });
    return prepared;
  }

  return items;
}

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
