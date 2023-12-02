import { ReactNode } from "react";

type AnchorButtonProps = {
  href: string;
  children: ReactNode;
  borderColorClass?: string;
  additionalClasses?: string[];
};

export default function AnchorButton({
  href,
  children,
  borderColorClass,
  additionalClasses,
}: AnchorButtonProps) {
  const classNames = [
    "flex",
    "rounded",
    "p-2",
    "border-2",
    "border-solid",
  ].concat(additionalClasses || []);
  if (borderColorClass) {
    classNames.push(borderColorClass);
  } else {
    classNames.push("border-gray-600");
  }
  return (
    <a className={classNames.join(" ")} href={href}>
      {children}
    </a>
  );
}
