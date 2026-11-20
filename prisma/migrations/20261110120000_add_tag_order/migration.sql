-- AlterTable
ALTER TABLE "Tag" ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;

-- Preserva a ordem de hoje (alfabética) dentro de cada grupo
UPDATE "Tag" t SET "order" = r.rn - 1
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY "tagGroupId" ORDER BY name) AS rn
  FROM "Tag"
) r
WHERE t.id = r.id;
