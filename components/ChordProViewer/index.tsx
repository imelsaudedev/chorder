import { Line } from "chordsheetjs";
import styles from "./styles.module.scss";
import { parseChordPro } from "../../chopro/music";

export default function ChordProViewer({ chordpro }: { chordpro: string }) {
  const chordproHtml = parseChordPro(chordpro);
  return (
    <div>
      {chordproHtml.lines.map((line, idx) => (
        <ChordProLine line={line} key={`song-line-${idx}`} />
      ))}
    </div>
  );
}

function ChordProLine({ line }: { line: Line }) {
  return (
    <div
      className={`flex flex-row flex-wrap items-end relative`}
      style={{ breakInside: "avoid" }}
    >
      {line.items.length === 0 && <br />}
      {line.items.map((item, elementIdx) => (
        <ChordProItem item={item} key={`song-line-item-${elementIdx}`} />
      ))}
    </div>
  );
}

function ChordProItem({ item }: { item: any }) {
  if (item._name === "comment") {
    return <span className="italic">{item._value}</span>;
  }
  return (
    <div className={`flex flex-col whitespace-pre-wrap ${styles.chordLyrics}`}>
      <div>{item.chords}</div>
      <div>{item.lyrics}</div>
    </div>
  );
}
