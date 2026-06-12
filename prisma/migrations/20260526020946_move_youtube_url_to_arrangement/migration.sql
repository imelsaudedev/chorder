/*
  Warnings:

  - You are about to drop the column `youtubeUrl` on the `Song` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Song" DROP COLUMN "youtubeUrl";

-- AlterTable
ALTER TABLE "SongArrangement" ADD COLUMN     "youtubeUrl" TEXT;
