import { NextResponse } from 'next/server';
import {
  getTodayMatches,
  getTeamMatches,
  calculateTeamStats,
  getMockMatches,
} from '@/lib/football-api';
import { getApiFootballMatchesInRange, hasApiFootballKey } from '@/lib/api-football';
import { mergeWithReservedSecondarySlots } from '@/lib/match-merge';
import { ALL_LEAGUE_CODES } from '@/lib/leagues.config';
import { generateAnalysis, generateMockAnalysis } from '@/lib/analysis-engine';
import type { Analysis, Match, OverallStats } from '@/lib/types';

export const dynamic = 'force-dynamic';

/**
 * İki kaynak birleşince üst sınır (football-data + API-Football).
 * Çok yükseltmek football-data dakika kotasını (ücretsiz plan) zorlayabilir.
 */
const MAX_MATCHES = 20;

function hasFootballDataKey(): boolean {
  const k = process.env.FOOTBALL_DATA_API_KEY;
  return Boolean(k && k !== 'your_football_data_api_key_here');
}

async function analysisForMatch(match: Match): Promise<Analysis> {
  if (match.dataSource === 'api-football') {
    const a = generateMockAnalysis(match);
    return { ...a, statsQuality: 'estimated' };
  }

  try {
    const [homeMatches, awayMatches] = await Promise.all([
      getTeamMatches(match.homeTeam.id, 10),
      getTeamMatches(match.awayTeam.id, 10),
    ]);
    const homeStats = calculateTeamStats(homeMatches, match.homeTeam.id);
    const awayStats = calculateTeamStats(awayMatches, match.awayTeam.id);

    if (homeStats.last5.length < 2 || awayStats.last5.length < 2) {
      const a = generateMockAnalysis(match);
      return { ...a, statsQuality: 'estimated' };
    }
    return generateAnalysis(match, homeStats, awayStats);
  } catch {
    const a = generateMockAnalysis(match);
    return { ...a, statsQuality: 'estimated' };
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
  const hasFd = hasFootballDataKey();
  const hasAf = hasApiFootballKey();

  const today = new Date().toISOString().split('T')[0];
  const weekEnd = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

  if (!hasFd && !hasAf) {
    const matches = getMockMatches();
    const analyses = await Promise.all(matches.map((m) => analysisForMatch(m)));
    return NextResponse.json({
      analyses,
      stats: defaultStats,
      demo: true,
      source: 'mock',
      sources: { footballData: false, apiFootball: false },
    });
  }

  let primary: Match[] = [];
  if (hasFd) {
    const raw = await getTodayMatches();
    primary = raw
      .filter((m) => ALL_LEAGUE_CODES.has(m.competition.code))
      .map((m) => ({ ...m, dataSource: 'football-data' as const }));
  }

  let secondary: Match[] = [];
  if (hasAf) {
    secondary = await getApiFootballMatchesInRange(today, weekEnd);
  }

  /* İkincil kaynağa en fazla 8 slot (API-F körfez/Türkiye maçları görünsün) */
  let merged = mergeWithReservedSecondarySlots(primary, secondary, MAX_MATCHES, 8);
  merged = merged.filter(
    (m) =>
      m.dataSource === 'api-football' ||
      ALL_LEAGUE_CODES.has(m.competition.code)
  );

  if (merged.length === 0) {
    return NextResponse.json({
      analyses: [] as Analysis[],
      stats: defaultStats,
      demo: false,
      source: 'empty',
      sources: { footballData: hasFd, apiFootball: hasAf },
      message:
        'Seçilen tarih aralığında maç bulunamadı. API kotası veya lig sezon parametresini kontrol edin (API-Football ücretsiz plan günlük limit).',
    });
  }

  const analyses = await Promise.all(merged.map((m) => analysisForMatch(m)));

  const sourceLabel =
    hasFd && hasAf ? 'football-data.org+api-football' : hasFd ? 'football-data.org' : 'api-football';

  return NextResponse.json({
    analyses,
    stats: defaultStats,
    demo: false,
    source: sourceLabel,
    sources: { footballData: hasFd, apiFootball: hasAf },
  });
}
