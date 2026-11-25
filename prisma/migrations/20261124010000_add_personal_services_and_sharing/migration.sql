-- CreateEnum
CREATE TYPE "ServiceScope" AS ENUM ('CHURCH', 'PERSONAL');

-- CreateEnum
CREATE TYPE "ServiceSharePermission" AS ENUM ('VIEW', 'EDIT');

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "scope" "ServiceScope" NOT NULL DEFAULT 'CHURCH',
ADD COLUMN     "shareToken" TEXT;

-- CreateTable
CREATE TABLE "ServiceShare" (
    "id" SERIAL NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "permission" "ServiceSharePermission" NOT NULL DEFAULT 'VIEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServiceShare_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Service_shareToken_key" ON "Service"("shareToken");

-- CreateIndex
CREATE INDEX "Service_scope_idx" ON "Service"("scope");

-- CreateIndex
CREATE INDEX "ServiceShare_userId_idx" ON "ServiceShare"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceShare_serviceId_userId_key" ON "ServiceShare"("serviceId", "userId");

-- AddForeignKey
ALTER TABLE "ServiceShare" ADD CONSTRAINT "ServiceShare_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceShare" ADD CONSTRAINT "ServiceShare_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
