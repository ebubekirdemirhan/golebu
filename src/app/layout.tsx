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

export const dynamic = 'force-dynamic';

/** CSS dosyası engellenirse bile layout bozulmasın: nav çiftlenmesi + beyaz ekran */
const criticalCss = `
  body{background-color:#0a0a1a!important;color:#fff!important;margin:0;}
  main{min-height:100vh;padding-top:3.5rem;padding-bottom:5rem;}
  @media(min-width:768px){
    [data-nav="mobile-bottom"],[data-nav="mobile-top"]{display:none!important;}
  }
  @media(max-width:767px){
    [data-nav="desktop"]{display:none!important;}
  }
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className="dark">
      <head>
        <style dangerouslySetInnerHTML={{ __html: criticalCss }} />
      </head>
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
