// Tipo compartilhado dos dados de arrasto (Pragmatic drag-and-drop) entre
// BlockShell.tsx (fonte + alvo por bloco) e index.tsx (alvo por coluna,
// pra soltar no fim de uma coluna vazia ou depois do último bloco dela).
// Uma constante só evita o "type: 'song-unit'" solto e divergente nos dois
// arquivos.
export const DRAG_DATA_TYPE = "song-unit" as const;

export type SongUnitDragData = {
  type: typeof DRAG_DATA_TYPE;
  index: number;
};

export function isSongUnitDragData(data: Record<string, unknown>): data is SongUnitDragData {
  return data.type === DRAG_DATA_TYPE && typeof data.index === "number";
}
