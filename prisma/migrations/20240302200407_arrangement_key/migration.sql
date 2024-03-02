-- CreateEnum
CREATE TYPE "DBUnitType" AS ENUM ('SONG_INTRO', 'SONG_ENDING', 'SONG_VERSE', 'SONG_PRECHORUS', 'SONG_CHORUS', 'SONG_BRIDGE', 'SONG_INTERLUDE', 'SONG_SOLO', 'SONG_BLOCK');

-- CreateTable
CREATE TABLE "DBSong" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "artist" TEXT,
    "lyrics" TEXT NOT NULL,

    CONSTRAINT "DBSong_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DBSongArrangement" (
    "id" SERIAL NOT NULL,
    "songId" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT true,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "DBSongArrangement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DBUnit" (
    "id" SERIAL NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "type" "DBUnitType" NOT NULL DEFAULT 'SONG_BLOCK',
    "localUID" TEXT,

    CONSTRAINT "DBUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DBArrangementUnit" (
    "id" SERIAL NOT NULL,
    "arrangementId" INTEGER NOT NULL,
    "unitId" INTEGER NOT NULL,
    "indexInArrangement" INTEGER NOT NULL,

    CONSTRAINT "DBArrangementUnit_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DBSongArrangement" ADD CONSTRAINT "DBSongArrangement_songId_fkey" FOREIGN KEY ("songId") REFERENCES "DBSong"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DBArrangementUnit" ADD CONSTRAINT "DBArrangementUnit_arrangementId_fkey" FOREIGN KEY ("arrangementId") REFERENCES "DBSongArrangement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DBArrangementUnit" ADD CONSTRAINT "DBArrangementUnit_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "DBUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
