import { NextResponse } from 'next/server';
import {
  getTodayMatches,
  getTeamMatches,
  calculateTeamStats,
  getMockMatches,
  getLeagueStandings,
  getTeamStanding,
  getTeamStandingByName,
  getRaceContext,
  type LeagueStandingsResponse,
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
const MAX_SECONDARY = 8;

function envInt(name: string, fallback: number, min: number, max: number): number {
  const raw = process.env[name];
  const n = raw ? parseInt(raw, 10) : fallback;
  if (Number.isNaN(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

function rankInStandings(
  data: LeagueStandingsResponse | null,
  teamId: number,
  teamName?: string
): number | null {
  return (
    getTeamStanding(data, teamId)?.rank ??
    (teamName ? getTeamStandingByName(data, teamName)?.rank : null) ??
    null
  );
}

function resultForTeam(match: Match, teamId: number): 'W' | 'D' | 'L' {
  const isHome = match.homeTeam.id === teamId;
  const gf = isHome ? (match.score.fullTime.home ?? 0) : (match.score.fullTime.away ?? 0);
  const ga = isHome ? (match.score.fullTime.away ?? 0) : (match.score.fullTime.home ?? 0);
  if (gf > ga) return 'W';
  if (gf === ga) return 'D';
  return 'L';
}

function recordString(results: Array<'W' | 'D' | 'L'>): string {
  if (!results.length) return '-';
  const w = results.filter((r) => r === 'W').length;
  const d = results.filter((r) => r === 'D').length;
  const l = results.filter((r) => r === 'L').length;
  return `${w}G-${d}B-${l}M (${results.length} maç)`;
}

function venueRecord(matches: Match[], teamId: number, isHomeVenue: boolean): string {
  const results = matches
    .filter(
      (m) =>
        m.status === 'FINISHED' &&
        m.score.fullTime.home !== null &&
        (m.homeTeam.id === teamId) === isHomeVenue
    )
    .slice(0, 5)
    .map((m) => resultForTeam(m, teamId));
  return recordString(results);
}

function favoriteRecord(
  matches: Match[],
  teamId: number,
  leagueCode: string,
  standings: LeagueStandingsResponse | null
): string {
  const teamSample = matches.find((m) => m.homeTeam.id === teamId || m.awayTeam.id === teamId);
  const teamName = teamSample
    ? teamSample.homeTeam.id === teamId
      ? teamSample.homeTeam.name
      : teamSample.awayTeam.name
    : '';
  const teamRank = rankInStandings(standings, teamId, teamName);
  if (!teamRank) return '-';
  const results = matches
    .filter(
      (m) =>
        m.status === 'FINISHED' &&
        m.score.fullTime.home !== null &&
        m.competition.code === leagueCode
    )
    .slice(0, 8)
    .flatMap((m) => {
      const opp = m.homeTeam.id === teamId ? m.awayTeam : m.homeTeam;
      const oppRank = rankInStandings(standings, opp.id, opp.name);
      if (!oppRank) return [];
      // düşük sıra = daha güçlü. Team daha yukarıdaysa favori kabul et.
      if (teamRank < oppRank) return [resultForTeam(m, teamId)];
      return [];
    });
  return recordString(results);
}

function last5Opponents(
  matches: Match[],
  teamId: number,
  leagueCode: string,
  standings: LeagueStandingsResponse | null
): Array<{ name: string; rank: number | null }> {
  return matches
    .filter(
      (m) =>
        m.status === 'FINISHED' &&
        m.score.fullTime.home !== null &&
        m.competition.code === leagueCode
    )
    .slice(0, 5)
    .map((m) => {
      const opponent = m.homeTeam.id === teamId ? m.awayTeam : m.homeTeam;
      return {
        name: opponent.name,
        rank: rankInStandings(standings, opponent.id, opponent.name),
      };
    });
}

type RaceTag = 'Sampiyonluk' | 'Avrupa' | 'Orta Sira' | 'Kume Hatti' | 'Bilinmiyor';
function pickRaceTag(
  home: { tag: 'Sampiyonluk' | 'Avrupa' | 'Orta Sira' | 'Kume Hatti'; note: string } | null,
  away: { tag: 'Sampiyonluk' | 'Avrupa' | 'Orta Sira' | 'Kume Hatti'; note: string } | null
): { tag: RaceTag; note: string } {
  const priority: Record<'Sampiyonluk' | 'Avrupa' | 'Orta Sira' | 'Kume Hatti', number> = {
    'Kume Hatti': 4,
    Sampiyonluk: 3,
    Avrupa: 2,
    'Orta Sira': 1,
  };
  if (!home && !away) return { tag: 'Bilinmiyor', note: '' };
  if (!home) return { tag: away!.tag, note: `${away!.note} (Deplasman)` };
  if (!away) return { tag: home.tag, note: `${home.note} (Ev sahibi)` };
  if (priority[home.tag] >= priority[away.tag]) return { tag: home.tag, note: `${home.note} (Ev sahibi)` };
  return { tag: away.tag, note: `${away.note} (Deplasman)` };
}

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
    const [homeMatches, awayMatches, standings] = await Promise.all([
      getTeamMatches(match.homeTeam.id, 10),
      getTeamMatches(match.awayTeam.id, 10),
      getLeagueStandings(match.competition.code),
    ]);
    const homeStats = calculateTeamStats(homeMatches, match.homeTeam.id);
    const awayStats = calculateTeamStats(awayMatches, match.awayTeam.id);
    const homeStanding = getTeamStanding(standings, match.homeTeam.id);
    const awayStanding = getTeamStanding(standings, match.awayTeam.id);
    const homeRace = getRaceContext(standings, homeStanding?.rank ?? null);
    const awayRace = getRaceContext(standings, awayStanding?.rank ?? null);
    const race = pickRaceTag(homeRace, awayRace);
    const homeOpponents = last5Opponents(
      homeMatches,
      match.homeTeam.id,
      match.competition.code,
      standings
    );
    const awayOpponents = last5Opponents(
      awayMatches,
      match.awayTeam.id,
      match.competition.code,
      standings
    );

    if (homeStats.last5.length < 2 || awayStats.last5.length < 2) {
      const a = generateMockAnalysis(match);
      return { ...a, statsQuality: 'estimated' };
    }
    return generateAnalysis(match, homeStats, awayStats, {
      homeRank: homeStanding?.rank ?? null,
      awayRank: awayStanding?.rank ?? null,
      raceTag: race.tag,
      raceNote: race.note,
      homeOpponents,
      awayOpponents,
      homeTeamHome: venueRecord(homeMatches, match.homeTeam.id, true),
      homeTeamAway: venueRecord(homeMatches, match.homeTeam.id, false),
      awayTeamHome: venueRecord(awayMatches, match.awayTeam.id, true),
      awayTeamAway: venueRecord(awayMatches, match.awayTeam.id, false),
      homeTeamFavorite: favoriteRecord(homeMatches, match.homeTeam.id, match.competition.code, standings),
      awayTeamFavorite: favoriteRecord(awayMatches, match.awayTeam.id, match.competition.code, standings),
    });
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

  const maxMatches = envInt('MAX_MATCHES', MAX_MATCHES, 5, 50);
  const maxSecondary = envInt('MAX_SECONDARY', MAX_SECONDARY, 0, 20);
  let merged = mergeWithReservedSecondarySlots(primary, secondary, maxMatches, maxSecondary);
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
  const message =
    !hasAf && hasFd
      ? 'API-Football kapalı görünüyor (Vercel env: API_FOOTBALL_KEY). Şu an sadece football-data kaynağı kullanılıyor.'
      : undefined;

  return NextResponse.json({
    analyses,
    stats: defaultStats,
    demo: false,
    source: sourceLabel,
    sources: { footballData: hasFd, apiFootball: hasAf },
    message,
  });
}
