import ChordSheetJS from "chordsheetjs";

type SongKey =
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

const KEYS = {
  C: ["C", "D", "E", "F", "G", "A", "B"],
  "C#": ["C#", "D#", "E#", "F#", "G#", "A#", "B#"],
  Db: ["Db", "Eb", "F", "Gb", "Ab", "Bb", "C"],
  D: ["D", "E", "F#", "G", "A", "B", "C#"],
  "D#": ["D#", "E#", "F##", "G#", "A#", "B#", "C##"],
  Eb: ["Eb", "F", "G", "Ab", "Bb", "C", "D"],
  E: ["E", "F#", "G#", "A", "B", "C#", "D#"],
  F: ["F", "G", "A", "Bb", "C", "D", "E"],
  "F#": ["F#", "G#", "A#", "B", "C#", "D#", "E#"],
  Gb: ["Gb", "Ab", "Bb", "Cb", "Db", "Eb", "F"],
  G: ["G", "A", "B", "C", "D", "E", "F#"],
  "G#": ["G#", "A#", "B#", "C#", "D#", "E#", "F##"],
  Ab: ["Ab", "Bb", "C", "Db", "Eb", "F", "G"],
  A: ["A", "B", "C#", "D", "E", "F#", "G#"],
  "A#": ["A#", "B#", "C##", "D#", "E#", "F##", "G##"],
  Bb: ["Bb", "C", "D", "Eb", "F", "G", "A"],
  B: ["B", "C#", "D#", "E", "F#", "G#", "A#"],
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

const toHalfToneIndex = (index: number) => {
  const n = HALF_TONES.length;
  return ((index % n) + n) % n;
};

export const keyFromChord = (chord: string) => {
  const re = /([ABCDEFG][b#]*)\.*/;
  const match = re.exec(chord);
  return match ? match[0] : null;
};

export const simplifyChord = (chord: string) => {
  const re = /([ABCDEFG][b#]*(m|dim)?)\.*/;
  const match = re.exec(chord);
  return match ? match[0] : null;
};

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
