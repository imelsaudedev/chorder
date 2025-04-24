type BigLetterProps = { letter: string };

export default function BigLetter({ letter }: BigLetterProps) {
  const initialsTitleClassName = [
    "font-bricolage",
    "font-light",
    "text-4xl",
    "md:text-8xl",
    "col-span-2",
    "md:col-span-1",
    "pr-4",
    "pt-2",
    "text-secondary",
  ].join(" ");

  return (
    <span id={letter} className={initialsTitleClassName}>
      {letter.toUpperCase()}
    </span>
  );
}
