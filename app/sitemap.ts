import { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://rentalmobil-jogja.com';

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/armada`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/layanan`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/testimoni`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/kontak`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  // Dynamic car routes from Supabase PostgreSQL
  try {
    const cars = await prisma.car.findMany({
      select: { id: true, updatedAt: true },
    });

    const carRoutes: MetadataRoute.Sitemap = cars.map((car) => ({
      url: `${baseUrl}/armada/${car.id}`,
      lastModified: car.updatedAt || new Date(),
      changeFrequency: 'weekly',
      priority: 0.85,
    }));

    return [...staticRoutes, ...carRoutes];
  } catch {
    return staticRoutes;
  }
}
