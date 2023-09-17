import { ChangeEventHandler } from "react";

export default function Combobox({
  value,
  options,
  className,
  id,
  onChange,
}: {
  value: string;
  options: { [value: string]: string };
  label?: string;
  className?: string;
  id?: string;
  onChange?: ChangeEventHandler<HTMLSelectElement>;
}) {
  const classNames = [
    "bg-gray-50",
    "border",
    "border-gray-300",
    "text-sm",
    "text-gray-900",
    "focus:ring-blue-500",
    "rounded-lg",
    "block",
    "focus:border-blue-500",
    "p-2",
    "w-full",
  ];
  if (className) {
    classNames.push(className);
  }

  return (
    <select
      id={id}
      className={classNames.join(" ")}
      onChange={onChange}
      value={value}
    >
      {Object.keys(options).map((value) => (
        <option key={value} value={value}>
          {options[value]}
        </option>
      ))}
    </select>
  );
}
