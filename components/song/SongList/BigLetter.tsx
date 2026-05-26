type BigLetterProps = { letter: string };

export default function BigLetter({ letter }: BigLetterProps) {
  return (
    <div id={letter} className="flex items-center gap-3 pt-5 pb-1">
      <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
        {letter.toUpperCase()}
      </span>
      <div className="flex-1 border-t border-zinc-200" />
    </div>
  );
}
