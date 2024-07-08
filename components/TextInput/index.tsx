import { ChangeEventHandler, useLayoutEffect, useRef } from 'react';
import TextareaAutosize from 'react-textarea-autosize';

export default function TextInput({
  className,
  id,
  value,
  defaultValue,
  onChange,
  placeholder,
  long,
  minRows,
}: {
  className?: string;
  id?: string;
  value?: string;
  defaultValue?: string;
  onChange?: ChangeEventHandler;
  placeholder?: string;
  long?: boolean;
  minRows?: number;
}) {
  let Component;
  if (long) {
    Component = TextareaAutosize;
  } else {
    Component = 'input';
  }

  // https://giacomocerquone.com/keep-input-cursor-still/
  const position = useRef<{
    beforeStart: number | null;
    beforeEnd: number | null;
  }>({
    beforeStart: 0,
    beforeEnd: 0,
  });
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    inputRef.current?.setSelectionRange(position.current.beforeStart, position.current.beforeEnd);
  }, [value]);

  const handleChange: ChangeEventHandler = (e) => {
    const target = e.target as HTMLInputElement;
    const beforeStart = target.selectionStart;
    const beforeEnd = target.selectionEnd;

    position.current = {
      beforeStart,
      beforeEnd,
    };

    onChange?.(e);
  };

  const classNames = [
    'border',
    'border-gray-300',
    'bg-gray-50',
    'text-gray-900',
    'flex-grow',
    'rounded-md',
    'text-sm',
    'focus:ring-blue-500',
    'focus:border-blue-500',
    'block',
    'w-full',
    'p-2',
  ];
  if (className) {
    classNames.push(className);
  }

  const otherProps: { minRows?: number } = {};
  if (minRows) {
    otherProps.minRows = minRows;
  }

  return (
    <Component
      ref={inputRef}
      id={id}
      value={value}
      defaultValue={defaultValue}
      className={classNames.join(' ')}
      onChange={handleChange}
      placeholder={placeholder}
      {...otherProps}
    />
  );
}
