import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://rentalmobil-jogja.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/', '/profil', '/riwayat-booking', '/pelunasan/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
