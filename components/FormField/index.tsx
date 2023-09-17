export default function FormField({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const classNames = ["flex", "flex-col"];
  if (className) {
    classNames.push(className);
  }

  return <div className={classNames.join(" ")}>{children}</div>;
}
