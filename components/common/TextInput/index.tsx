import { ChangeEventHandler, forwardRef, useLayoutEffect, useRef } from 'react';
import TextareaAutosize from 'react-textarea-autosize';

type TextInputProps = {
  className?: string;
  id?: string;
  value?: string;
  defaultValue?: string;
  onChange?: ChangeEventHandler;
  placeholder?: string;
  long?: boolean;
  minRows?: number;
};

const TextInput = forwardRef<HTMLTextAreaElement, TextInputProps>(function TextInput({
  className,
  id,
  value,
  defaultValue,
  onChange,
  placeholder,
  long,
  minRows,
}, forwardedRef) {
  const position = useRef<{ beforeStart: number | null; beforeEnd: number | null }>({
    beforeStart: 0,
    beforeEnd: 0,
  });
  const internalRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    if (!forwardedRef) return;
    if (typeof forwardedRef === 'function') {
      forwardedRef(internalRef.current);
    } else {
      (forwardedRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = internalRef.current;
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useLayoutEffect(() => {
    internalRef.current?.setSelectionRange(position.current.beforeStart, position.current.beforeEnd);
  }, [value]);

  const handleChange: ChangeEventHandler = (e) => {
    const target = e.target as HTMLInputElement;
    position.current = { beforeStart: target.selectionStart, beforeEnd: target.selectionEnd };
    onChange?.(e);
  };

  const classNames = [
    'border',
    'border-gray-300',
    'bg-gray-50',
    'text-gray-900',
    'grow',
    'rounded-md',
    'text-sm',
    'focus:ring-blue-500',
    'focus:border-blue-500',
    'block',
    'w-full',
    'p-2',
  ];
  if (className) classNames.push(className);

  if (long) {
    return (
      <TextareaAutosize
        ref={internalRef}
        id={id}
        value={value}
        defaultValue={defaultValue}
        className={classNames.join(' ')}
        onChange={handleChange}
        placeholder={placeholder}
        minRows={minRows}
      />
    );
  }

  return (
    <input
      ref={internalRef as unknown as React.RefObject<HTMLInputElement>}
      id={id}
      value={value}
      defaultValue={defaultValue}
      className={classNames.join(' ')}
      onChange={handleChange}
      placeholder={placeholder}
    />
  );
});

export default TextInput;
