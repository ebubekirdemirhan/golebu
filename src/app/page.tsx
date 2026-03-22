'use client';

import MatchesSection from '@/components/analysis/MatchesSection';
import StatsOverview from '@/components/layout/StatsOverview';
import DemoBanner from '@/components/layout/DemoBanner';
import { Zap, Loader2, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Analysis, OverallStats } from '@/lib/types';

export default function HomePage() {
  const [dateStr, setDateStr] = useState('');
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [stats, setStats] = useState<OverallStats | null>(null);
  const [demo, setDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    const d = new Date();
    const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    setDateStr(`${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/matches');
        const data = await res.json();
        if (cancelled) return;
        setAnalyses(data.analyses ?? []);
        setStats(data.stats ?? null);
        setDemo(Boolean(data.demo));
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
          <MatchesSection analyses={analyses} />
        </>
      )}
    </div>
  );
}
