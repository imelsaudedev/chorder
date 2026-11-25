import { applyEnharmonic, transposeChord } from "@/chopro/music";

export const NATURAL_NOTES = ["C", "D", "E", "F", "G", "A", "B"] as const;
export type NaturalNote = (typeof NATURAL_NOTES)[number];
export type Accidental = "" | "#" | "b";
export type EnharmonicPreference = "sharp" | "flat" | null;

const NATURAL_SEMITONE: Record<NaturalNote, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

export type ParsedKey = { letter: NaturalNote; accidental: Accidental; suffix: string };

/** "Bbm" → { B, b, "m" }. Sufixos (m, 9, m7…) são preservados, só a raiz muda ao escolher outro tom. */
export function parseKey(key: string): ParsedKey | null {
  const match = /^([A-G])([#b]?)(.*)$/.exec(key.trim());
  if (!match) return null;
  return { letter: match[1] as NaturalNote, accidental: match[2] as Accidental, suffix: match[3] };
}

export function semitoneOf(letter: NaturalNote, accidental: Accidental): number {
  const delta = accidental === "#" ? 1 : accidental === "b" ? -1 : 0;
  return (NATURAL_SEMITONE[letter] + delta + 12) % 12;
}

/** Dois deslocamentos são o mesmo tom quando diferem de uma oitava (ex.: -17 e +7). */
export function isSameShift(a: number, b: number): boolean {
  return (((a - b) % 12) + 12) % 12 === 0;
}

/** O menor deslocamento que leva ao mesmo tom, de -5 a +6 (empate sobe). */
export function normalizeShift(delta: number): number {
  const mod = ((delta % 12) + 12) % 12;
  return mod > 6 ? mod - 12 : mod;
}

/** Deslocamento (em semitons) do tom original até `letter` + `accidental`. */
export function shiftToRoot(originalKey: string, letter: NaturalNote, accidental: Accidental): number | null {
  const original = parseKey(originalKey);
  if (!original) return null;
  return normalizeShift(semitoneOf(letter, accidental) - semitoneOf(original.letter, original.accidental));
}

/**
 * Raiz do tom em que a música está tocando (tom original + deslocamento), com a grafia da preferência
 * de sustenido/bemol quando há; sem ela, a grafia padrão da transposição.
 */
export function currentRoot(originalKey: string, transpose: number, preference: EnharmonicPreference): ParsedKey | null {
  const original = parseKey(originalKey);
  if (!original) return null;
  const originalRoot = `${original.letter}${original.accidental}`;
  let root = transposeChord(originalRoot, originalRoot, transpose);
  if (preference) root = applyEnharmonic(root, preference === "sharp");
  const parsed = parseKey(root);
  return parsed ? { ...parsed, suffix: original.suffix } : null;
}

/** E♯, B♯, C♭ e F♭ repetem outra nota: o botão de acidente fica desabilitado nelas. */
export function isAccidentalAllowed(letter: NaturalNote, accidental: "#" | "b"): boolean {
  if (accidental === "#") return letter !== "E" && letter !== "B";
  return letter !== "C" && letter !== "F";
}

/** "Bbm" → "B♭m" (só para exibir). */
export function formatKey(root: ParsedKey): string {
  const glyph = root.accidental === "#" ? "♯" : root.accidental === "b" ? "♭" : "";
  return `${root.letter}${glyph}${root.suffix}`;
}
