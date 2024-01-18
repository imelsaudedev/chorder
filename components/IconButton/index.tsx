import { ButtonHTMLAttributes } from "react";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export default function IconButton({
  onClick,
  children,
  disabled,
  className,
}: IconButtonProps) {
  const classNames = ["px-2", "py-0"];
  if (disabled) classNames.push("text-gray-300");

  return (
    <button
      className={`${classNames.join(" ")} ${className || ""}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
