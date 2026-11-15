-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ServiceUnitType" ADD VALUE 'FALA';
ALTER TYPE "ServiceUnitType" ADD VALUE 'LEITURA';
ALTER TYPE "ServiceUnitType" ADD VALUE 'ORACAO';
ALTER TYPE "ServiceUnitType" ADD VALUE 'AVISOS';
ALTER TYPE "ServiceUnitType" ADD VALUE 'SERMAO';
ALTER TYPE "ServiceUnitType" ADD VALUE 'ENCERRAMENTO';

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "plan" JSONB,
ADD COLUMN     "preacher" TEXT,
ADD COLUMN     "sermonReference" TEXT,
ADD COLUMN     "sermonTheme" TEXT;

-- CreateTable
CREATE TABLE "ServiceTemplate" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "items" JSONB NOT NULL,

    CONSTRAINT "ServiceTemplate_pkey" PRIMARY KEY ("id")
);

