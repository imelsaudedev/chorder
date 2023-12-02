import { Line, Song } from "chordsheetjs";
import styles from "./styles.module.scss";
import { parseChordPro } from "../../chopro/music";
import { Fragment, useMemo } from "react";

export default function ChordProViewer({
  chordpro,
  withoutContainer,
}: {
  chordpro: string;
  withoutContainer?: boolean;
}) {
  const chordproHtml = useMemo<Song>(() => parseChordPro(chordpro), [chordpro]);
  const Container = withoutContainer ? Fragment : "div";

  return (
    <Container>
      {chordproHtml.lines.map((line, idx) => (
        <ChordProLine line={line} key={`song-line-${idx}`} />
      ))}
    </Container>
  );
}

function ChordProLine({ line }: { line: Line }) {
  return (
    <div
      className={`flex flex-row flex-wrap relative`}
      style={{ breakInside: "avoid" }}
    >
      {line.items.length === 0 && <br />}
      {line.items.map((item, elementIdx) => (
        <ChordProItem
          item={item}
          key={`song-line-item-${elementIdx}`}
          isConnection={isConnection(line.items, elementIdx)}
        />
      ))}
    </div>
  );
}

function ChordProItem({
  item,
  isConnection,
}: {
  item: any;
  isConnection: boolean;
}) {
  if (item._name === "comment") {
    return <span className="italic">{item._value}</span>;
  }

  const chordClasses = ["mr-1", "leading-none", "font-bold", "mb-0"];
  if (!item.chords?.trim()) {
    chordClasses.push("flex-grow");
  }

  const lyricsClasses = ["leading-none", styles.lyrics];
  if (isConnection) {
    lyricsClasses.push(styles.lyricsConnection);
  }
  if (!item.lyrics?.trim()) {
    lyricsClasses.push("flex-grow");
  }

  return (
    <div className={"flex flex-col whitespace-pre-wrap mb-2"}>
      <span className={chordClasses.join(" ")}>{item.chords}</span>
      <span className={lyricsClasses.join(" ")}>{item.lyrics || " "}</span>
    </div>
  );
}

function isConnection(items: any, itemIdx: number) {
  if (itemIdx === 0) {
    return false;
  }
  const prevItem = items[itemIdx - 1];
  const currentItem = items[itemIdx];
  if (prevItem._name === "comment" || currentItem._name === "comment") {
    return false;
  }
  return prevItem.lyrics?.trim() && currentItem.lyrics?.trim();
}
