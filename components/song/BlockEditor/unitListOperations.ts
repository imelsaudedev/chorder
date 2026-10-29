import { ClientSongUnit } from "@/prisma/models";

// Operações puras sobre a lista de blocos — cada uma devolve um array novo
// com `order` recalculado como índice+1 pra toda a lista (critério de
// aceitação 7: order correto, na ordem das unidades, inclusive com mais de
// uma coluna). Substituem, de forma adaptada para insert/move em vez de
// swap, a lógica de hooks/moveUpDown.ts (hoje código morto) — ver D4/Etapa 2
// do PLANO.md.

function reassignOrder(units: ClientSongUnit[]): ClientSongUnit[] {
  return units.map((unit, i) => ({ ...unit, order: i + 1 }));
}

function blankUnit(): ClientSongUnit {
  return { type: "BLOCK", content: "", notes: null, repeatCount: 1, order: 0 };
}

export function moveUnitUp(units: ClientSongUnit[], index: number): ClientSongUnit[] {
  if (index <= 0 || index >= units.length) return units;
  const next = units.slice();
  const [moved] = next.splice(index, 1);
  next.splice(index - 1, 0, moved);
  return reassignOrder(next);
}

export function moveUnitDown(units: ClientSongUnit[], index: number): ClientSongUnit[] {
  if (index < 0 || index >= units.length - 1) return units;
  const next = units.slice();
  const [moved] = next.splice(index, 1);
  next.splice(index + 1, 0, moved);
  return reassignOrder(next);
}

export function duplicateUnit(units: ClientSongUnit[], index: number): ClientSongUnit[] {
  const unit = units[index];
  if (!unit) return units;
  const next = units.slice();
  next.splice(index + 1, 0, { ...unit });
  return reassignOrder(next);
}

export function insertUnitBefore(units: ClientSongUnit[], index: number): ClientSongUnit[] {
  const next = units.slice();
  next.splice(index, 0, blankUnit());
  return reassignOrder(next);
}

export function insertUnitAfter(units: ClientSongUnit[], index: number): ClientSongUnit[] {
  const next = units.slice();
  next.splice(index + 1, 0, blankUnit());
  return reassignOrder(next);
}

export function appendUnit(units: ClientSongUnit[]): ClientSongUnit[] {
  return reassignOrder([...units, blankUnit()]);
}

// D12: apagar fica desabilitado no último bloco restante — guarda aqui
// também (defesa em profundidade), não só desabilitando o botão na UI.
export function removeUnit(units: ClientSongUnit[], index: number): ClientSongUnit[] {
  if (units.length <= 1) return units;
  const next = units.slice();
  next.splice(index, 1);
  return reassignOrder(next);
}

export function changeUnitType(
  units: ClientSongUnit[],
  index: number,
  type: ClientSongUnit["type"]
): ClientSongUnit[] {
  if (!units[index]) return units;
  const next = units.slice();
  next[index] = { ...next[index], type };
  return next;
}

export function setUnitNotes(
  units: ClientSongUnit[],
  index: number,
  notes: string | null
): ClientSongUnit[] {
  if (!units[index]) return units;
  const next = units.slice();
  next[index] = { ...next[index], notes };
  return next;
}

export function setUnitContent(
  units: ClientSongUnit[],
  index: number,
  content: string
): ClientSongUnit[] {
  if (!units[index]) return units;
  const next = units.slice();
  next[index] = { ...next[index], content };
  return next;
}
