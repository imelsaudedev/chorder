import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ui/tabs";
import { Song } from "@/models/song";
import { useTranslations } from "next-intl";
import ArrangementView from "../ArrangementViewPage/ArrangementView";
import { getSongUnitMap, SongArrangement } from "@/models/song-arrangement";
import { useCallback, useMemo } from "react";

type ArrangementPickerProps = {
  song: Song;
  setSelectedArrangementId: (id: number) => void;
  defaultArrangementId: number;
};

export default function ArrangementPicker({
  song,
  setSelectedArrangementId,
  defaultArrangementId,
}: ArrangementPickerProps) {
  const t = useTranslations("Messages");

  const handleValueChange = useCallback(
    (strValue: string) => {
      const value = parseInt(strValue);
      setSelectedArrangementId(value);
    },
    [setSelectedArrangementId]
  );

  return (
    <Tabs
      defaultValue={`${defaultArrangementId}`}
      className="w-[400px]"
      onValueChange={handleValueChange}
    >
      <TabsList>
        {song.arrangements.map((arrangement, index) => (
          <TabsTrigger key={`tab-trigger--${index}`} value={`${index}`}>
            {arrangement.name || `${t("arrangement")} ${index + 1}`}
          </TabsTrigger>
        ))}
      </TabsList>
      {song.arrangements.map((arrangement, index) => (
        <TabsContent key={`tab-content--${index}`} value={`${index}`}>
          <SimpleArrangementView arrangement={arrangement} density="normal" />
        </TabsContent>
      ))}
    </Tabs>
  );
}

function SimpleArrangementView({
  arrangement,
  density,
}: {
  arrangement: SongArrangement;
  density: "compact" | "normal";
}) {
  const songUnitMap = useMemo(() => getSongUnitMap(arrangement), [arrangement]);

  return (
    <ArrangementView
      songUnitMap={songUnitMap}
      songKey={arrangement.key}
      density={density}
    />
  );
}
