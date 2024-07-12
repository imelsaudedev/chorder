import { Dispatch, MouseEventHandler, SetStateAction, useCallback } from 'react';
import { Button } from '../ui/button';
import { useTranslations } from 'next-intl';

type SaveButtonSetProps = {
  canCancel: boolean;
  setWriteMode: Dispatch<SetStateAction<boolean>>;
  enabled?: boolean;
};

export default function SaveButtonSet({ canCancel, setWriteMode, enabled = true }: SaveButtonSetProps) {
  const t = useTranslations('Messages');
  const handleCancelEdit: MouseEventHandler = useCallback(
    (event) => {
      event.preventDefault();
      setWriteMode(false);
    },
    [setWriteMode]
  );

  return (
    <div className="flex justify-end gap-2">
      {canCancel && (
        <Button onClick={handleCancelEdit} variant="outline">
          {t("cancel")}
        </Button>
      )}
      <Button type="submit" disabled={!enabled} variant="secondary">
        {t("save")}
      </Button>
    </div>
  );
}
