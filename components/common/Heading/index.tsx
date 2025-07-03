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
    classNames.push(
      "font-bricolage font-semibold tracking-tight text-xl sm:text-2xl lg:text-3xl leading-none text-primary fullscreen"
    );
  } else if (level === 3) {
    Component = "h3";
    classNames.push(
      "font-bricolage font-semibold text-lg lg:text-xl leading-tight text-primary"
    );
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
    classNames.push(
      "font-bricolage font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-primary mb-1 sm:mb-2"
    );
  }

  if (className) {
    classNames.push(className);
  }

  return <Component className={classNames.join(" ")}>{children}</Component>;
}
