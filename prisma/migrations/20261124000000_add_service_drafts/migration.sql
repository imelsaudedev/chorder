-- CreateEnum
CREATE TYPE "ServiceStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "status" "ServiceStatus" NOT NULL DEFAULT 'PUBLISHED',
ADD COLUMN     "createdById" TEXT;

-- CreateIndex
CREATE INDEX "Service_createdById_idx" ON "Service"("createdById");

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
