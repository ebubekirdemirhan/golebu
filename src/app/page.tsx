'use client';

import MatchesSection from '@/components/analysis/MatchesSection';
import StatsOverview from '@/components/layout/StatsOverview';
import DemoBanner from '@/components/layout/DemoBanner';
import { Zap, Loader2, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Analysis, MatchDiagnostics, OverallStats } from '@/lib/types';

export default function HomePage() {
  const [dateStr, setDateStr] = useState('');
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [stats, setStats] = useState<OverallStats | null>(null);
  const [demo, setDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [sources, setSources] = useState<{
    footballData: boolean;
    apiFootball: boolean;
    scrape?: boolean;
  } | null>(null);
  const [diagnostics, setDiagnostics] = useState<MatchDiagnostics | null>(null);

  useEffect(() => {
    const d = new Date();
    const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    setDateStr(`${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/matches?t=${Date.now()}`, {
          cache: 'no-store',
        });
        const data = await res.json();
        if (cancelled) return;
        setAnalyses(data.analyses ?? []);
        setStats(data.stats ?? null);
        setDemo(Boolean(data.demo));
        if (data.sources) setSources(data.sources);
        if (data.diagnostics) setDiagnostics(data.diagnostics);
        if (data.message) setInfo(data.message);
      } catch {
        if (!cancelled) setError('Maç verisi alınamadı. Sayfayı yenile.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Zap className="w-4 h-4 text-green-400" />
          <span className="text-green-400 text-xs font-semibold uppercase tracking-wider">AI Destekli Analiz</span>
        </div>
        <h1 className="text-2xl font-black text-white mb-1">
          Günün <span className="gradient-text">Tahminleri</span>
        </h1>
        <p className="text-gray-400 text-sm">{dateStr && `${dateStr} • `}Veri odaklı, disiplinli yaklaşım</p>
      </div>

      <DemoBanner demo={demo} />

      {sources && (sources.footballData || sources.apiFootball) && (
        <p className="text-[11px] text-gray-500 mb-3 flex flex-wrap gap-x-2 gap-y-1 items-center">
          <span className="text-gray-600">Aktif veri:</span>
          {sources.footballData && (
            <span className="px-2 py-0.5 rounded-md bg-white/5 text-gray-300">football-data</span>
          )}
          {sources.apiFootball && (
            <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-200/90 border border-amber-500/25">
              API-Football (Türkiye/Körfez ek ligi)
            </span>
          )}
          {sources.scrape && (
            <span className="px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-200/90 border border-purple-500/25">
              Scrape fallback
            </span>
          )}
          <span className="text-gray-600 hidden sm:inline">— Lig filtrelerini sağa kaydırın (Süper Lig, TFF, Suudi…).</span>
        </p>
      )}

      {info && (
        <div className="mb-4 flex items-start gap-2 bg-blue-900/20 border border-blue-500/30 rounded-xl p-3">
          <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <p className="text-blue-300 text-xs">{info}</p>
        </div>
      )}

      {error && (
        <div className="mb-4 flex items-start gap-2 bg-red-900/20 border border-red-500/30 rounded-xl p-3">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <p className="text-red-300 text-xs">{error}</p>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
        </div>
      )}

      {!loading && stats && (
        <>
          <StatsOverview stats={stats} />
          <MatchesSection analyses={analyses} diagnostics={diagnostics ?? undefined} />
        </>
      )}
    </div>
  );
}
