import messages from '@/i18n/messages';
import { Dispatch, MouseEventHandler, SetStateAction, useCallback } from 'react';

export default function SaveButtonSet({
  canCancel,
  setWriteMode,
}: {
  canCancel: boolean;
  setWriteMode: Dispatch<SetStateAction<boolean>>;
}) {
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
      <button className="bg-purple-600 hover:bg-purple-500 text-white px-4 rounded" type="submit">
        {messages.messages.save}
      </button>
    </div>
  );
}
