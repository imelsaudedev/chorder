-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "preacherId" TEXT;

-- CreateTable
CREATE TABLE "ServiceLeader" (
    "id" SERIAL NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "ServiceLeader_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Service_preacherId_idx" ON "Service"("preacherId");

-- CreateIndex
CREATE INDEX "ServiceLeader_serviceId_idx" ON "ServiceLeader"("serviceId");

-- CreateIndex
CREATE INDEX "ServiceLeader_userId_idx" ON "ServiceLeader"("userId");

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_preacherId_fkey" FOREIGN KEY ("preacherId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceLeader" ADD CONSTRAINT "ServiceLeader_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceLeader" ADD CONSTRAINT "ServiceLeader_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
