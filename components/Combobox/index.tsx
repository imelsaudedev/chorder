import { ChangeEventHandler } from "react";

export default function Combobox({
  options,
  label,
  className,
  labelClassName,
  selectClassName,
  id,
  onChange,
}: {
  options: { [value: string]: string };
  label?: string;
  className?: string;
  labelClassName?: string;
  selectClassName?: string;
  id?: string;
  onChange?: ChangeEventHandler<HTMLSelectElement>;
}) {
  if (label && !id) {
    throw new Error("TextInput with label must have an id");
  }

  const classNames = ["flex", "flex-col", "px-4", "py-2"];
  if (className) {
    classNames.push(className);
  }

  const labelClassNames = ["block", "text-sm", "font-medium", "text-gray-900"];
  if (labelClassName) {
    labelClassNames.push(labelClassName);
  }

  const selectClassNames = [
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
  if (selectClassName) {
    selectClassNames.push(selectClassName);
  }

  return (
    <div className={classNames.join(" ")}>
      {label && (
        <label htmlFor={id} className={labelClassNames.join(" ")}>
          {label}
        </label>
      )}
      <select className={selectClassNames.join(" ")} onChange={onChange}>
        {Object.keys(options).map((value) => (
          <option
            key={value}
            value={value}
            className={labelClassNames.join(" ")}
          >
            {options[value]}
          </option>
        ))}
      </select>
    </div>
  );
}
