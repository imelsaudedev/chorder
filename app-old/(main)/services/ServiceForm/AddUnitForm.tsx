import { Button } from "@/components-old/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components-old/ui/drawer";
import { useCallback, useState } from "react";
import { ServiceFormFields } from "./useServiceFormFields";
import { useTranslations } from "next-intl";
import ArrangementPicker from "@/app-old/lib/components/ArrangementPicker";
import SongPicker from "@/app-old/lib/components/SongPicker";
import { ClientSong, SongArrangementWithSongAndUnits } from "@/prisma/models";
import { ArrangementFormSchema } from "../../songs/ArrangementForm/schema";

type AddUnitFormProps = {
  serviceFormFields: ServiceFormFields;
};

export default function AddUnitForm({ serviceFormFields }: AddUnitFormProps) {
  const t = useTranslations("ServiceForm");
  const { onCreateUnit } = serviceFormFields;
  const [song, setSong] = useState<ClientSong | null>(null);
  const [selectedArrangement, setSelectedArrangement] =
    useState<SongArrangementWithSongAndUnits | null>(null);

  const [songPopoverOpen, setSongPopoverOpen] = useState<boolean>(false);
  const handleSongSelected = (song: ClientSong) => {
    setSong(song);
  };
  const handleAddSongUnit = useCallback(() => {
    const arrangement = selectedArrangement!;
    onCreateUnit({
      type: "SONG",
      semitoneTranspose: 0,
      songId: arrangement.songId,
      arrangement: {
        title: arrangement.song.title,
        artist: arrangement.song.artist ?? undefined,
        arrangementId: arrangement.id,
        arrangementName: arrangement.name ?? undefined,
        key: arrangement.key || "C",
        units: arrangement.units as unknown as ArrangementFormSchema["units"],
      },
    });
    setSongPopoverOpen(false);
  }, [onCreateUnit, selectedArrangement]);
  const handlePopoverOpen = useCallback((open: boolean) => {
    setSongPopoverOpen(open);
    setSong(null);
    setSelectedArrangement(null);
  }, []);

  return (
    <div
      className={`rounded-lg break-inside-avoid p-4 mb-2 border border-zinc-200 border-dashed bg-zinc-100`}
    >
      <div className="group flex items-center gap-2 w-full cursor-pointer">
        <Drawer open={songPopoverOpen} onOpenChange={handlePopoverOpen}>
          <DrawerTrigger asChild>
            <Button variant="outline">{t("newSongUnit")}</Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle className="flex justify-between items-center">
                <span>{song ? t("pickArrangement") : t("pickSong")}</span>
                <Button onClick={handleAddSongUnit}>{t("add")}</Button>
              </DrawerTitle>
            </DrawerHeader>
            <div className="max-h-[80vh] min-h-[50vh] overflow-auto p-4">
              {song ? (
                <ArrangementPicker
                  songSlug={song.slug}
                  setSelectedArrangement={setSelectedArrangement}
                />
              ) : (
                <SongPicker onSelected={handleSongSelected} />
              )}
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
}
