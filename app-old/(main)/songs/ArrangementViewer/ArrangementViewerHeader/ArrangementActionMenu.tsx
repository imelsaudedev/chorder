import {
  AlertDialog,
  AlertDialogTrigger,
} from "@/components-old/ui/alert-dialog";
import { Button } from "@/components-old/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components-old/ui/dropdown-menu";
import { useTranslations } from "next-intl";
import Link from "next/link";
import ConfirmDeleteAlert from "@/app-old/lib/components/ConfirmDeleteAlert";
import { deleteArrangementAction } from "../actions";
import { useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";

interface ArrangementActionMenuProps {
  songSlug: string;
  arrangementId: number | undefined;
}

export default function ArrangementActionMenu({
  songSlug,
  arrangementId,
}: ArrangementActionMenuProps) {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();

  const onDelete = useCallback(() => {
    deleteArrangementAction(songSlug, arrangementId ?? "default");
    const parentPath = pathname.split("/").slice(0, -1).join("/");
    router.replace(parentPath);
  }, [songSlug, arrangementId, router, pathname]);

  return (
    <div className="flex gap-1">
      <AlertDialog>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">{t("Messages.actions")}</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              <Link
                href={`/songs/${songSlug}/edit?arrangement=${arrangementId}`}
                className="w-full"
              >
                {t("Messages.edit")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <AlertDialogTrigger className="w-full text-left">
                <span>{t("Messages.delete")}</span>
              </AlertDialogTrigger>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <ConfirmDeleteAlert
          alertTitle={t("SongForm.confirmDeleteTitle")}
          alertDescription={t("SongForm.confirmDelete")}
          onDelete={onDelete}
        />
      </AlertDialog>
    </div>
  );
}
