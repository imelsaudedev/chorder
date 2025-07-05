import { useFetchSongArrangements } from "#api-client";
import SongConfigProvider from "@/components/config/SongConfig";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClientArrangement } from "@/prisma/models";
import { useTranslations } from "next-intl";
import { useCallback, useEffect } from "react";
import ArrangementView from "../ArrangementView";

type ArrangementPickerProps = {
  songSlug: string;
  onSelected: (arrangement: ClientArrangement) => void;
};

export default function ArrangementPicker({
  songSlug,
  onSelected,
}: ArrangementPickerProps) {
  const t = useTranslations("Messages");

  const { arrangements, isLoading } = useFetchSongArrangements(songSlug, true);

  const handleValueChange = useCallback(
    (strValue: string) => {
      const value = parseInt(strValue);
      const arrangement = arrangements[value] as ClientArrangement;
      onSelected(arrangement);
    },
    [arrangements, onSelected]
  );

  const defaultArrangementId = arrangements.findIndex(
    (arrangement: ClientArrangement) => arrangement.isDefault
  );

  useEffect(() => {
    if (!arrangements?.length) {
      return;
    }
    const defaultArrangement = arrangements[defaultArrangementId];
    if (defaultArrangement) {
      onSelected(defaultArrangement);
    } else if (arrangements.length > 0) {
      onSelected(arrangements[0]);
    }
  }, [arrangements]);

  if (isLoading) {
    return <Skeleton className="w-[400px] h-[300px]" />;
  }

  return (
    <Tabs
      defaultValue={`${defaultArrangementId}`}
      onValueChange={handleValueChange}
    >
      <TabsList>
        {arrangements.map((arrangement: ClientArrangement, index: number) => (
          <TabsTrigger key={`tab-trigger--${index}`} value={`${index}`}>
            {arrangement.name || `${t("arrangement")} ${index + 1}`}
          </TabsTrigger>
        ))}
      </TabsList>
      {arrangements.map((arrangement: ClientArrangement, index: number) => (
        <TabsContent key={`tab-content--${index}`} value={`${index}`}>
          <SongConfigProvider>
            <ArrangementView arrangement={arrangement} />
          </SongConfigProvider>
        </TabsContent>
      ))}
    </Tabs>
  );
}
