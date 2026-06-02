import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const globalForPrisma = (global as any) as {
  prisma: PrismaClient;
};

const useAccelerate = process.env.DATABASE_URL?.startsWith("prisma://");

const prisma =
  globalForPrisma.prisma ||
  (process.env.VITEST || !useAccelerate
    ? new PrismaClient()
    : new PrismaClient().$extends(withAccelerate()));

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
