-- CreateEnum
CREATE TYPE "CareerStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP');

-- CreateTable
CREATE TABLE "careers" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "employment_type" "EmploymentType" NOT NULL DEFAULT 'FULL_TIME',
    "short_description" TEXT,
    "content" TEXT,
    "requirements" TEXT,
    "benefits" TEXT,
    "salary_range" TEXT,
    "published_date" TIMESTAMP(3),
    "status" "CareerStatus" NOT NULL DEFAULT 'DRAFT',
    "meta_title" TEXT,
    "meta_description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "careers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "classifications" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "orderNo" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "classifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "showcases" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "classification_id" UUID NOT NULL,
    "description" TEXT,
    "tagline" TEXT NOT NULL,
    "objective" TEXT,
    "solution" TEXT,
    "campaign_dates" TEXT,
    "market" TEXT,
    "formats" TEXT,
    "source" TEXT,
    "metrics_text" TEXT,
    "orderNo" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "showcases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "samples" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "showcase_id" UUID NOT NULL,
    "image" TEXT NOT NULL,
    "audio" TEXT,
    "video_link" TEXT,
    "orderNo" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "samples_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metrics" (
    "id" UUID NOT NULL,
    "showcase_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "short_description" TEXT,
    "caption" TEXT,
    "prefix" TEXT,
    "value" DOUBLE PRECISION NOT NULL,
    "suffix" TEXT,
    "hide_name" BOOLEAN NOT NULL DEFAULT false,
    "orderNo" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ad_products" (
    "id" UUID NOT NULL,
    "orderNo" INTEGER NOT NULL DEFAULT 0,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "description" TEXT,
    "tagline" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ad_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "features" (
    "id" UUID NOT NULL,
    "orderNo" INTEGER NOT NULL DEFAULT 0,
    "name" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "video_link" TEXT,
    "audio_link" TEXT,
    "ad_product_id" UUID NOT NULL,
    "caption" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "features_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "careers_title_key" ON "careers"("title");

-- CreateIndex
CREATE UNIQUE INDEX "careers_slug_key" ON "careers"("slug");

-- CreateIndex
CREATE INDEX "careers_slug_idx" ON "careers"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "classifications_name_key" ON "classifications"("name");

-- CreateIndex
CREATE UNIQUE INDEX "showcases_slug_key" ON "showcases"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "showcases_name_key" ON "showcases"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ad_products_name_key" ON "ad_products"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ad_products_slug_key" ON "ad_products"("slug");

-- CreateIndex
CREATE INDEX "ad_products_slug_idx" ON "ad_products"("slug");

-- AddForeignKey
ALTER TABLE "showcases" ADD CONSTRAINT "showcases_classification_id_fkey" FOREIGN KEY ("classification_id") REFERENCES "classifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "samples" ADD CONSTRAINT "samples_showcase_id_fkey" FOREIGN KEY ("showcase_id") REFERENCES "showcases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metrics" ADD CONSTRAINT "metrics_showcase_id_fkey" FOREIGN KEY ("showcase_id") REFERENCES "showcases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "features" ADD CONSTRAINT "features_ad_product_id_fkey" FOREIGN KEY ("ad_product_id") REFERENCES "ad_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
