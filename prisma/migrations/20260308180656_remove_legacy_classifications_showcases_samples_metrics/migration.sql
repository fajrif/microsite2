/*
  Warnings:

  - You are about to drop the `classifications` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `metrics` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `samples` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `showcases` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "metrics" DROP CONSTRAINT "metrics_showcase_id_fkey";

-- DropForeignKey
ALTER TABLE "samples" DROP CONSTRAINT "samples_showcase_id_fkey";

-- DropForeignKey
ALTER TABLE "showcases" DROP CONSTRAINT "showcases_classification_id_fkey";

-- DropTable
DROP TABLE "classifications";

-- DropTable
DROP TABLE "metrics";

-- DropTable
DROP TABLE "samples";

-- DropTable
DROP TABLE "showcases";
