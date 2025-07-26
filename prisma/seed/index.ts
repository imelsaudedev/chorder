import prisma from "../client";
import { addNewServices, addNewSongs } from "./legacy-data";
import { createServicesFromLocal, createSongsFromLocal } from "./local-data";

export async function main() {
  console.log("Deleting old services...");
  await prisma.service.deleteMany({
    where: { date: { lt: new Date("2025-07-15") } },
  });
  console.log("Deleting song arrangements without service unit...");
  const serviceArrangementsWithoutUnit = await prisma.songArrangement.findMany({
    where: { isServiceArrangement: true, serviceUnit: null },
  });
  console.log(
    `Found ${serviceArrangementsWithoutUnit.length} arrangements without service unit.`
  );
  if (serviceArrangementsWithoutUnit.length > 0) {
    // Split in chunks of 10000 to avoid too large delete queries
    const chunks = [];
    for (let i = 0; i < serviceArrangementsWithoutUnit.length; i += 10000) {
      chunks.push(serviceArrangementsWithoutUnit.slice(i, i + 10000));
    }
    for (const chunk of chunks) {
      console.log("Deleting 10000 arrangements in chunks...");
      await prisma.songArrangement.deleteMany({
        where: {
          id: { in: chunk.map((arr) => arr.id) },
        },
      });
    }
    console.log("Deleted service arrangements without service unit.");
  } else {
    console.log("No service arrangements without service unit found.");
  }
  console.log("Done");
  const songs = await createSongsFromLocal(prisma);
  await createServicesFromLocal(prisma, songs);

  await addNewSongs(prisma);
  await addNewServices(prisma);

  const totalSongs = await prisma.song.aggregate({ _count: true });
  const totalServices = await prisma.service.aggregate({ _count: true });

  console.log(`Total songs: ${totalSongs._count}`);
  console.log(`Total services: ${totalServices._count}`);

  console.log("Seeding completed.");
}

main();
