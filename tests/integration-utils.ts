import prisma from "@/prisma/client";

/**
 * Clears all data from the test database.
 * Use this in beforeAll/beforeEach for integration tests.
 */
export async function clearDatabase() {
  const tablenames = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  if (tablenames.length === 0) {
    return;
  }

  const tables = tablenames
    .map(({ tablename }) => tablename)
    .filter((name) => name !== "_prisma_migrations")
    .map((name) => `"public"."${name}"`)
    .join(", ");

  if (!tables) {
    return;
  }

  // CRITICAL SAFETY CHECK: Prevent truncating non-test databases
  const dbUrl = process.env.DATABASE_URL || "";
  if (!dbUrl.includes("chorder_test")) {
    throw new Error(
      `CRITICAL SAFETY BLOCK: clearDatabase() was called against a non-test database: ${dbUrl}. Truncation aborted.`
    );
  }

  try {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} RESTART IDENTITY CASCADE;`);
  } catch (error) {
    console.log({ error });
  }
}
