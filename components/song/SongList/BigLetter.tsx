import clsx from "clsx";

type BigLetterProps = { letter: string; veryBig?: boolean };

export default function BigLetter({ letter, veryBig = true }: BigLetterProps) {
  const initialsTitleClassName = ["font-bricolage", "text-secondary"];
  if (veryBig) {
    initialsTitleClassName.push(
      "text-4xl",
      "md:text-8xl",
      "col-span-2",
      "md:col-span-1",
      "pr-4",
      "pt-2",
      "font-light"
    );
  } else {
    initialsTitleClassName.push(
      "text-xl",
      "md:text-4xl",
      "py-2",
      "font-bold",
      "text-left"
    );
  }

  return (
    <span id={letter} className={clsx(initialsTitleClassName)}>
      {letter.toUpperCase()}
    </span>
  );
}
