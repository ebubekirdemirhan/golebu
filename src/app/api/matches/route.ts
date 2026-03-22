import { NextResponse } from 'next/server';
import {
  getTodayMatches,
  getTeamMatches,
  calculateTeamStats,
  getMockMatches,
  SUPPORTED_LEAGUES,
} from '@/lib/football-api';
import { generateAnalysis, generateMockAnalysis } from '@/lib/analysis-engine';
import type { Analysis, Match, OverallStats } from '@/lib/types';

export const dynamic = 'force-dynamic';

const SUPPORTED_CODES = new Set(SUPPORTED_LEAGUES.map((l) => l.code));
const MAX_MATCHES = 8;

function hasApiKey(): boolean {
  const k = process.env.FOOTBALL_DATA_API_KEY;
  return Boolean(k && k !== 'your_football_data_api_key_here');
}

async function analysisForMatch(match: Match): Promise<Analysis> {
  try {
    const [homeMatches, awayMatches] = await Promise.all([
      getTeamMatches(match.homeTeam.id, 10),
      getTeamMatches(match.awayTeam.id, 10),
    ]);
    const homeStats = calculateTeamStats(homeMatches, match.homeTeam.id);
    const awayStats = calculateTeamStats(awayMatches, match.awayTeam.id);

    if (homeStats.last5.length < 2 || awayStats.last5.length < 2) {
      return generateMockAnalysis(match);
    }
    return generateAnalysis(match, homeStats, awayStats);
  } catch {
    return generateMockAnalysis(match);
  }
}

const defaultStats: OverallStats = {
  totalMatches: 24,
  winnerSuccess: 67,
  over25Success: 78,
  bttsSuccess: 72,
  hy05Success: 81,
};

export async function GET() {
  const apiConfigured = hasApiKey();

  let matches: Match[] = [];
  let demo = !apiConfigured;

  if (apiConfigured) {
    const raw = await getTodayMatches();
    matches = raw.filter((m) => SUPPORTED_CODES.has(m.competition.code)).slice(0, MAX_MATCHES);
  }

  if (!apiConfigured || matches.length === 0) {
    if (!apiConfigured) {
      matches = getMockMatches();
      demo = true;
    } else {
      return NextResponse.json({
        analyses: [] as Analysis[],
        stats: defaultStats,
        demo: false,
        source: 'football-data.org',
        message:
          'Bugün desteklenen liglerde planlanmış maç bulunamadı. Yarın tekrar dene veya API kotanı kontrol et.',
      });
    }
  }

  const analyses = await Promise.all(matches.map((m) => analysisForMatch(m)));

  return NextResponse.json({
    analyses,
    stats: defaultStats,
    demo,
    source: demo ? 'mock' : 'football-data.org',
  });
}
