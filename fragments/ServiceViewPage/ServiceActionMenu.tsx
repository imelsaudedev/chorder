import ConfirmDeleteAlert from "@/components/ConfirmDeleteAlert";
import { AlertDialog, AlertDialogTrigger } from "@ui/alert-dialog";
import { Button } from "@ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@ui/dropdown-menu";
import useHrefWithParams from "@/hooks/useHrefWithParams";
import { useTranslations } from "next-intl";
import Link from "next/link";

interface ServiceActionMenuProps {
  deleteService: () => void;
}

export default function ServiceActionMenu({
  deleteService,
}: ServiceActionMenuProps) {
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
          alertTitle={t("ServiceForm.confirmDeleteTitle")}
          alertDescription={t("ServiceForm.confirmDelete")}
          onDelete={deleteService}
        />
      </AlertDialog>
    </div>
  );
}
