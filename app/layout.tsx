import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Plus_Jakarta_Sans, Manrope } from "next/font/google";
import { cn } from "@/lib/utils";
import { Providers } from '@/components/Providers';
import { ChatWidget } from '@/components/chat/ChatWidget';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'Sewa Mobil Jogja | Lepas Kunci & Include Driver - RentalMobil',
  description: 'Jasa sewa mobil terpercaya di Yogyakarta dengan pilihan lepas kunci dan dengan driver. Armada terawat, harga kompetitif, layanan 24 jam. BBM tidak termasuk.',
  keywords: 'sewa mobil jogja, rental mobil yogyakarta, sewa mobil lepas kunci, sewa mobil dengan driver, rental mobil murah jogja',
  authors: [{ name: 'RentalMobil Jogja' }],
  robots: 'index, follow',
  alternates: {
    canonical: 'https://rentalmobiljogja.com',
  },
  openGraph: {
    title: 'Sewa Mobil Jogja | Lepas Kunci & Include Driver',
    description: 'Jasa sewa mobil terpercaya di Yogyakarta dengan pilihan lepas kunci dan dengan driver. Armada terawat, harga kompetitif.',
    url: 'https://rentalmobiljogja.com',
    siteName: 'RentalMobil Jogja',
    type: 'website',
    images: [
      {
        url: 'https://rentalmobiljogja.com/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'RentalMobil Jogja - Sewa Mobil Terpercaya',
      },
    ],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1.0,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning className={cn(plusJakarta.variable, manrope.variable, "font-sans")}>
      <head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased font-sans">
        <Providers>
          {children}
          <ChatWidget />
        </Providers>
      </body>
    </html>
  );
}
