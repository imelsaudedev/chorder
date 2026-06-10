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
import { ChevronLeft } from "lucide-react";
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
    <div className="rounded-lg break-inside-avoid p-4 mb-2 border border-border border-dashed bg-muted/40">
      <div className="group flex items-center gap-2 w-full cursor-pointer">
        <Drawer open={songPopoverOpen} onOpenChange={handlePopoverOpen}>
          <DrawerTrigger asChild>
            <Button variant="outline">{t("newSongUnit")}</Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader className="flex flex-row items-center gap-2 px-4 sm:px-6 lg:px-8 py-3 border-b border-border text-left">
              {song ? (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 -ml-1"
                    onClick={() => { setSong(null); setArrangement(null); }}
                  >
                    <ChevronLeft size={18} />
                  </Button>
                  <DrawerTitle className="flex-1 text-left truncate">{song.title}</DrawerTitle>
                  <Button type="button" onClick={handleAddSongUnit} disabled={!arrangement} size="sm">
                    {t("add")}
                  </Button>
                </>
              ) : (
                <DrawerTitle>{t("pickSong")}</DrawerTitle>
              )}
            </DrawerHeader>
            <div className="max-h-[80vh] min-h-[50vh] overflow-y-auto overflow-x-hidden px-4 sm:px-6 lg:px-8 pt-3 pb-8">
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
    <div className="rounded-lg break-inside-avoid p-4 mb-2 border border-border border-dashed bg-muted/40">
      <div className="group flex items-center gap-2 w-full cursor-pointer">
        <Button variant="outline" disabled>
          {t("loading")}
        </Button>
      </div>
    </div>
  );
}
