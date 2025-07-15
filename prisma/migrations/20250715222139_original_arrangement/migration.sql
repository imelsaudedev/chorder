-- AlterTable
ALTER TABLE "SongArrangement" ADD COLUMN     "originalArrangementId" INTEGER;

-- AddForeignKey
ALTER TABLE "SongArrangement" ADD CONSTRAINT "SongArrangement_originalArrangementId_fkey" FOREIGN KEY ("originalArrangementId") REFERENCES "SongArrangement"("id") ON DELETE SET NULL ON UPDATE CASCADE;
