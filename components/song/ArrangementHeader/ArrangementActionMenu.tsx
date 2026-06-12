"use client";

import { useDeleteArrangement, useDuplicateArrangement, useMakeArrangementDefault, useMoveArrangement } from "#api-client";
import ConfirmDeleteAlert from "@/components/common/ConfirmDeleteAlert";
import SongPicker from "@/components/song/SongPicker";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ClientArrangement, ClientSong } from "@/prisma/models";
import { MoreVertical } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ArrangementActionMenuProps {
  arrangement: ClientArrangement;
  onEditSong: () => void;
}

export default function ArrangementActionMenu({ arrangement, onEditSong }: ArrangementActionMenuProps) {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const editUrl = `${pathname}/edit?arrangement=${arrangement.id}`;

  const [moveDrawerOpen, setMoveDrawerOpen] = useState(false);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);

  const { duplicateArrangement, isMutating: isDuplicating, duplicatedArrangement } =
    useDuplicateArrangement(arrangement.id!);
  const { deleteArrangement, isMutating: isDeleting } = useDeleteArrangement(arrangement.id!);
  const { makeArrangementDefault, isMutating: isMakingDefault } = useMakeArrangementDefault(arrangement.id!);
  const { moveArrangement } = useMoveArrangement(arrangement.id!);

  useEffect(() => {
    if (duplicatedArrangement) {
      router.push(`${pathname}/edit?arrangement=${duplicatedArrangement.id}`);
    }
  }, [duplicatedArrangement, pathname, router]);

  const moveArrangementTo = (destSong: ClientSong) => {
    moveArrangement(destSong.slug).then(() => {
      router.push(`/songs/${destSong.slug}?arrangement=${arrangement.id}`);
    });
  };

  const excludedSongSlugs = arrangement.song?.slug ? [arrangement.song.slug] : [];

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical />
            <span className="sr-only">{t("Messages.actions")}</span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={onEditSong}>
            {t("Messages.editSong")}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <Link href={editUrl}>{t("SongData.editArrangement")}</Link>
          </DropdownMenuItem>

          <DropdownMenuItem onSelect={() => duplicateArrangement()} disabled={isDuplicating}>
            {t("SongData.duplicateArrangement")}
          </DropdownMenuItem>

          {!arrangement.isDefault && (
            <DropdownMenuItem onSelect={() => makeArrangementDefault()} disabled={isMakingDefault}>
              {t("SongData.makeDefault")}
            </DropdownMenuItem>
          )}

          <DropdownMenuItem onSelect={() => setMoveDrawerOpen(true)}>
            {t("SongData.moveArrangement")}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onSelect={() => setDeleteAlertOpen(true)}
            className="text-red-600 focus:text-red-600 focus:bg-red-50"
            disabled={isDeleting}
          >
            {t("SongData.deleteArrangement")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Drawer open={moveDrawerOpen} onOpenChange={setMoveDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{t("ServiceForm.pickSong")}</DrawerTitle>
          </DrawerHeader>
          <div className="max-h-[80vh] overflow-auto p-4">
            <SongPicker onSelected={moveArrangementTo} excludedSongSlugs={excludedSongSlugs} />
          </div>
        </DrawerContent>
      </Drawer>

      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <ConfirmDeleteAlert
          alertTitle={t("SongForm.confirmDeleteTitle")}
          alertDescription={t("SongForm.confirmDelete")}
          onDelete={deleteArrangement}
        />
      </AlertDialog>
    </>
  );
}
