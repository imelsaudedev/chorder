import { ChangeEventHandler } from "react";
import TextareaAutosize from "react-textarea-autosize";

export default function TextInput({
  className,
  label,
  labelClassName,
  inputClassName,
  id,
  onChange,
  placeholder,
  long,
}: {
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
  label?: string;
  id?: string;
  onChange?: ChangeEventHandler;
  placeholder?: string;
  long?: boolean;
}) {
  if (label && !id) {
    throw new Error("TextInput with label must have an id");
  }

  let Component;
  if (long) {
    Component = TextareaAutosize;
  } else {
    Component = "input";
  }

  const classNames = ["flex", "flex-col", "px-4", "py-2"];
  if (className) {
    classNames.push(className);
  }

  const labelClassNames = ["block", "text-sm", "font-medium", "text-gray-900"];
  if (labelClassName) {
    labelClassNames.push(labelClassName);
  }

  const inputClassNames = [
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
  if (inputClassName) {
    inputClassNames.push(inputClassName);
  }

  return (
    <div className={classNames.join(" ")}>
      {label && (
        <label htmlFor={id} className={labelClassNames.join(" ")}>
          {label}
        </label>
      )}
      <Component
        id={id}
        className={inputClassNames.join(" ")}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  );
}
