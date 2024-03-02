import { Line } from "chordsheetjs";
import styles from "./styles.module.scss";
import { unitTypeColorClasses } from "../unit-colors";
import { UnitType } from "@/models/unit";

type ChordProLineProps = {
  line: Line;
  isFirst: boolean;
  isLast: boolean;
  isLastOfColumn: boolean;
  unitType?: UnitType;
  grow?: boolean;
};

export default function ChordProLine({
  line,
  isFirst,
  isLast,
  isLastOfColumn,
  unitType,
  grow,
}: ChordProLineProps) {
  let className = "flex flex-row flex-wrap relative px-2 border-x";
  if (unitType) {
    const unitClasses = unitTypeColorClasses[unitType];
    className = `${className} ${unitClasses.background} ${unitClasses.border}`;

    if (isFirst) {
      className = `${className} pt-1 border-t rounded-t`;
    }
    if (isLast) {
      className = `${className} border-b rounded-b`;
      if (!isLastOfColumn) {
        className = `${className} mb-2`;
      }
    }
  }
  if (grow) {
    className = `${className} flex-grow`;
  }
  return (
    <div className={className} style={{ breakInside: "avoid" }}>
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
