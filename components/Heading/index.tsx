export default function Heading({
  className,
  children,
  level,
}: {
  className?: string;
  children?: React.ReactNode;
  level: number;
}) {
  let Component: keyof JSX.IntrinsicElements;
  const classNames = ["font-bold"];
  if (level === 2) {
    Component = "h2";
    classNames.push("text-3xl");
  } else if (level === 3) {
    Component = "h3";
    classNames.push("text-2xl");
  } else if (level === 4) {
    Component = "h4";
    classNames.push("text-xl");
  } else if (level === 5) {
    Component = "h5";
    classNames.push("text-lg");
  } else if (level === 6) {
    Component = "h6";
    classNames.push("text-base");
  } else {
    Component = "h1";
    classNames.push("text-4xl");
  }

  if (className) {
    classNames.push(className);
  }

  return <Component className={classNames.join(" ")}>{children}</Component>;
}
