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
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
  const [isNavigating, setIsNavigating] = useState(false);

  const { moveArrangement, isMutating } = useMoveArrangement(arrangementId);
  const isLoading = isMutating || isNavigating;

  const moveArrangementTo = (destSong: ClientSong) => {
    moveArrangement(destSong.slug).then(() => {
      setIsNavigating(true);
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
          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <SongPicker
              onSelected={moveArrangementTo}
              excludedSongSlugs={excludedSongSlugs}
            />
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
