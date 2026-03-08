-- Delete all data from these tables (FK order: metrics, samples, showcases, classifications)
DELETE FROM "metrics";
DELETE FROM "samples";
DELETE FROM "showcases";
DELETE FROM "classifications";

-- Drop foreign key constraints
ALTER TABLE "metrics" DROP CONSTRAINT IF EXISTS "metrics_showcase_id_fkey";
ALTER TABLE "samples" DROP CONSTRAINT IF EXISTS "samples_showcase_id_fkey";
ALTER TABLE "showcases" DROP CONSTRAINT IF EXISTS "showcases_classification_id_fkey";

-- Alter classifications.id to UUID
ALTER TABLE "classifications" DROP CONSTRAINT "classifications_pkey";
ALTER TABLE "classifications" ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid;
ALTER TABLE "classifications" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "classifications" ADD CONSTRAINT "classifications_pkey" PRIMARY KEY ("id");

-- Alter showcases columns to UUID + add slug
ALTER TABLE "showcases" DROP CONSTRAINT "showcases_pkey";
ALTER TABLE "showcases" ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid;
ALTER TABLE "showcases" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "showcases" ALTER COLUMN "classification_id" SET DATA TYPE UUID USING "classification_id"::uuid;
ALTER TABLE "showcases" ADD COLUMN "slug" TEXT NOT NULL DEFAULT '';
ALTER TABLE "showcases" ADD CONSTRAINT "showcases_pkey" PRIMARY KEY ("id");
CREATE UNIQUE INDEX "showcases_slug_key" ON "showcases"("slug");

-- Remove the default '' after migration (it was only needed for the ALTER)
ALTER TABLE "showcases" ALTER COLUMN "slug" DROP DEFAULT;

-- Alter samples columns to UUID
ALTER TABLE "samples" DROP CONSTRAINT "samples_pkey";
ALTER TABLE "samples" ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid;
ALTER TABLE "samples" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "samples" ALTER COLUMN "showcase_id" SET DATA TYPE UUID USING "showcase_id"::uuid;
ALTER TABLE "samples" ADD CONSTRAINT "samples_pkey" PRIMARY KEY ("id");

-- Alter metrics columns to UUID
ALTER TABLE "metrics" DROP CONSTRAINT "metrics_pkey";
ALTER TABLE "metrics" ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid;
ALTER TABLE "metrics" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "metrics" ALTER COLUMN "showcase_id" SET DATA TYPE UUID USING "showcase_id"::uuid;
ALTER TABLE "metrics" ADD CONSTRAINT "metrics_pkey" PRIMARY KEY ("id");

-- Re-add foreign key constraints
ALTER TABLE "showcases" ADD CONSTRAINT "showcases_classification_id_fkey" FOREIGN KEY ("classification_id") REFERENCES "classifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "samples" ADD CONSTRAINT "samples_showcase_id_fkey" FOREIGN KEY ("showcase_id") REFERENCES "showcases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "metrics" ADD CONSTRAINT "metrics_showcase_id_fkey" FOREIGN KEY ("showcase_id") REFERENCES "showcases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
