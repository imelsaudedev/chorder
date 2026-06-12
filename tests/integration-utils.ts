import prisma from "@/prisma/client";

export async function clearDatabase() {
  const dbUrl = process.env.DATABASE_URL || "";
  if (!dbUrl.includes("chorder_test")) {
    throw new Error(
      `CRITICAL SAFETY BLOCK: clearDatabase() was called against a non-test database: ${dbUrl}. Truncation aborted.`
    );
  }

  // Delete in FK-safe order. SongArrangement has a self-referential FK (originalArrangementId)
  // with RESTRICT — null it out first to avoid constraint violations.
  await prisma.songUnit.deleteMany({});
  await prisma.serviceUnit.deleteMany({});
  await prisma.songArrangement.updateMany({ data: { originalArrangementId: null } });
  await prisma.songArrangement.deleteMany({});
  await prisma.service.deleteMany({});
  await prisma.song.deleteMany({});
  await prisma.tag.deleteMany({});
  await prisma.tagGroup.deleteMany({});
}
