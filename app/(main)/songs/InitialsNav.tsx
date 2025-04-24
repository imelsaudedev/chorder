type InitialsNavProps = {
  existingInitials: string[];
};

export default function InitialsNav({ existingInitials }: InitialsNavProps) {
  const allInitials = Array.from(
    new Set([...Array.from("abcdefghijklmnopqrstuvwxyz"), ...existingInitials])
  );
  allInitials.sort();

  return (
    <nav className="flex flex-wrap mb-4">
      {allInitials.map((initial) => {
        const className = "font-bricolage text-xl px-2";
        if (existingInitials.indexOf(initial) < 0)
          return (
            <span
              key={`link-to--${initial}`}
              className={`${className} text-muted`}
            >
              {initial.toUpperCase()}
            </span>
          );
        return (
          <a
            href={`#${initial}`}
            key={`link-to--${initial}`}
            className={`${className} text-secondary`}
          >
            {initial.toUpperCase()}
          </a>
        );
      })}
    </nav>
  );
}
