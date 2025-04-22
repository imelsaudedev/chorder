-- CreateEnum
CREATE TYPE "SongUnitType" AS ENUM ('BLOCK', 'INTRO', 'VERSE', 'PRECHORUS', 'CHORUS', 'BRIDGE', 'INTERLUDE', 'SOLO', 'ENDING');

-- CreateEnum
CREATE TYPE "ServiceUnitType" AS ENUM ('SONG');

-- CreateTable
CREATE TABLE "Song" (
    "id" SERIAL NOT NULL,
    "legacyId" INTEGER,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "lyrics" TEXT NOT NULL,
    "artist" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Song_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SongArrangement" (
    "id" SERIAL NOT NULL,
    "songId" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "isServiceArrangement" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "SongArrangement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SongUnit" (
    "id" SERIAL NOT NULL,
    "arrangementId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "type" "SongUnitType" NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "SongUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" SERIAL NOT NULL,
    "legacyId" INTEGER,
    "title" TEXT,
    "slug" TEXT NOT NULL,
    "worshipLeader" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceUnit" (
    "id" SERIAL NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "type" "ServiceUnitType" NOT NULL,
    "arrangementId" INTEGER,
    "semitoneTranspose" INTEGER DEFAULT 0,
    "order" INTEGER NOT NULL,

    CONSTRAINT "ServiceUnit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Song_legacyId_key" ON "Song"("legacyId");

-- CreateIndex
CREATE UNIQUE INDEX "Song_slug_key" ON "Song"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Service_legacyId_key" ON "Service"("legacyId");

-- CreateIndex
CREATE UNIQUE INDEX "Service_slug_key" ON "Service"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceUnit_arrangementId_key" ON "ServiceUnit"("arrangementId");

-- AddForeignKey
ALTER TABLE "SongArrangement" ADD CONSTRAINT "SongArrangement_songId_fkey" FOREIGN KEY ("songId") REFERENCES "Song"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SongUnit" ADD CONSTRAINT "SongUnit_arrangementId_fkey" FOREIGN KEY ("arrangementId") REFERENCES "SongArrangement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceUnit" ADD CONSTRAINT "ServiceUnit_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceUnit" ADD CONSTRAINT "ServiceUnit_arrangementId_fkey" FOREIGN KEY ("arrangementId") REFERENCES "SongArrangement"("id") ON DELETE SET NULL ON UPDATE CASCADE;
