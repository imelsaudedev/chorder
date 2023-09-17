import { ChangeEventHandler } from "react";
import TextareaAutosize from "react-textarea-autosize";

export default function TextInput({
  className,
  id,
  value,
  onChange,
  placeholder,
  long,
  minRows,
}: {
  className?: string;
  id?: string;
  value?: string;
  onChange?: ChangeEventHandler;
  placeholder?: string;
  long?: boolean;
  minRows?: number;
}) {
  let Component;
  if (long) {
    Component = TextareaAutosize;
  } else {
    Component = "input";
  }

  const classNames = [
    "border",
    "border-gray-300",
    "bg-gray-50",
    "text-gray-900",
    "flex-grow",
    "rounded-md",
    "text-sm",
    "focus:ring-blue-500",
    "focus:border-blue-500",
    "block",
    "w-full",
    "p-2",
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
      id={id}
      value={value}
      className={classNames.join(" ")}
      onChange={onChange}
      placeholder={placeholder}
      {...otherProps}
    />
  );
}
