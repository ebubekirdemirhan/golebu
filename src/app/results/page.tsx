'use client';

import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import StatsOverview from '@/components/layout/StatsOverview';
import { useState, useEffect } from 'react';
import type { OverallStats } from '@/lib/types';

type ResultRow = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  competition: string;
  utcDate: string;
  actualScore: { home: number; away: number };
  predictions: {
    winner: string;
    winnerHit: boolean;
    over25: number;
    over25Hit: boolean;
    btts: number;
    bttsHit: boolean;
    hy05: number;
    hy05Hit: boolean;
  };
  note?: string;
};

function HitBadge({ hit }: { hit: boolean }) {
  return hit ? (
    <CheckCircle className="w-4 h-4 text-green-400" />
  ) : (
    <XCircle className="w-4 h-4 text-red-400" />
  );
}

function formatDate(utcDate: string): string {
  const date = new Date(utcDate);
  const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

export default function ResultsPage() {
  const [mounted, setMounted] = useState(false);
  const [results, setResults] = useState<ResultRow[]>([]);
  const [stats, setStats] = useState<OverallStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [demo, setDemo] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/results');
        const data = await res.json();
        if (cancelled) return;
        setResults(data.results ?? []);
        setStats(data.stats ?? null);
        setDemo(Boolean(data.demo));
        if (data.message) setMessage(data.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading || !stats) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white mb-1">
          📊 Sonuç <span className="gradient-text">Takibi</span>
        </h1>
        <p className="text-gray-400 text-sm">Geçmiş maçlar ve tahmin özeti</p>
        {demo && (
          <p className="text-blue-400/80 text-xs mt-2">Örnek veri — API ile canlı sonuçlar gelince güncellenir.</p>
        )}
        {message && <p className="text-gray-500 text-xs mt-2">{message}</p>}
      </div>

      <StatsOverview stats={stats} />

      <div className="space-y-3">
        {results.map((result) => (
          <div key={result.id} className="bg-[#13132a] border border-white/5 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-gray-400 text-xs mb-0.5">{result.competition}</p>
                <p className="text-white font-bold text-sm">
                  {result.homeTeam} <span className="text-gray-400">vs</span> {result.awayTeam}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-white">
                  {result.actualScore.home} - {result.actualScore.away}
                </div>
                <p className="text-gray-500 text-xs">{mounted ? formatDate(result.utcDate) : ''}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="bg-[#1a1a35] rounded-lg p-2 flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs">Kazanan</p>
                  <p className="text-white text-xs font-medium">{result.predictions.winner}</p>
                </div>
                <HitBadge hit={result.predictions.winnerHit} />
              </div>
              <div className="bg-[#1a1a35] rounded-lg p-2 flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs">2.5 Gol Üstü</p>
                  <p className="text-white text-xs font-medium">%{result.predictions.over25}</p>
                </div>
                <HitBadge hit={result.predictions.over25Hit} />
              </div>
              <div className="bg-[#1a1a35] rounded-lg p-2 flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs">KG Var</p>
                  <p className="text-white text-xs font-medium">%{result.predictions.btts}</p>
                </div>
                <HitBadge hit={result.predictions.bttsHit} />
              </div>
              <div className="bg-[#1a1a35] rounded-lg p-2 flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs">İY 0.5 Üst</p>
                  <p className="text-white text-xs font-medium">%{result.predictions.hy05}</p>
                </div>
                <HitBadge hit={result.predictions.hy05Hit} />
              </div>
            </div>

            {result.note && (
              <div className="bg-white/5 rounded-lg p-2">
                <p className="text-gray-400 text-xs">💡 {result.note}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
