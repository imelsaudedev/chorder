import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslations } from "next-intl";
import Link from "next/link";
import ConfirmDeleteAlert from "@/components/common/ConfirmDeleteAlert";
import { useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ClientArrangement } from "@/prisma/models";
import { useDeleteArrangement } from "@/app/api/api-client";

interface ArrangementActionMenuProps {
  arrangement: ClientArrangement;
}

export default function ArrangementActionMenu({
  arrangement,
}: ArrangementActionMenuProps) {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const editUrl = `${pathname}/edit?arrangement=${arrangement.id}`;
  const { deleteArrangement, isMutating } = useDeleteArrangement(
    arrangement.id!
  );

  const onDelete = useCallback(() => {
    deleteArrangement();
    const parentPath = pathname.split("/").slice(0, -1).join("/");
    router.replace(parentPath);
  }, [arrangement, router, pathname]);

  return (
    <div className="flex gap-1">
      <AlertDialog>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">{t("Messages.actions")}</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem asChild>
              <Link href={editUrl} className="w-full">
                {t("Messages.edit")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <AlertDialogTrigger
                className="w-full text-left"
                disabled={isMutating}
              >
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
