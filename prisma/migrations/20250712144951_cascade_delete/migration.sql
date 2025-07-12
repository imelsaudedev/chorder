-- DropForeignKey
ALTER TABLE "ServiceUnit" DROP CONSTRAINT "ServiceUnit_arrangementId_fkey";

-- DropForeignKey
ALTER TABLE "ServiceUnit" DROP CONSTRAINT "ServiceUnit_serviceId_fkey";

-- AddForeignKey
ALTER TABLE "ServiceUnit" ADD CONSTRAINT "ServiceUnit_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceUnit" ADD CONSTRAINT "ServiceUnit_arrangementId_fkey" FOREIGN KEY ("arrangementId") REFERENCES "SongArrangement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
