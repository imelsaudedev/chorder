import { PrismaClient } from "@prisma/client";
import { writeFileSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();

async function main() {
  const songs = await prisma.song.findMany({
    where: { isDeleted: false },
    select: {
      id: true,
      title: true,
      artist: true,
      lyrics: true,
    },
    orderBy: { title: "asc" },
  });

  const output = JSON.stringify(songs, null, 2);
  const outPath = join(process.cwd(), "songs-export.json");
  writeFileSync(outPath, output, "utf-8");

  console.log(`✓ ${songs.length} músicas exportadas → ${outPath}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
