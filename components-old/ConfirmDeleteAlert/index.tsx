import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components-old/ui/alert-dialog";
import { useTranslations } from "next-intl";
import { useCallback } from "react";
import { Button } from "../ui/button";

type ConfirmDeleteAlertProps = {
  alertTitle: string;
  alertDescription: string;
  onDelete: () => void;
};

export default function ConfirmDeleteAlert({
  alertTitle,
  alertDescription,
  onDelete,
}: ConfirmDeleteAlertProps) {
  const t = useTranslations("Messages");

  const handleDelete = useCallback(() => {
    onDelete();
  }, [onDelete]);

  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{alertTitle}</AlertDialogTitle>
        <AlertDialogDescription>{alertDescription}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
        <AlertDialogAction asChild>
          <Button variant="destructive" onClick={handleDelete}>
            <span>{t("delete")}</span>
          </Button>
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
}
