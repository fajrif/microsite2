-- AlterTable
ALTER TABLE "classifications" ADD COLUMN "orderNo" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "showcases" ADD COLUMN "orderNo" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "samples" ADD COLUMN "orderNo" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "metrics" ADD COLUMN "orderNo" INTEGER NOT NULL DEFAULT 0;
