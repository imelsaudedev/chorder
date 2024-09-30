import TrashIcon from '@/components/icons/TrashIcon';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useCallback } from 'react';
import { Button } from '../ui/button';
import { useTranslations } from 'next-intl';

type ConfirmDeleteButtonProps = {
  alertTitle: string;
  alertDescription: string;
  onDelete: () => void;
};

export default function ConfirmDeleteButton({ alertTitle, alertDescription, onDelete }: ConfirmDeleteButtonProps) {
  const t = useTranslations('Messages');

  const handleDelete = useCallback(() => {
    onDelete();
  }, [onDelete]);

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button type="submit" variant="destructive">
          <TrashIcon />
          <span className="sr-only">{t('delete')}</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{alertTitle}</AlertDialogTitle>
          <AlertDialogDescription>{alertDescription}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button variant="destructive" onClick={handleDelete}>
              <span>{t('delete')}</span>
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
