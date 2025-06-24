import SongPicker from "@/app-old/lib/components/SongPicker";
import { Button } from "@/components-old/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components-old/ui/drawer";
import { ClientSong } from "@/prisma/models";
import { useTranslations } from "next-intl";
import { moveArrangementAction } from "./actions";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  const moveArrangementTo = (destSong: ClientSong) => {
    moveArrangementAction(arrangementId, destSong.slug).then(() => {
      router.push(`/songs/${destSong.slug}?arrangement=${arrangementId}`);
    });
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
