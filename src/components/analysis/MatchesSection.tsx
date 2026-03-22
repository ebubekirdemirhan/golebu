'use client';

import { Analysis, Match } from '@/lib/types';
import AnalysisCard from './AnalysisCard';
import { useState } from 'react';

interface Props {
  analyses: Analysis[];
  matches?: Match[];
}

const LEAGUE_FILTERS = ['Tümü', 'Premier League', 'La Liga', 'Bundesliga', 'Serie A', 'Ligue 1', 'Champions League'];

export default function MatchesSection({ analyses }: Props) {
  const [filter, setFilter] = useState('Tümü');

  const filtered = filter === 'Tümü'
    ? analyses
    : analyses.filter(a => a.competition.name.includes(filter));

  if (analyses.length === 0) {
    return (
      <div className="text-center py-16">
        <span className="text-4xl mb-4 block">⚽</span>
        <p className="text-gray-400">Bugün analiz edilecek maç bulunamadı.</p>
        <p className="text-gray-600 text-sm mt-1">Yarın tekrar kontrol edin.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Lig filtresi */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {LEAGUE_FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filter === f
                ? 'bg-green-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Analiz sayısı */}
      <p className="text-gray-500 text-xs mb-4">
        {filtered.length} analiz gösteriliyor
        {filter !== 'Tümü' && ` • ${filter}`}
      </p>

      {/* Kartlar */}
      <div className="space-y-4">
        {filtered.map((analysis) => (
          <div key={analysis.matchId} className="analysis-card">
            <AnalysisCard analysis={analysis} showTrend={true} />
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-400 text-sm">Bu ligde bugün analiz yok.</p>
        </div>
      )}
    </div>
  );
}
