import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '../ui/button';

type SaveButtonSetProps = {
  canCancel: boolean;
  enabled?: boolean;
};

export default function SaveButtonSet({ canCancel, enabled = true }: SaveButtonSetProps) {
  const t = useTranslations('Messages');

  return (
    <div className="flex justify-end gap-2">
      {canCancel && (
        <Button variant="outline" asChild>
          <Link href="?edit=false">{t('cancel')}</Link>
        </Button>
      )}
      <Button type="submit" disabled={!enabled} variant="secondary">
        {t('save')}
      </Button>
    </div>
  );
}
