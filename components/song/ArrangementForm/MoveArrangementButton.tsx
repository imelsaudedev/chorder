import { useMoveArrangement } from "#api-client";
import SongPicker from "@/components/song/SongPicker";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ClientSong } from "@/prisma/models";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

type MoveArrangementButtonProps = {
  arrangementId: number;
  songSlug?: string;
};

export default function MoveArrangementButton({
  arrangementId,
  songSlug,
}: MoveArrangementButtonProps) {
  const excludedSongSlugs = songSlug ? [songSlug] : [];
  const t = useTranslations();
  const router = useRouter();

  const { moveArrangement } = useMoveArrangement(arrangementId);

  const moveArrangementTo = (destSong: ClientSong) => {
    moveArrangement(destSong.slug).then(() => {
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
