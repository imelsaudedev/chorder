import ConfirmDeleteAlert from "@/components/common/ConfirmDeleteAlert";
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
import { usePathname, useRouter } from "next/navigation";
import { useCallback } from "react";

type ActionMenuProps = {
  editUrl: string;
  onDelete: () => void;
  onDuplicate?: () => void;
  isDuplicating: boolean;
  isDeleting: boolean;
  confirmDeleteTitle: string;
  confirmDeleteDescription: string;
};
export default function ActionMenu({
  editUrl,
  isDuplicating,
  isDeleting,
  onDelete,
  onDuplicate,
  confirmDeleteTitle,
  confirmDeleteDescription,
}: ActionMenuProps) {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();

  const handleDelete = useCallback(() => {
    onDelete();
    const parentPath = pathname.split("/").slice(0, -1).join("/");
    router.replace(parentPath);
  }, [router, pathname, onDelete]);

  return (
    <div className="flex gap-1">
      <AlertDialog>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">{t("Messages.actions")}</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              <Link href={editUrl} className="w-full">
                {t("Messages.edit")}
              </Link>
            </DropdownMenuItem>
            {onDuplicate && (
              <DropdownMenuItem
                onSelect={onDuplicate}
                disabled={isDuplicating}
              >
                {t("Messages.duplicate")}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem asChild>
              <AlertDialogTrigger
                className="w-full text-left"
                disabled={isDeleting}
              >
                <span>{t("Messages.delete")}</span>
              </AlertDialogTrigger>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <ConfirmDeleteAlert
          alertTitle={confirmDeleteTitle}
          alertDescription={confirmDeleteDescription}
          onDelete={handleDelete}
        />
      </AlertDialog>
    </div>
  );
}
