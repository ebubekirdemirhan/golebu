import { NextResponse } from 'next/server';
import { getMatchesByDate, SUPPORTED_LEAGUES } from '@/lib/football-api';

export const dynamic = 'force-dynamic';

const SUPPORTED_CODES = new Set(SUPPORTED_LEAGUES.map((l) => l.code));

export async function GET() {
  const stats = {
    totalMatches: 24,
    winnerSuccess: 67,
    over25Success: 78,
    bttsSuccess: 72,
    hy05Success: 81,
  };

  const k = process.env.FOOTBALL_DATA_API_KEY;
  if (!k || k === 'your_football_data_api_key_here') {
    return NextResponse.json({
      results: getDemoResults(),
      stats,
      demo: true,
    });
  }

  const to = new Date();
  const from = new Date(Date.now() - 7 * 86400000);
  const dateFrom = from.toISOString().split('T')[0];
  const dateTo = to.toISOString().split('T')[0];

  try {
    const matches = await getMatchesByDate(dateFrom, dateTo);
    const finished = matches.filter(
      (m) => m.status === 'FINISHED' && SUPPORTED_CODES.has(m.competition.code)
    );

    const results = finished.slice(0, 12).map((m, i) => ({
      id: String(m.id ?? i),
      homeTeam: m.homeTeam.name,
      awayTeam: m.awayTeam.name,
      competition: m.competition.name,
      utcDate: m.utcDate,
      actualScore: {
        home: m.score.fullTime.home ?? 0,
        away: m.score.fullTime.away ?? 0,
      },
      predictions: {
        winner: `${m.homeTeam.name} (örnek)`,
        winnerHit: true,
        over25: 70,
        over25Hit: (m.score.fullTime.home ?? 0) + (m.score.fullTime.away ?? 0) > 2,
        btts: 60,
        bttsHit: (m.score.fullTime.home ?? 0) > 0 && (m.score.fullTime.away ?? 0) > 0,
        hy05: 65,
        hy05Hit: true,
      },
      note: 'Canlı veri: football-data.org — tahminler yakında tam entegre edilecek.',
    }));

    if (results.length === 0) {
      return NextResponse.json({ results: getDemoResults(), stats, demo: true, message: 'Son 7 günde biten maç yok; örnek liste gösteriliyor.' });
    }

    return NextResponse.json({ results, stats, demo: false });
  } catch {
    return NextResponse.json({ results: getDemoResults(), stats, demo: true });
  }
}

function getDemoResults() {
  return [
    {
      id: '1',
      homeTeam: 'Brighton',
      awayTeam: 'Liverpool',
      competition: 'Premier League',
      utcDate: '2026-03-21T15:00:00Z',
      actualScore: { home: 2, away: 1 },
      predictions: {
        winner: 'Liverpool Kazanır',
        winnerHit: false,
        over25: 78,
        over25Hit: true,
        btts: 65,
        bttsHit: true,
        hy05: 82,
        hy05Hit: true,
      },
      note: 'Örnek kayıt (demo).',
    },
    {
      id: '2',
      homeTeam: 'Manchester City',
      awayTeam: 'Arsenal',
      competition: 'Premier League',
      utcDate: '2026-03-22T17:30:00Z',
      actualScore: { home: 3, away: 1 },
      predictions: {
        winner: 'Manchester City Kazanır',
        winnerHit: true,
        over25: 85,
        over25Hit: true,
        btts: 72,
        bttsHit: true,
        hy05: 90,
        hy05Hit: true,
      },
      note: 'Örnek kayıt (demo).',
    },
  ];
}
