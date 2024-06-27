import { Song } from "chordsheetjs";
import { parseChordPro } from "../../chopro/music";
import { Fragment, useMemo } from "react";
import ChordProLine from "../ChordProLine";
import { SongUnitType } from "@/models/song-unit";

export type ChordProViewerProps = {
  chordpro: string;
  unitType?: SongUnitType;
  withoutContainer?: boolean;
};

export default function ChordProViewer({
  chordpro,
  unitType,
  withoutContainer,
}: ChordProViewerProps) {
  const chordproHtml = useMemo<Song>(() => parseChordPro(chordpro), [chordpro]);
  const Container = withoutContainer ? Fragment : "div";

  return (
    <Container>
      {chordproHtml.lines.map((line, idx) => (
        <Fragment key={`song-line-${idx}`}>
          <ChordProLine
            line={line}
            isFirst={idx === 0}
            isLast={idx === chordproHtml.lines.length - 1}
            unitType={unitType}
          />
        </Fragment>
      ))}
    </Container>
  );
}
