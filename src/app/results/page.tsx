import { CheckCircle, XCircle } from 'lucide-react';
import { formatMatchDate } from '@/lib/utils';
import StatsOverview from '@/components/layout/StatsOverview';

async function getResults() {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const [resultsRes, statsRes] = await Promise.all([
      fetch(`${baseUrl}/api/results`, { next: { revalidate: 300 } }),
      fetch(`${baseUrl}/api/results?type=stats`, { next: { revalidate: 300 } }),
    ]);
    const results = await resultsRes.json();
    const statsData = await statsRes.json();
    return { results: results.results, stats: statsData.stats };
  } catch {
    return { results: [], stats: { totalMatches: 0, winnerSuccess: 0, over25Success: 0, bttsSuccess: 0, hy05Success: 0 } };
  }
}

function HitBadge({ hit }: { hit: boolean }) {
  return hit ? (
    <CheckCircle className="w-4 h-4 text-green-400" />
  ) : (
    <XCircle className="w-4 h-4 text-red-400" />
  );
}

export default async function ResultsPage() {
  const { results, stats } = await getResults();

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white mb-1">
          📊 Sonuç <span className="gradient-text">Takibi</span>
        </h1>
        <p className="text-gray-400 text-sm">Geçmiş tahminler ve doğruluk oranları</p>
      </div>

      <StatsOverview stats={stats} />

      <div className="space-y-3">
        {results.map((result: {
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
          note: string;
        }) => (
          <div key={result.id} className="bg-[#13132a] border border-white/5 rounded-2xl p-4">
            {/* Maç başlığı */}
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
                <p className="text-gray-500 text-xs">{formatMatchDate(result.utcDate)}</p>
              </div>
            </div>

            {/* Tahmin sonuçları */}
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

            {/* Analiz notu */}
            {result.note && (
              <div className="bg-white/5 rounded-lg p-2">
                <p className="text-gray-400 text-xs">💡 {result.note}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {results.length === 0 && (
        <div className="text-center py-16">
          <span className="text-4xl mb-4 block">📊</span>
          <p className="text-gray-400">Henüz sonuç kaydedilmemiş.</p>
        </div>
      )}
    </div>
  );
}
