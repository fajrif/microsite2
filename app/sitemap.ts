import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const baseUrl = "https://micrositecreativeone.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const showcases = await prisma.showcase.findMany({
    select: { slug: true, updatedAt: true },
    orderBy: { orderNo: "asc" },
  });

  const showcaseEntries: MetadataRoute.Sitemap = showcases.map((showcase) => ({
    url: `${baseUrl}/showcases/${showcase.slug}`,
    lastModified: showcase.updatedAt,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/showcases`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    ...showcaseEntries,
  ];
}
