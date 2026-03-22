'use client';

import { Analysis } from '@/lib/types';
import AnalysisCard from './AnalysisCard';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Lock, Crown } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { ALL_LEAGUE_FILTERS } from '@/lib/leagues.config';

interface Props {
  analyses: Analysis[];
}

const FREE_LIMIT = 2;

const LEAGUE_FILTERS = ['Tümü', ...ALL_LEAGUE_FILTERS.map((l) => l.filterLabel)];

const FILTER_TO_CODE: Record<string, string> = Object.fromEntries(
  ALL_LEAGUE_FILTERS.map((l) => [l.filterLabel, l.code])
);

export default function MatchesSection({ analyses }: Props) {
  const { data: session, status } = useSession();
  const [filter, setFilter] = useState<string>('Tümü');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isPremium = session?.user?.role === 'premium';

  const filtered =
    filter === 'Tümü'
      ? analyses
      : analyses.filter((a) => {
          const code = FILTER_TO_CODE[filter];
          if (code) return a.competition.code === code;
          return a.competition.name.includes(filter);
        });

  if (analyses.length === 0) {
    return (
      <div className="text-center py-16">
        <span className="text-4xl mb-4 block">⚽</span>
        <p className="text-gray-400">Bugün analiz edilecek maç bulunamadı.</p>
        <p className="text-gray-500 text-xs mt-2">football-data.org anahtarı ekli mi ve bugün desteklenen liglerde maç var mı kontrol et.</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-[10px] text-gray-500 mb-1.5 sm:hidden">← Kaydır → tüm ligler</p>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-1 scrollbar-hide">
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

      <p className="text-gray-500 text-xs mb-4">
        {filtered.length} analiz gösteriliyor
        {filter !== 'Tümü' && ` • ${filter}`}
        {mounted && status !== 'loading' && !isPremium && filtered.length > FREE_LIMIT && (
          <span className="text-purple-400 ml-1">• {FREE_LIMIT} ücretsiz, geri kalanı Premium</span>
        )}
      </p>

      <div className="space-y-4">
        {filtered.map((analysis, index) => {
          const isLocked = mounted && status !== 'loading' && !isPremium && index >= FREE_LIMIT;

          if (isLocked) {
            return (
              <div key={analysis.matchId} className="relative">
                <div className="blur-sm pointer-events-none select-none">
                  <AnalysisCard analysis={analysis} showTrend={false} />
                </div>
                <div className="absolute inset-0 bg-[#0a0a1a]/60 backdrop-blur-[2px] rounded-2xl flex items-center justify-center">
                  <div className="text-center">
                    <Lock className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                    <p className="text-white font-bold text-sm mb-1">Premium Analiz</p>
                    <p className="text-gray-400 text-xs mb-3">Bu analizi görmek için giriş yapın</p>
                    <Link
                      href="/login"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                      <Crown className="w-3.5 h-3.5" />
                      Giriş Yap / Kayıt Ol
                    </Link>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div key={analysis.matchId} className="analysis-card">
              <AnalysisCard analysis={analysis} showTrend={true} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
