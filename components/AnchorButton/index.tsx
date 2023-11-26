import { ReactNode } from "react";

type AnchorButtonProps = {
  href: string;
  children: ReactNode;
  borderColorClass?: string;
};

export default function AnchorButton({
  href,
  children,
  borderColorClass,
}: AnchorButtonProps) {
  const classNames = ["flex", "rounded", "p-4", "border-2", "border-solid"];
  if (borderColorClass) {
    classNames.push(borderColorClass);
  } else {
    classNames.push("border-gray-400");
  }
  return (
    <a className={classNames.join(" ")} href={href}>
      {children}
    </a>
  );
}
