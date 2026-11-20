import { SongKey, applyEnharmonic, harmonicIndex, transposeChord } from "./music";

export type ChordVariant = "secdom" | "aem" | null;

export type ChordRow = {
  triad: string;
  seventh: string;
  slash: string | null;
  variante: string | null;
  varType: ChordVariant;
  romanLabel: string;
};

// Reference grid in C major — all other keys computed via transposeChord
const C_GRID: ChordRow[] = [
  { triad: "C",    seventh: "C7M",   slash: null,  variante: "C7", varType: "aem",    romanLabel: "I" },
  { triad: "Dm",   seventh: "Dm7",   slash: null,  variante: "A7", varType: "secdom", romanLabel: "IIm" },
  { triad: "Em",   seventh: "Em7",   slash: "C/E", variante: "B7", varType: "secdom", romanLabel: "IIIm" },
  { triad: "F",    seventh: "F7M",   slash: null,  variante: "Fm", varType: "aem",    romanLabel: "IV" },
  { triad: "G",    seventh: "G7",    slash: null,  variante: null, varType: null,     romanLabel: "V" },
  { triad: "Am",   seventh: "Am7",   slash: null,  variante: "E7", varType: "secdom", romanLabel: "VIm" },
  { triad: "Bdim", seventh: "Bm7b5", slash: "G/B", variante: null, varType: null,     romanLabel: "VIIdim" },
];

export function applyEnharmonicToGrid(grid: ChordRow[], preference: "sharp" | "flat" | null): ChordRow[] {
  if (!preference) return grid;
  const preferSharp = preference === "sharp";
  return grid.map((row) => ({
    ...row,
    triad:    applyEnharmonic(row.triad, preferSharp),
    seventh:  applyEnharmonic(row.seventh, preferSharp),
    slash:    row.slash    ? applyEnharmonic(row.slash, preferSharp)    : null,
    variante: row.variante ? applyEnharmonic(row.variante, preferSharp) : null,
  }));
}

export function buildChordGrid(key: string): ChordRow[] {
  if (!key || key === "C") return C_GRID;
  const semitones = harmonicIndex(key as SongKey);
  if (semitones === undefined || semitones === 0) return C_GRID;

  return C_GRID.map((row) => ({
    triad:      transposeChord(row.triad, "C", semitones),
    seventh:    transposeChord(row.seventh, "C", semitones),
    slash:      row.slash ? transposeChord(row.slash, "C", semitones) : null,
    variante:   row.variante ? transposeChord(row.variante, "C", semitones) : null,
    varType:    row.varType,
    romanLabel: row.romanLabel,
  }));
}

// Tons oferecidos no seletor de campo harmônico do modal de acordes (grafias usuais, uma por semitom).
const FIELD_KEYS = ["C", "Db", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];

/**
 * Opções do seletor de campo harmônico: os 12 tons e, se o tom da cifra não estiver entre eles
 * (ex.: "C#", "Gb", ou um tom menor), ele entra primeiro, para sempre dar para voltar a ele.
 */
export function fieldKeyOptions(baseKey: string): string[] {
  return baseKey && !FIELD_KEYS.includes(baseKey) ? [baseKey, ...FIELD_KEYS] : FIELD_KEYS;
}

/**
 * Grade do modal para o campo harmônico escolhido. No tom da cifra vale a preferência de grafia
 * da leitura; em outro tom, a grafia segue o próprio tom escolhido ("F#" em sustenidos, "Db" em bemóis).
 */
export function gridForField(
  fieldKey: string,
  baseKey: string,
  enharmonicPreference: "sharp" | "flat" | null
): ChordRow[] {
  let preference = enharmonicPreference;
  if (fieldKey !== baseKey) {
    if (fieldKey.includes("#")) preference = "sharp";
    else if (fieldKey.length > 1 && fieldKey.endsWith("b")) preference = "flat";
  }
  return applyEnharmonicToGrid(buildChordGrid(fieldKey), preference);
}
