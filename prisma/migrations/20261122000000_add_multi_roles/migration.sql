-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'WORSHIP';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'MEDIA';

-- AlterTable: add multi-role array column
ALTER TABLE "User" ADD COLUMN "roles" "UserRole"[] NOT NULL DEFAULT ARRAY[]::"UserRole"[];

-- Preserve existing ADMIN users (uses pre-existing 'ADMIN' enum value, safe in single transaction)
UPDATE "User" SET "roles" = ARRAY['ADMIN']::"UserRole"[] WHERE "role" = 'ADMIN';

-- Drop superseded single-role column
ALTER TABLE "User" DROP COLUMN "role";
