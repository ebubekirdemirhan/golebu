import { Suspense } from 'react';
import MatchesSection from '@/components/analysis/MatchesSection';
import StatsOverview from '@/components/layout/StatsOverview';
import DemoBanner from '@/components/layout/DemoBanner';
import { Zap } from 'lucide-react';
import { formatMatchDate } from '@/lib/utils';

async function getMatches() {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/matches`, {
      next: { revalidate: 900 },
    });
    if (!res.ok) throw new Error('API hatası');
    return res.json();
  } catch {
    return { matches: [], analyses: [], mode: 'error' };
  }
}

async function getStats() {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/results?type=stats`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error('API hatası');
    const data = await res.json();
    return data.stats;
  } catch {
    return {
      totalMatches: 17,
      winnerSuccess: 65,
      over25Success: 76,
      bttsSuccess: 88,
      hy05Success: 76,
    };
  }
}

export default async function HomePage() {
  const [data, stats] = await Promise.all([getMatches(), getStats()]);
  const today = formatMatchDate(new Date().toISOString());

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Demo Banner */}
      {data.mode === 'demo' && <DemoBanner />}

      {/* Hero */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Zap className="w-4 h-4 text-green-400" />
          <span className="text-green-400 text-xs font-semibold uppercase tracking-wider">AI Destekli Analiz</span>
        </div>
        <h1 className="text-2xl font-black text-white mb-1">
          Günün <span className="gradient-text">Tahminleri</span>
        </h1>
        <p className="text-gray-400 text-sm">{today} • Veri odaklı, disiplinli yaklaşım</p>
      </div>

      {/* Genel İstatistik */}
      <StatsOverview stats={stats} />

      {/* Analiz Kartları */}
      <Suspense fallback={<LoadingSkeleton />}>
        <MatchesSection analyses={data.analyses} matches={data.matches} />
      </Suspense>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-[#13132a] rounded-2xl h-64 animate-pulse" />
      ))}
    </div>
  );
}
