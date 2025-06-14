import SongPicker from "@components/SongPicker";
import { Button } from "@ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@ui/drawer";
import { ClientSong } from "@/prisma/models";
import { useTranslations } from "next-intl";
import { moveArrangementAction } from "./actions";

type MoveArrangementButtonProps = {
  songSlug: string;
  arrangementId: number;
};

export default function MoveArrangementButton({
  songSlug,
  arrangementId,
}: MoveArrangementButtonProps) {
  const excludedSongSlugs = [songSlug];
  const t = useTranslations();

  const moveArrangementTo = (destSong: ClientSong) => {
    moveArrangementAction(arrangementId, destSong.slug);
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="destructive">{t("SongForm.moveArrangement")}</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{t("ServiceForm.pickSong")}</DrawerTitle>
        </DrawerHeader>
        <div className="max-h-[80vh] overflow-auto p-4">
          <SongPicker
            onSelected={moveArrangementTo}
            excludedSongSlugs={excludedSongSlugs}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
