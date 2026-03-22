import { Info } from 'lucide-react';
import Link from 'next/link';

export default function DemoBanner({ demo }: { demo: boolean }) {
  if (!demo) return null;

  return (
    <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-3 mb-4 flex items-start gap-3">
      <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
      <div>
        <p className="text-blue-300 text-xs font-medium">Demo modu (örnek maçlar)</p>
        <p className="text-blue-400/70 text-xs mt-0.5">
          Canlı maçlar için Vercel ortam değişkenlerine{' '}
          <code className="text-blue-300">FOOTBALL_DATA_API_KEY</code> ekleyin.{' '}
          <Link href="/guide" className="underline">
            Rehber
          </Link>
        </p>
      </div>
    </div>
  );
}
