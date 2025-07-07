import prisma from "../client";
import { addNewServices, addNewSongs } from "./legacy-data";
import { createServicesFromLocal, createSongsFromLocal } from "./local-data";

export async function main() {
  const songs = await createSongsFromLocal(prisma);
  createServicesFromLocal(prisma, songs);

  await addNewSongs(prisma);
  await addNewServices(prisma);

  const totalSongs = await prisma.song.aggregate({ _count: true });
  const totalServices = await prisma.service.aggregate({ _count: true });

  console.log(`Total songs: ${totalSongs._count}`);
  console.log(`Total services: ${totalServices._count}`);

  console.log("Seeding completed.");
}

main();
