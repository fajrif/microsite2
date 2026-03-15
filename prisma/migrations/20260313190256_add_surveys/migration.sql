-- CreateTable
CREATE TABLE "surveys" (
    "id" UUID NOT NULL,
    "ad_product_id" UUID NOT NULL,
    "rating" INTEGER NOT NULL,
    "ip" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "surveys_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "surveys_ad_product_id_idx" ON "surveys"("ad_product_id");

-- CreateIndex
CREATE INDEX "surveys_ip_ad_product_id_idx" ON "surveys"("ip", "ad_product_id");

-- AddForeignKey
ALTER TABLE "surveys" ADD CONSTRAINT "surveys_ad_product_id_fkey" FOREIGN KEY ("ad_product_id") REFERENCES "ad_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
