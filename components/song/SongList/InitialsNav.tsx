type InitialsNavProps = {
  existingInitials: string[];
};

export default function InitialsNav({ existingInitials }: InitialsNavProps) {
  const existingInitialsLower = existingInitials.map((i) => i.toLowerCase());
  const allInitials = Array.from(
    new Set([
      ...Array.from("abcdefghijklmnopqrstuvwxyz"),
      ...existingInitialsLower,
    ])
  );
  allInitials.sort();

  return (
    <nav className="flex flex-wrap mb-4">
      {allInitials.map((initial) => {
        const baseClass = "font-display font-semibold text-lg px-1";
        if (existingInitialsLower.indexOf(initial) < 0)
          return (
            <span
              key={`link-to--${initial}`}
              className={`${baseClass} text-muted-foreground/30`}
            >
              {initial.toUpperCase()}
            </span>
          );
        return (
          <a
            href={`#${initial}`}
            key={`link-to--${initial}`}
            className={`${baseClass} text-secondary`}
          >
            {initial.toUpperCase()}
          </a>
        );
      })}
    </nav>
  );
}
