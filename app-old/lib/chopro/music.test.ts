import { harmonicIndex, keyFromChord, simplifyChord } from "./music";

test("harmonic index", () => {
  expect(harmonicIndex("Cb")).toBe(11);
  expect(harmonicIndex("C")).toBe(0);
  expect(harmonicIndex("C#")).toBe(1);
  expect(harmonicIndex("C##")).toBe(2);
  expect(harmonicIndex("Db")).toBe(1);
  expect(harmonicIndex("D")).toBe(2);
  expect(harmonicIndex("D#")).toBe(3);
  expect(harmonicIndex("Eb")).toBe(3);
  expect(harmonicIndex("E")).toBe(4);
  expect(harmonicIndex("E#")).toBe(5);
  expect(harmonicIndex("Fb")).toBe(4);
  expect(harmonicIndex("F")).toBe(5);
  expect(harmonicIndex("F#")).toBe(6);
  expect(harmonicIndex("F##")).toBe(7);
  expect(harmonicIndex("Gb")).toBe(6);
  expect(harmonicIndex("G")).toBe(7);
  expect(harmonicIndex("G#")).toBe(8);
  expect(harmonicIndex("G##")).toBe(9);
  expect(harmonicIndex("Ab")).toBe(8);
  expect(harmonicIndex("A")).toBe(9);
  expect(harmonicIndex("A#")).toBe(10);
  expect(harmonicIndex("Bb")).toBe(10);
  expect(harmonicIndex("B")).toBe(11);
  expect(harmonicIndex("B#")).toBe(0);
});

test("key from chord", () => {
  expect(keyFromChord("D#m7+")).toEqual("D#");
  expect(keyFromChord("Bm4")).toEqual("B");
  expect(keyFromChord("F##7")).toEqual("F##");
  expect(keyFromChord("F##dim7")).toEqual("F##");
  expect(keyFromChord("Gbm9")).toEqual("Gb");
  expect(keyFromChord("F4")).toEqual("F");
});

test("simplify chord", () => {
  expect(simplifyChord("D#m7+")).toEqual("D#m");
  expect(simplifyChord("Bm4")).toEqual("Bm");
  expect(simplifyChord("F##7")).toEqual("F##");
  expect(simplifyChord("F##dim7")).toEqual("F##dim");
  expect(simplifyChord("Gbm9")).toEqual("Gbm");
  expect(simplifyChord("F4")).toEqual("F");
});
