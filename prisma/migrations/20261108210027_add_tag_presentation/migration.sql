-- CreateEnum
CREATE TYPE "TagGroupPresentation" AS ENUM ('FEATURED', 'SHELF', 'FILTER');

-- CreateEnum
CREATE TYPE "TagGroupSelection" AS ENUM ('SINGLE', 'MULTI');

-- AlterTable
ALTER TABLE "Tag" ADD COLUMN     "color" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "pattern" TEXT;

-- AlterTable
ALTER TABLE "TagGroup" ADD COLUMN     "description" TEXT,
ADD COLUMN     "isProposed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "presentation" "TagGroupPresentation" NOT NULL DEFAULT 'FILTER',
ADD COLUMN     "selection" "TagGroupSelection" NOT NULL DEFAULT 'MULTI';
