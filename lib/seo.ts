// lib/seo.ts
export const SITE_URL = 'https://rentalmobil.co.id';

export function getCanonicalUrl(path: string = ''): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${cleanPath === '/' ? '' : cleanPath}`;
}

export const defaultSEO = {
  title: 'Rental Mobil Terpercaya | Sewa Mobil Jadi Milik Tanpa Biaya Awal',
  description: 'Sewa mobil dengan skema kepemilikan 5 tahun, tanpa biaya awal, asuransi dan pajak ditanggung. Daftar sekarang dan miliki mobil impian Anda.',
  keywords: ['sewa mobil', 'rental mobil', 'kepemilikan mobil', 'mobil bekas', 'driver online', 'sewa mobil jakarta', 'sewa mobil yogyakarta'],
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: SITE_URL,
    siteName: 'RentalMobil',
    title: 'Rental Mobil Terpercaya | Sewa Mobil Jadi Milik Tanpa Biaya Awal',
    description: 'Sewa mobil dengan skema kepemilikan 5 tahun, tanpa biaya awal, asuransi dan pajak ditanggung.',
    images: [
      {
        url: `${SITE_URL}/images/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'RentalMobil - Sewa Mobil Jadi Milik',
      },
    ],
  },
};
