import { getDB } from "./client";

type Slug = {
  slug: string;
};

export async function getAvailableSlug(original: string) {
  const { slugs } = await getCollection();
  let slug = original.trim().toLowerCase().normalize("NFKD").replace(/\p{Diacritic}/gu, "").replace(/[^a-z0-9]/g, "-");
  slug = await slugs.find({ slug: { $regex: `^${slug}` } }).toArray().then((existingSlugs) => {
    let idx = 1;
    let newSlug = slug;
    while (existingSlugs.some((existingSlug) => existingSlug.slug === newSlug)) {
      newSlug = `${slug}-${idx}`;
      idx++;
    }
    return newSlug;
  });
  return slug;
}

export async function saveSlug(slug: string) {
  const { slugs } = await getCollection();
  return slugs.insertOne({ slug });
}

async function getCollection() {
  const { client, db } = await getDB();
  return { client, slugs: db.collection<Slug>("slugs") };
}
