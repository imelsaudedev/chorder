export function isConnection(items: any[], itemIdx: number) {
  if (itemIdx === items.length - 1) {
    return false;
  }
  const currentItem = items[itemIdx];
  const nextItem = items[itemIdx + 1];
  if (currentItem._name === "comment" || nextItem._name === "comment") {
    return false;
  }
  return currentItem.lyrics?.trim() && nextItem.lyrics?.trim();
}
