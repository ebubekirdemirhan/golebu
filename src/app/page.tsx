'use client';

import MatchesSection from '@/components/analysis/MatchesSection';
import StatsOverview from '@/components/layout/StatsOverview';
import { Zap } from 'lucide-react';
import { formatMatchDate } from '@/lib/utils';
import { getStaticAnalyses, getStaticStats } from '@/lib/static-data';

export default function HomePage() {
  const analyses = getStaticAnalyses();
  const stats = getStaticStats();
  const today = formatMatchDate(new Date().toISOString());

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
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
      <MatchesSection analyses={analyses} />
    </div>
  );
}
