-- CreateTable
CREATE TABLE "ArrangementAudio" (
    "id" SERIAL NOT NULL,
    "arrangementId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ArrangementAudio_pkey" PRIMARY KEY ("id")
);

-- Migrate existing audioUrl values
INSERT INTO "ArrangementAudio" ("arrangementId", "url", "label", "order")
SELECT
    "id",
    "audioUrl",
    COALESCE(
        NULLIF(regexp_replace(split_part("audioUrl", '/', -1), '^\d+-', ''), ''),
        'Áudio'
    ),
    0
FROM "SongArrangement"
WHERE "audioUrl" IS NOT NULL AND "audioUrl" <> '';

-- AlterTable
ALTER TABLE "SongArrangement" DROP COLUMN "audioUrl";

-- AddForeignKey
ALTER TABLE "ArrangementAudio" ADD CONSTRAINT "ArrangementAudio_arrangementId_fkey"
    FOREIGN KEY ("arrangementId") REFERENCES "SongArrangement"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
