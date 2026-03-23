'use client';

import { Analysis, MatchDiagnostics, SourceHealthCode } from '@/lib/types';
import AnalysisCard from './AnalysisCard';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Lock, Crown } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { ALL_LEAGUE_FILTERS } from '@/lib/leagues.config';

interface Props {
  analyses: Analysis[];
  diagnostics?: MatchDiagnostics;
}

const FREE_LIMIT = 2;

const LEAGUE_FILTERS = ['Tümü', ...ALL_LEAGUE_FILTERS.map((l) => l.filterLabel)];

const FILTER_TO_CODE: Record<string, string> = Object.fromEntries(
  ALL_LEAGUE_FILTERS.map((l) => [l.filterLabel, l.code])
);

const HEALTH_BADGE_CLASS: Record<SourceHealthCode, string> = {
  OK: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
  NO_FIXTURE: 'bg-slate-500/15 text-slate-300 border-slate-500/25',
  RATE_LIMIT: 'bg-amber-500/15 text-amber-300 border-amber-500/25',
  PLAN_BLOCK: 'bg-orange-500/15 text-orange-300 border-orange-500/25',
  SCRAPE_BLOCK: 'bg-purple-500/15 text-purple-300 border-purple-500/25',
  TIMEOUT: 'bg-red-500/15 text-red-300 border-red-500/25',
  ERROR: 'bg-red-500/15 text-red-300 border-red-500/25',
};

export default function MatchesSection({ analyses, diagnostics }: Props) {
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

  const diagnosticsPanel = diagnostics?.sourceHealth?.length ? (
    <div className="mb-4 rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <p className="text-[11px] text-gray-300 mb-2">Kaynak Teşhis</p>
      <div className="flex flex-wrap gap-2">
        {diagnostics.sourceHealth.map((s, i) => (
          <span
            key={`${s.source}-${s.code}-${i}`}
            className={`px-2 py-1 rounded-md border text-[11px] ${HEALTH_BADGE_CLASS[s.code]}`}
            title={s.message ?? undefined}
          >
            {s.source}: {s.code} ({s.matchCount})
          </span>
        ))}
      </div>
      <p className="text-[10px] text-gray-500 mt-2">
        Aralık: {diagnostics.range.primaryFrom} → {diagnostics.range.primaryTo}
        {diagnostics.range.fallbackFrom && diagnostics.range.fallbackTo
          ? ` • fallback: ${diagnostics.range.fallbackFrom} → ${diagnostics.range.fallbackTo}`
          : ''}
      </p>
    </div>
  ) : null;

  if (analyses.length === 0) {
    return (
      <>
        {diagnosticsPanel}
        <div className="text-center py-16">
          <span className="text-4xl mb-4 block">⚽</span>
          <p className="text-gray-300">Bu aralıkta analiz edilecek maç bulunamadı.</p>
          <p className="text-gray-500 text-xs mt-2">Yukarıdaki teşhis panelinden hangi kaynağın bloklandığını kontrol et.</p>
        </div>
      </>
    );
  }

  return (
    <div>
      {diagnosticsPanel}
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
