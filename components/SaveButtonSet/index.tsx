import messages from '@/i18n/messages';
import { Dispatch, MouseEventHandler, SetStateAction, useCallback } from 'react';
import { Button } from '../ui/button';

type SaveButtonSetProps = {
  canCancel: boolean;
  setWriteMode: Dispatch<SetStateAction<boolean>>;
  enabled?: boolean;
};

export default function SaveButtonSet({ canCancel, setWriteMode, enabled = true }: SaveButtonSetProps) {
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
          {messages.messages.cancel}
        </Button>
      )}
      <Button type="submit" disabled={!enabled} variant="secondary">
        {messages.messages.save}
      </Button>
    </div>
  );
}
