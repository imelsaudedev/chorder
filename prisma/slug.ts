export async function slugFor(original: string, slugs: string[]) {
  let slug = original
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[()]/g, '')
    .replace(/[^a-z0-9]/g, '-');
  let idx = 1;
  let newSlug = slug;
  while (slugs.includes(newSlug)) {
    newSlug = `${slug}-${idx}`;
    idx++;
  }
  slugs.push(newSlug);
  return newSlug;
}
