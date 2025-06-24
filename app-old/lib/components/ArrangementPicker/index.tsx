import ArrangementViewer from "@/app-old/(main)/songs/ArrangementViewer";
import ArrangementViewContext from "@/app-old/(main)/songs/ArrangementViewer/ArrangementViewContext";
import { useFetchSongArrangements } from "@/app-old/api/api-client";
import { Skeleton } from "@/components-old/ui/skeleton";
import { SongArrangement } from "@/generated/prisma";
import {
  ClientArrangement,
  SongArrangementWithSongAndUnits,
} from "@/prisma/models";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components-old/ui/tabs";
import { useTranslations } from "next-intl";
import { useCallback, useMemo } from "react";

type ArrangementPickerProps = {
  songSlug: string;
  setSelectedArrangement: (
    arrangement: SongArrangementWithSongAndUnits
  ) => void;
};

export default function ArrangementPicker({
  songSlug,
  setSelectedArrangement,
}: ArrangementPickerProps) {
  const t = useTranslations("Messages");

  const { arrangements, isLoading } = useFetchSongArrangements(songSlug, true);

  const handleValueChange = useCallback(
    (strValue: string) => {
      const value = parseInt(strValue);
      const arrangement = arrangements[
        value
      ] as SongArrangementWithSongAndUnits;
      setSelectedArrangement(arrangement);
    },
    [arrangements, setSelectedArrangement]
  );

  if (isLoading) {
    return <Skeleton className="w-[400px] h-[300px]" />;
  }

  const defaultArrangementId = arrangements.findIndex(
    (arrangement) => arrangement.isDefault
  );

  return (
    <Tabs
      defaultValue={`${defaultArrangementId}`}
      onValueChange={handleValueChange}
    >
      <TabsList>
        {arrangements.map((arrangement, index) => (
          <TabsTrigger key={`tab-trigger--${index}`} value={`${index}`}>
            {arrangement.name || `${t("arrangement")} ${index + 1}`}
          </TabsTrigger>
        ))}
      </TabsList>
      {arrangements.map((arrangement, index) => (
        <TabsContent key={`tab-content--${index}`} value={`${index}`}>
          <ArrangementViewContext
            arrangement={arrangement as SongArrangementWithSongAndUnits}
          >
            <ArrangementViewer />
          </ArrangementViewContext>
        </TabsContent>
      ))}
    </Tabs>
  );
}
