import ConfirmDeleteAlert from "@/components/common/ConfirmDeleteAlert";
import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback } from "react";

type ActionMenuProps = {
  editUrl: string;
  editLabel?: string;
  duplicateLabel?: string;
  deleteLabel?: string;
  onDelete: () => void;
  onDuplicate?: () => void;
  isDuplicating: boolean;
  isDeleting: boolean;
  confirmDeleteTitle: string;
  confirmDeleteDescription: string;
};
export default function ActionMenu({
  editUrl,
  editLabel,
  duplicateLabel,
  deleteLabel,
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
            <Button variant="ghost" size="icon">
              <MoreVertical />
              <span className="sr-only">{t("Messages.actions")}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Link href={editUrl} className="w-full">
                {editLabel ?? t("Messages.edit")}
              </Link>
            </DropdownMenuItem>
            {onDuplicate && (
              <DropdownMenuItem
                onSelect={onDuplicate}
                disabled={isDuplicating}
              >
                {duplicateLabel ?? t("Messages.duplicate")}
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="text-red-600 focus:text-red-600 focus:bg-red-50">
              <AlertDialogTrigger
                className="w-full text-left"
                disabled={isDeleting}
              >
                <span>{deleteLabel ?? t("Messages.delete")}</span>
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
