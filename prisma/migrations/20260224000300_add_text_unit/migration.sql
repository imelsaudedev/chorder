-- AlterEnum
ALTER TYPE "SongUnitType" ADD VALUE 'TEXT';

-- AlterTable
ALTER TABLE "SongUnit" ADD COLUMN     "title" TEXT;
