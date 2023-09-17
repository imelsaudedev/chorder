export default function FormLabel({
  className,
  htmlFor,
  children,
}: {
  className?: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  const classNames = ["block", "text-sm", "font-medium", "text-gray-900"];
  if (className) {
    classNames.push(className);
  }

  return (
    <label htmlFor={htmlFor} className={classNames.join(" ")}>
      {children}
    </label>
  );
}
