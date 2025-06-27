export const items = [
  {
    lyrics: "This i",
    chords: "C",
  },
  {
    lyrics: "s",
    chords: "G",
  },
  {
    lyrics: "n't a test",
    chords: "Am",
  },
];

export const itemsWithoutChords = items.map((item) => ({
  ...item,
  chords: "",
}));

export const itemsWithoutLyrics = items.map((item) => ({
  ...item,
  lyrics: "",
}));
