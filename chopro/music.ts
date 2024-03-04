import ChordSheetJS from "chordsheetjs";

export type SongKey =
  | "C"
  | "C#"
  | "C##"
  | "Db"
  | "D"
  | "D#"
  | "Eb"
  | "E"
  | "E#"
  | "Fb"
  | "F"
  | "F#"
  | "F##"
  | "Gb"
  | "G"
  | "G#"
  | "G##"
  | "Ab"
  | "A"
  | "A#"
  | "Bb"
  | "B"
  | "B#"
  | "Cb";

export const parseChordPro = (chordproString: string) => {
  const parser = new ChordSheetJS.ChordProParser();
  const parsedSong = parser.parse(chordproString.replace(/(?:\r\n)/g, "\n"));
  return parsedSong;
};

export function getLyrics(chordproString: string) {
  try {
    const parsedSong = parseChordPro(chordproString);
    return parsedSong.lines
      .map((line) =>
        line.items
          .map((item: any) => (item._name === "comment" ? "" : item.lyrics))
          .join("")
      )
      .join("\n");
  } catch (e) {
    console.log(e);
    return null;
  }
}

export function getChords(chordproString?: string) {
  if (!chordproString) return [];

  try {
    const parsedSong = parseChordPro(chordproString);
    return parsedSong.lines
      .map((line) =>
        line.items.map((item: any) =>
          item._name === "comment" ? "" : item.chords
        )
      )
      .flat(2);
  } catch (e) {
    console.log(e);
    return [];
  }
}

const KEYS = {
  C: ["C", "Dm", "Em", "F", "G", "Am", "Bdim"],
  "C#": ["C#", "D#m", "E#m", "F#", "G#", "A#m", "B#dim"],
  Db: ["Db", "Ebm", "Fm", "Gb", "Ab", "Bbm", "Cdim"],
  D: ["D", "Em", "F#m", "G", "A", "Bm", "C#dim"],
  "D#": ["D#", "E#m", "F##m", "G#", "A#", "B#m", "C##dim"],
  Eb: ["Eb", "Fm", "Gm", "Ab", "Bb", "Cm", "Ddim"],
  E: ["E", "F#m", "G#m", "A", "B", "C#m", "D#dim"],
  F: ["F", "Gm", "Am", "Bb", "C", "Dm", "Edim"],
  "F#": ["F#", "G#m", "A#m", "B", "C#", "D#m", "E#dim"],
  Gb: ["Gb", "Abm", "Bbm", "Cb", "Db", "Ebm", "Fdim"],
  G: ["G", "Am", "Bm", "C", "D", "Em", "F#dim"],
  "G#": ["G#", "A#m", "B#m", "C#", "D#", "E#m", "F##dim"],
  Ab: ["Ab", "Bbm", "Cm", "Db", "Eb", "Fm", "Gdim"],
  A: ["A", "Bm", "C#m", "D", "E", "F#m", "G#dim"],
  "A#": ["A#", "B#m", "C##m", "D#", "E#", "F##m", "G##dim"],
  Bb: ["Bb", "Cm", "Dm", "Eb", "F", "Gm", "Adim"],
  B: ["B", "C#m", "D#m", "E", "F#", "G#m", "A#dim"],
};

const HALF_TONES = [
  ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"],
  ["Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B", "C"],
  ["D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B", "C", "C#"],
  ["Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B", "C", "Db", "D"],
  ["E", "F", "F#", "G", "G#", "A", "A#", "B", "C", "C#", "D", "D#"],
  ["F", "Gb", "G", "Ab", "A", "Bb", "B", "C", "Db", "D", "Eb", "E"],
  ["Gb", "G", "Ab", "A", "Bb", "B", "C", "Db", "D", "Eb", "E", "F"],
  ["G", "G#", "A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#"],
  ["Ab", "A", "Bb", "B", "C", "Db", "D", "Eb", "E", "F", "Gb", "G"],
  ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"],
  ["Bb", "B", "C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A"],
  ["B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#"],
];

export const toHalfToneIndex = (index: number) => {
  const n = HALF_TONES.length;
  return ((index % n) + n) % n;
};

export const keyFromChord = (chord: string): SongKey | null => {
  const re = /([ABCDEFG][b#]*)\.*/;
  const match = re.exec(chord);
  return match ? (match[0] as SongKey) : null;
};

export const simplifyChord = (chord: string) => {
  const re = /([ABCDEFG][b#]*(m|dim)?)\.*/;
  const match = re.exec(chord);
  return match ? match[0] : null;
};

export const getKeyFromChords = (chords: string[]) => {
  const keys = chords
    .map((chord) => keyFromChord(chord))
    .filter((key) => key !== null);
  if (keys.length === 0) return null;

  return getMostLikelyKey(keys as string[]);
};

function getMostLikelyKey(chords: string[]) {
  let key = "C";
  let maxCount = 0;
  for (const k in KEYS) {
    const count = chords.filter((chord) =>
      KEYS[k as keyof typeof KEYS].includes(chord)
    ).length;
    if (count > maxCount) {
      maxCount = count;
      key = k;
    }
  }
  return key;
}

export const harmonicIndex = (key: SongKey) => {
  switch (key) {
    case "C":
    case "B#":
      return 0;
    case "C#":
    case "Db":
      return 1;
    case "C##":
    case "D":
      return 2;
    case "D#":
    case "Eb":
      return 3;
    case "E":
    case "Fb":
      return 4;
    case "E#":
    case "F":
      return 5;
    case "F#":
    case "Gb":
      return 6;
    case "F##":
    case "G":
      return 7;
    case "G#":
    case "Ab":
      return 8;
    case "G##":
    case "A":
      return 9;
    case "A#":
    case "Bb":
      return 10;
    case "B":
    case "Cb":
      return 11;
  }
  return -1;
};

export const transposeChord = (
  chord: string,
  originalKey: string,
  semitones: number
) => {
  if (!chord || toHalfToneIndex(semitones) === 0) return chord;

  const chordKey = keyFromChord(chord);
  if (!chordKey) return chord;

  let chordIdx = harmonicIndex(chordKey);
  const originalIdx = harmonicIndex(originalKey as SongKey);
  const diff = toHalfToneIndex(chordIdx - originalIdx);

  const base = HALF_TONES[toHalfToneIndex(originalIdx + semitones)][diff];
  let transposed = base + chord.substring(chordKey.length);
  const slashIdx = transposed.indexOf("/");
  if (slashIdx >= 0) {
    transposed =
      transposed.substring(0, slashIdx + 1) +
      transposeChord(
        transposed.substring(slashIdx + 1),
        originalKey,
        semitones
      );
  }
  return transposed;
};
