-- DropForeignKey
ALTER TABLE "SongUnit" DROP CONSTRAINT "SongUnit_arrangementId_fkey";

-- AddForeignKey
ALTER TABLE "SongUnit" ADD CONSTRAINT "SongUnit_arrangementId_fkey" FOREIGN KEY ("arrangementId") REFERENCES "SongArrangement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
