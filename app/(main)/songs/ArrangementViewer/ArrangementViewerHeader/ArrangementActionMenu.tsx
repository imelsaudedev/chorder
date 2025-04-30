import { AlertDialog, AlertDialogTrigger } from "@ui/alert-dialog";
import { Button } from "@ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@ui/dropdown-menu";
import { useTranslations } from "next-intl";
import Link from "next/link";
import ConfirmDeleteAlert from "@components/ConfirmDeleteAlert";
import { deleteArrangementAction } from "../actions";

interface ArrangementActionMenuProps {
  songSlug: string;
  arrangementId: number | undefined;
}

export default function ArrangementActionMenu({
  songSlug,
  arrangementId,
}: ArrangementActionMenuProps) {
  const t = useTranslations();

  const deleteArrangementWithIdAction = deleteArrangementAction.bind(
    null,
    songSlug,
    arrangementId ?? "default"
  );

  return (
    <div className="flex gap-1">
      <AlertDialog>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">{t("Messages.actions")}</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              <Link href="./edit">{t("Messages.edit")}</Link>
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
          onDelete={deleteArrangementWithIdAction}
        />
      </AlertDialog>
    </div>
  );
}
