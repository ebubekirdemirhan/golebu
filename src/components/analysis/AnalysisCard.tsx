'use client';

import { Analysis } from '@/lib/types';
import { getLeagueFlag } from '@/lib/utils';
import GoalTrend from './GoalTrend';
import StatBadge from './StatBadge';
import { Trophy, Diamond, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Props {
  analysis: Analysis;
  showTrend?: boolean;
}

const confidenceColors: Record<string, string> = {
  'Düşük': 'bg-red-500/20 text-red-400 border border-red-500/30',
  'Orta': 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  'Yüksek': 'bg-green-500/20 text-green-400 border border-green-500/30',
  'Çok Yüksek': 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
};

const confidenceBorder: Record<string, string> = {
  'Düşük': 'border-red-500/20',
  'Orta': 'border-yellow-500/20',
  'Yüksek': 'border-green-500/30',
  'Çok Yüksek': 'border-purple-500/40',
};

export default function AnalysisCard({ analysis, showTrend = true }: Props) {
  const flag = getLeagueFlag(analysis.competition.code);
  const [matchTime, setMatchTime] = useState('');

  useEffect(() => {
    const date = new Date(analysis.utcDate);
    setMatchTime(date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }));
  }, [analysis.utcDate]);

  return (
    <div className={`bg-[#13132a] rounded-2xl border ${confidenceBorder[analysis.confidence]} overflow-hidden`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm">{flag}</span>
          <span className="text-purple-400 text-sm font-medium">{analysis.competition.name}</span>
        </div>
        <span className="text-gray-400 text-sm font-mono">{matchTime}</span>
      </div>

      {analysis.statsQuality === 'estimated' && (
        <div className="mx-4 mb-2 rounded-lg bg-amber-500/10 border border-amber-500/25 px-3 py-2">
          <p className="text-amber-200/90 text-[11px] leading-snug">
            <span className="font-semibold text-amber-300">Tahmini analiz:</span> Bu maç ikincil veri kaynağından (API-Football).
            Son maç / gol trendi gerçek istatistik değil; model üretimidir.
          </p>
        </div>
      )}

      {/* Takımlar */}
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex-1 text-left">
          <p className="text-white font-bold text-lg leading-tight">{analysis.homeTeam.name}</p>
        </div>

        <div className="mx-4 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full border-2 border-green-400 bg-[#1a1a35] flex items-center justify-center shadow-lg shadow-green-400/20">
            <span className="text-white font-bold text-xs text-center leading-tight">GOL<br/>EBU</span>
          </div>
        </div>

        <div className="flex-1 text-right">
          <p className="text-white font-bold text-lg leading-tight">{analysis.awayTeam.name}</p>
        </div>
      </div>

      {/* İstatistik Kutuları */}
      <div className="grid grid-cols-2 gap-3 px-4 pb-3">
        <StatBadge
          label="2.5 GOL ÜSTÜ"
          value={`${analysis.over25Pct}%`}
          pct={analysis.over25Pct}
          icon="🎯"
        />
        <StatBadge
          label="İY 0.5 ÜST"
          value={`${analysis.hy05Pct}%`}
          pct={analysis.hy05Pct}
          icon="⚽"
        />
        <StatBadge
          label="KG VAR (BTTS)"
          value={`${analysis.btts}%`}
          pct={analysis.btts}
          icon="🔁"
        />
        <StatBadge
          label="GOL ORT."
          value={`${analysis.homeGoalAvg} / ${analysis.awayGoalAvg}`}
          pct={null}
          icon="📊"
        />
      </div>

      {/* Kazanan Tahmini */}
      <div className="mx-4 mb-3 bg-[#1a1a35] rounded-xl p-3 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="text-gray-400 text-xs uppercase tracking-wide">KAZANAN TAHMİNİ</span>
          </div>
          <p className="text-white font-bold text-base">{analysis.winnerTeamName} Kazanır</p>
        </div>
        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${confidenceColors[analysis.confidence]}`}>
          Taraf Güveni: {analysis.confidence}
        </span>
      </div>

      {/* Value Bet (varsa) */}
      {analysis.valueBet && (
        <div className="mx-4 mb-3 bg-purple-900/20 border border-purple-500/30 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <Diamond className="w-4 h-4 text-purple-400" />
            <span className="text-purple-400 text-xs font-bold uppercase tracking-wide">VALUE BET FIRSATI</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-white text-sm font-medium">{analysis.valueBet.market}</span>
              <p className="text-gray-400 text-xs mt-0.5">
                @ Bizim: %{analysis.valueBet.ourProb} | Bahisçi: %{analysis.valueBet.impliedProb}
              </p>
            </div>
            <span className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-3 py-1 rounded-full text-sm font-bold">
              +{analysis.valueBet.edge}%
            </span>
          </div>
        </div>
      )}

      {/* En güçlü pick (varsa) */}
      {analysis.strongestPick && (
        <div className="mx-4 mb-3 flex items-center gap-2 bg-green-900/10 border border-green-500/20 rounded-lg p-2">
          <Zap className="w-3.5 h-3.5 text-green-400 shrink-0" />
          <p className="text-green-400 text-xs">En güçlü tahmin: <strong>{analysis.strongestPick}</strong></p>
        </div>
      )}

      {/* Gol Trendi */}
      {showTrend && (
        <div className="mx-4 mb-4 bg-[#1a1a35] rounded-xl p-3">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs">📈</span>
            <span className="text-gray-400 text-xs font-medium uppercase tracking-wide">GOL TRENDİ (Son 5 Maç)</span>
          </div>
          <GoalTrend
            teamName={analysis.homeTeam.name}
            scored={analysis.homeGoalTrend.scored}
            conceded={analysis.homeGoalTrend.conceded}
          />
          <div className="my-2 border-t border-white/5" />
          <GoalTrend
            teamName={analysis.awayTeam.name}
            scored={analysis.awayGoalTrend.scored}
            conceded={analysis.awayGoalTrend.conceded}
          />
          <p className="text-gray-600 text-xs text-right mt-2">← Eski &nbsp;&nbsp; Yeni →</p>
        </div>
      )}
    </div>
  );
}
