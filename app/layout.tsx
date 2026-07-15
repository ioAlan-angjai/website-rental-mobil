import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { Providers } from '@/components/Providers';
import dynamic from 'next/dynamic';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

// Dynamic import LiveChat to avoid SSR issues with localStorage
const LiveChat = dynamic(() => import('@/components/livechat/LiveChat').then(mod => ({ default: mod.LiveChat })), {
  ssr: false,
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
    <html lang="id" suppressHydrationWarning className={cn("font-sans", inter.variable)}>
      <head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white antialiased">
        <Providers>
          {children}
          <LiveChat />
        </Providers>
      </body>
    </html>
  );
}
