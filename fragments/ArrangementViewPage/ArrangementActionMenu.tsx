import ConfirmDeleteAlert from "@/components-old/ConfirmDeleteAlert";
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
import useHrefWithParams from "@/hooks/useHrefWithParams";
import { useTranslations } from "next-intl";
import Link from "next/link";

interface ArrangementActionMenuProps {
  deleteArrangementWithId: () => void;
}

export default function ArrangementActionMenu({
  deleteArrangementWithId,
}: ArrangementActionMenuProps) {
  const t = useTranslations();
  const createHrefWithParam = useHrefWithParams();

  return (
    <div className="flex gap-1">
      <AlertDialog>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">{t("Messages.actions")}</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              <Link href={createHrefWithParam("edit", "true")}>
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
          onDelete={deleteArrangementWithId}
        />
      </AlertDialog>
    </div>
  );
}
