export default function Header({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const classNames = ["flex", "bg-purple-200", "px-4", "py-2"];
  if (className) {
    classNames.push(className);
  }

  return <header className={classNames.join(" ")}>{children}</header>;
}
