import { NextRequest, NextResponse } from 'next/server';

// Demo sonuçlar (gerçek uygulamada Supabase'den gelir)
const DEMO_RESULTS = [
  {
    id: '1',
    matchId: 9001,
    homeTeam: 'Brighton & Hove Albion',
    awayTeam: 'Liverpool',
    competition: 'Premier League',
    utcDate: new Date(Date.now() - 86400000 * 2).toISOString(),
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
    note: 'Gol marketleri güçlü okumaya devam ediyor. Maç beklendiği gibi gollü geçti.',
  },
  {
    id: '2',
    matchId: 9002,
    homeTeam: 'Manchester City',
    awayTeam: 'Arsenal',
    competition: 'Premier League',
    utcDate: new Date(Date.now() - 86400000 * 1).toISOString(),
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
    note: 'Tüm tahminler tuttu. Yüksek güven skoru doğrulandı.',
  },
  {
    id: '3',
    matchId: 9003,
    homeTeam: 'Real Madrid',
    awayTeam: 'Barcelona',
    competition: 'La Liga',
    utcDate: new Date(Date.now() - 86400000 * 3).toISOString(),
    actualScore: { home: 1, away: 2 },
    predictions: {
      winner: 'Real Madrid Kazanır',
      winnerHit: false,
      over25: 82,
      over25Hit: true,
      btts: 78,
      bttsHit: true,
      hy05: 88,
      hy05Hit: false,
    },
    note: 'Sonuç tarafında sürpriz çıktı. Gol marketleri yine beklentiyi karşıladı.',
  },
  {
    id: '4',
    matchId: 9004,
    homeTeam: 'Bayern München',
    awayTeam: 'Dortmund',
    competition: 'Bundesliga',
    utcDate: new Date(Date.now() - 86400000 * 4).toISOString(),
    actualScore: { home: 4, away: 2 },
    predictions: {
      winner: 'Bayern München Kazanır',
      winnerHit: true,
      over25: 91,
      over25Hit: true,
      btts: 85,
      bttsHit: true,
      hy05: 93,
      hy05Hit: true,
    },
    note: '4 tahminden 4 tuttu! Bundesliga derbisinde mükemmel okuma.',
  },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'recent';

  if (type === 'stats') {
    // Genel istatistik hesapla
    const total = DEMO_RESULTS.length;
    const winnerHits = DEMO_RESULTS.filter(r => r.predictions.winnerHit).length;
    const over25Hits = DEMO_RESULTS.filter(r => r.predictions.over25Hit).length;
    const bttsHits = DEMO_RESULTS.filter(r => r.predictions.bttsHit).length;
    const hy05Hits = DEMO_RESULTS.filter(r => r.predictions.hy05Hit).length;

    return NextResponse.json({
      stats: {
        totalMatches: total,
        winnerSuccess: Math.round((winnerHits / total) * 100),
        over25Success: Math.round((over25Hits / total) * 100),
        bttsSuccess: Math.round((bttsHits / total) * 100),
        hy05Success: Math.round((hy05Hits / total) * 100),
      },
    });
  }

  return NextResponse.json({ results: DEMO_RESULTS });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Gerçek uygulamada Supabase'e kaydet
    console.log('Result saved:', body);
    return NextResponse.json({ success: true, id: `result_${Date.now()}` });
  } catch {
    return NextResponse.json({ error: 'Kayıt başarısız' }, { status: 500 });
  }
}
