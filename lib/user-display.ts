export function getDisplayName(user: {
  nickname?: string | null;
  name?: string | null;
}): string | null {
  const nick = user.nickname?.trim();
  if (nick) return nick;
  const name = user.name?.trim();
  if (name) return name;
  return null;
}
