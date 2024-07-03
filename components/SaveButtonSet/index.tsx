import messages from '@/i18n/messages';
import { Dispatch, MouseEventHandler, SetStateAction, useCallback } from 'react';

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
    <div className="ml-auto flex gap-2">
      {canCancel && <button onClick={handleCancelEdit}>{messages.messages.cancel}</button>}
      <button className="bg-purple-600 hover:bg-purple-500 text-white px-4 rounded" type="submit" disabled={!enabled}>
        {messages.messages.save}
      </button>
    </div>
  );
}
