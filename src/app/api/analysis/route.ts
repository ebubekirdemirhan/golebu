import { NextRequest, NextResponse } from 'next/server';
import { generateAnalysis } from '@/lib/analysis-engine';
import { getMockMatches, getMockTeamStats } from '@/lib/football-api';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const matchId = searchParams.get('matchId');

  if (!matchId) {
    return NextResponse.json({ error: 'matchId parametresi gerekli' }, { status: 400 });
  }

  try {
    // Gerçek API varsa maç verisi çek
    const mockMatches = getMockMatches();
    const match = mockMatches.find(m => m.id === parseInt(matchId));

    if (!match) {
      return NextResponse.json({ error: 'Maç bulunamadı' }, { status: 404 });
    }

    const homeStats = getMockTeamStats(match.homeTeam.name, true);
    const awayStats = getMockTeamStats(match.awayTeam.name, false);
    const analysis = generateAnalysis(match, homeStats, awayStats);

    return NextResponse.json({ analysis });
  } catch {
    return NextResponse.json({ error: 'Analiz üretilemedi' }, { status: 500 });
  }
}
