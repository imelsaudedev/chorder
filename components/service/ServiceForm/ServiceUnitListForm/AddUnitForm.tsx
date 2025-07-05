import { defaultArrangementValues } from "@/components/song/ArrangementForm/useArrangementForm";
import ArrangementPicker from "@/components/song/ArrangementPicker";
import SongPicker from "@/components/song/SongPicker";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ClientArrangement, ClientSong } from "@/prisma/models";
import { ArrangementSchema } from "@/schemas/arrangement";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import { useServiceUnitsFieldArray } from "../useServiceForm";

export default function AddUnitForm() {
  const t = useTranslations("ServiceForm");

  const { units, append } = useServiceUnitsFieldArray();

  const [song, setSong] = useState<ClientSong | null>(null);
  const [arrangement, setArrangement] = useState<ClientArrangement | null>(
    null
  );

  const [songPopoverOpen, setSongPopoverOpen] = useState<boolean>(false);

  const handleSongSelected = (song: ClientSong) => {
    setSong(song);
  };

  const handleAddSongUnit = useCallback(() => {
    if (!song || !arrangement) {
      throw new Error("Song and arrangement must be selected");
    }

    append({
      type: "SONG",
      semitoneTranspose: 0,
      arrangementId: arrangement?.id ?? -1,
      arrangement: {
        ...defaultArrangementValues(arrangement),
        units: arrangement.units! as ArrangementSchema["units"],
      },
      order: units.length + 1,
    });
    setSongPopoverOpen(false);
  }, [append, arrangement, song, units.length]);

  const handlePopoverOpen = useCallback((open: boolean) => {
    setSongPopoverOpen(open);
    setSong(null);
    setArrangement(null);
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
                <Button onClick={handleAddSongUnit} disabled={!song}>
                  {t("add")}
                </Button>
              </DrawerTitle>
            </DrawerHeader>
            <div className="max-h-[80vh] min-h-[50vh] overflow-auto p-4">
              {song ? (
                <ArrangementPicker
                  songSlug={song.slug}
                  onSelected={setArrangement}
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

export function AddUnitFormSkeleton() {
  const t = useTranslations("Messages");

  return (
    <div className="rounded-lg break-inside-avoid p-4 mb-2 border border-zinc-200 border-dashed bg-zinc-100">
      <div className="group flex items-center gap-2 w-full cursor-pointer">
        <Button variant="outline" disabled>
          {t("loading")}
        </Button>
      </div>
    </div>
  );
}
