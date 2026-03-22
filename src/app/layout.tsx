import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import { SessionProvider } from '@/components/providers/SessionProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'GolLazım - AI Destekli Futbol Analiz Platformu',
  description: 'Yapay zeka destekli futbol maç analizleri, tahminler ve istatistikler. 2.5 Gol Üstü, KG Var, İY 0.5 Üst tahminleri.',
  keywords: 'futbol analiz, maç tahmini, 2.5 gol üstü, kg var, iddaa analiz, yapay zeka futbol',
  openGraph: {
    title: 'GolLazım - AI Futbol Analiz',
    description: 'Veri odaklı futbol tahminleri. %65+ eşik sistemi.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className="dark">
      <body className={`${inter.className} bg-[#0a0a1a] text-white antialiased`}>
        <SessionProvider>
          <Navbar />
          <main className="pt-14 pb-20 md:pt-16 md:pb-8 min-h-screen">
            {children}
          </main>
        </SessionProvider>
      </body>
    </html>
  );
}
