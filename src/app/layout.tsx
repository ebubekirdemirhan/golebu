import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import { SessionProvider } from '@/components/providers/SessionProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'GolEbu - AI Destekli Futbol Analiz Platformu',
  description: 'Yapay zeka destekli futbol maç analizleri, tahminler ve istatistikler.',
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
