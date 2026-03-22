import { Info } from 'lucide-react';
import Link from 'next/link';

export default function DemoBanner() {
  return (
    <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-3 mb-4 flex items-start gap-3">
      <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
      <div>
        <p className="text-blue-300 text-xs font-medium">Demo Modu Aktif</p>
        <p className="text-blue-400/70 text-xs mt-0.5">
          Gerçek veriler için{' '}
          <Link href="/guide" className="underline">
            kurulum rehberini
          </Link>{' '}
          takip edin ve API key ekleyin.
        </p>
      </div>
    </div>
  );
}
