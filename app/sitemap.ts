import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const baseUrl = "https://micrositedemotwo.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const adProducts = await prisma.adProduct.findMany({
    select: { slug: true, updatedAt: true },
    orderBy: { orderNo: "asc" },
  });

  const adProductEntries: MetadataRoute.Sitemap = adProducts.map((product) => ({
    url: `${baseUrl}/ad-products/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/ad-products`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    ...adProductEntries,
  ];
}
