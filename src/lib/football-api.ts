import { Match, TeamStats, MatchResult } from './types';
import { SUPPORTED_LEAGUES } from './leagues.config';

export { SUPPORTED_LEAGUES, SUPPORTED_LEAGUE_CODES } from './leagues.config';
export type { LeagueEntry } from './leagues.config';

const BASE_URL = 'https://api.football-data.org/v4';
const API_KEY = process.env.FOOTBALL_DATA_API_KEY || '';

// Basit in-memory cache
const cache = new Map<string, { data: unknown; expires: number }>();

export interface StandingRow {
  position: number;
  team: { id: number; name: string };
  points: number;
  goalDifference: number;
  won: number;
  draw: number;
  lost: number;
}

export interface LeagueStandingsResponse {
  competition?: { code: string; name: string };
  season?: { currentMatchday?: number };
  standings?: Array<{
    type: string;
    table: StandingRow[];
  }>;
}

export interface TeamStandingContext {
  rank: number;
  points: number;
  goalDifference: number;
}

export interface RaceContext {
  tag: 'Sampiyonluk' | 'Avrupa' | 'Orta Sira' | 'Kume Hatti';
  note: string;
}

async function fetchWithCache<T>(endpoint: string, ttlMinutes = 30): Promise<T> {
  const cacheKey = endpoint;
  const now = Date.now();
  
  const cached = cache.get(cacheKey);
  if (cached && cached.expires > now) {
    return cached.data as T;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'X-Auth-Token': API_KEY,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('API rate limit aşıldı. Lütfen bekleyin.');
    }
    throw new Error(`API hatası: ${response.status}`);
  }

  const data = await response.json() as T;
  cache.set(cacheKey, { data, expires: now + ttlMinutes * 60 * 1000 });
  return data;
}

/** Önce competitions= ile hedef ligleri sor; hata/boşsa genel /matches ile dene */
async function fetchMatchesForWeek(today: string, weekEnd: string): Promise<Match[]> {
  // football-data planlı maçları çoğunlukla TIMED olarak döner; TIMED'i dahil et.
  const base = `dateFrom=${today}&dateTo=${weekEnd}&status=SCHEDULED,TIMED,LIVE,IN_PLAY`;
  const allCodes = SUPPORTED_LEAGUES.map((l) => l.code).join(',');

  const attempts = [
    `/matches?competitions=${allCodes}&${base}`,
    `/matches?${base}`,
  ];

  for (const endpoint of attempts) {
    try {
      const data = await fetchWithCache<{ matches: Match[] }>(endpoint, 15);
      const matches = data.matches || [];
      if (matches.length > 0) return matches;
    } catch {
      continue;
    }
  }
  return [];
}

export async function getTodayMatches(): Promise<Match[]> {
  if (!API_KEY || API_KEY === 'your_football_data_api_key_here') {
    return [];
  }
  const today = new Date().toISOString().split('T')[0];
  const daysAhead = (() => {
    const raw = process.env.MATCH_DAYS_AHEAD;
    const n = raw ? parseInt(raw, 10) : 7;
    if (Number.isNaN(n)) return 7;
    return Math.max(1, Math.min(14, n));
  })();
  const weekEnd = new Date(Date.now() + daysAhead * 86400000).toISOString().split('T')[0];

  return fetchMatchesForWeek(today, weekEnd);
}

export async function getMatchesByDate(dateFrom: string, dateTo: string): Promise<Match[]> {
  if (!API_KEY || API_KEY === 'your_football_data_api_key_here') {
    return [];
  }
  try {
    const data = await fetchWithCache<{ matches: Match[] }>(
      `/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`,
      30
    );
    return data.matches || [];
  } catch {
    return [];
  }
}

export async function getTeamMatches(teamId: number, limit = 10): Promise<Match[]> {
  try {
    const data = await fetchWithCache<{ matches: Match[] }>(
      `/teams/${teamId}/matches?limit=${limit}&status=FINISHED`,
      60
    );
    return data.matches || [];
  } catch {
    return [];
  }
}

export async function getLeagueStandings(leagueCode: string): Promise<LeagueStandingsResponse | null> {
  try {
    const data = await fetchWithCache<LeagueStandingsResponse>(
      `/competitions/${leagueCode}/standings`,
      120
    );
    return data;
  } catch {
    return null;
  }
}

function pickLeagueTable(data: LeagueStandingsResponse | null): StandingRow[] {
  if (!data?.standings?.length) return [];
  const preferred = data.standings.find((s) => s.type === 'TOTAL');
  if (preferred?.table?.length) return preferred.table;
  // CL/EL gibi group tablolarda takım farklı grupta olabilir: tüm tabloları birleştir.
  const merged = data.standings.flatMap((s) => s.table ?? []);
  const seen = new Set<number>();
  return merged.filter((r) => {
    if (seen.has(r.team.id)) return false;
    seen.add(r.team.id);
    return true;
  });
}

export function getTeamStanding(data: LeagueStandingsResponse | null, teamId: number): TeamStandingContext | null {
  const table = pickLeagueTable(data);
  const row = table.find((r) => r.team.id === teamId);
  if (!row) return null;
  return {
    rank: row.position,
    points: row.points,
    goalDifference: row.goalDifference,
  };
}

function normalizeTeamName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\b(fc|cf|ac|sc|afc)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getTeamStandingByName(
  data: LeagueStandingsResponse | null,
  teamName: string
): TeamStandingContext | null {
  const table = pickLeagueTable(data);
  if (!table.length || !teamName) return null;
  const norm = normalizeTeamName(teamName);
  const row = table.find((r) => normalizeTeamName(r.team.name) === norm);
  if (!row) return null;
  return {
    rank: row.position,
    points: row.points,
    goalDifference: row.goalDifference,
  };
}

export function getRaceContext(data: LeagueStandingsResponse | null, rank: number | null): RaceContext | null {
  const table = pickLeagueTable(data);
  if (!table.length || !rank) return null;

  const size = table.length;
  const leaderPts = table[0]?.points ?? 0;
  const row = table.find((r) => r.position === rank);
  if (!row) return null;

  if (rank <= 2) {
    const gap = Math.max(0, leaderPts - row.points);
    return { tag: 'Sampiyonluk', note: `Liderin ${gap} puan gerisi.` };
  }
  if (rank <= 6) {
    return { tag: 'Avrupa', note: 'Avrupa potasi yakininda.' };
  }
  if (rank >= Math.max(16, size - 2)) {
    return { tag: 'Kume Hatti', note: 'Kume dusme hattina yakin.' };
  }
  return { tag: 'Orta Sira', note: 'Ligde orta sirada konumlanmis.' };
}

export function calculateTeamStats(matches: Match[], teamId: number): TeamStats {
  const last5: MatchResult[] = [];
  let totalScored = 0;
  let totalConceded = 0;
  let cleanSheets = 0;
  let scoredMatches = 0;

  const finishedMatches = matches
    .filter(m => m.status === 'FINISHED' && m.score.fullTime.home !== null)
    .slice(0, 5);

  for (const match of finishedMatches) {
    const isHome = match.homeTeam.id === teamId;
    const scored = isHome ? (match.score.fullTime.home ?? 0) : (match.score.fullTime.away ?? 0);
    const conceded = isHome ? (match.score.fullTime.away ?? 0) : (match.score.fullTime.home ?? 0);

    totalScored += scored;
    totalConceded += conceded;
    if (conceded === 0) cleanSheets++;
    if (scored > 0) scoredMatches++;

    let result: 'W' | 'D' | 'L';
    if (scored > conceded) result = 'W';
    else if (scored === conceded) result = 'D';
    else result = 'L';

    last5.push({ goalsScored: scored, goalsConceded: conceded, result, isHome });
  }

  const count = finishedMatches.length || 1;
  const form = last5.map(r => r.result).join('');

  const team = finishedMatches[0]?.homeTeam.id === teamId
    ? finishedMatches[0]?.homeTeam
    : finishedMatches[0]?.awayTeam;

  return {
    teamId,
    teamName: team?.name || 'Bilinmiyor',
    last5,
    avgGoalsScored: parseFloat((totalScored / count).toFixed(1)),
    avgGoalsConceded: parseFloat((totalConceded / count).toFixed(1)),
    form,
    cleanSheetRate: parseFloat(((cleanSheets / count) * 100).toFixed(0)),
    scoringRate: parseFloat(((scoredMatches / count) * 100).toFixed(0)),
  };
}

// Demo için mock veriler (API key yokken)
export function getMockMatches(): Match[] {
  return [
    {
      id: 1001,
      competition: { id: 2021, name: 'Premier League', code: 'PL', emblem: '', country: 'England' },
      utcDate: new Date(Date.now() + 7200000).toISOString(),
      status: 'SCHEDULED',
      homeTeam: { id: 65, name: 'Manchester City', shortName: 'Man City', crest: '' },
      awayTeam: { id: 66, name: 'Manchester United', shortName: 'Man Utd', crest: '' },
      score: { fullTime: { home: null, away: null }, halfTime: { home: null, away: null } },
    },
    {
      id: 1002,
      competition: { id: 2014, name: 'La Liga', code: 'PD', emblem: '', country: 'Spain' },
      utcDate: new Date(Date.now() + 10800000).toISOString(),
      status: 'SCHEDULED',
      homeTeam: { id: 86, name: 'Real Madrid', shortName: 'Real Madrid', crest: '' },
      awayTeam: { id: 81, name: 'FC Barcelona', shortName: 'Barcelona', crest: '' },
      score: { fullTime: { home: null, away: null }, halfTime: { home: null, away: null } },
    },
    {
      id: 1003,
      competition: { id: 2002, name: 'Bundesliga', code: 'BL1', emblem: '', country: 'Germany' },
      utcDate: new Date(Date.now() + 14400000).toISOString(),
      status: 'SCHEDULED',
      homeTeam: { id: 5, name: 'FC Bayern München', shortName: 'Bayern', crest: '' },
      awayTeam: { id: 4, name: 'Borussia Dortmund', shortName: 'Dortmund', crest: '' },
      score: { fullTime: { home: null, away: null }, halfTime: { home: null, away: null } },
    },
    {
      id: 1004,
      competition: { id: 2019, name: 'Serie A', code: 'SA', emblem: '', country: 'Italy' },
      utcDate: new Date(Date.now() + 18000000).toISOString(),
      status: 'SCHEDULED',
      homeTeam: { id: 108, name: 'Juventus FC', shortName: 'Juventus', crest: '' },
      awayTeam: { id: 109, name: 'AC Milan', shortName: 'AC Milan', crest: '' },
      score: { fullTime: { home: null, away: null }, halfTime: { home: null, away: null } },
    },
    {
      id: 1005,
      competition: { id: 2015, name: 'Ligue 1', code: 'FL1', emblem: '', country: 'France' },
      utcDate: new Date(Date.now() + 21600000).toISOString(),
      status: 'SCHEDULED',
      homeTeam: { id: 524, name: 'Paris Saint-Germain FC', shortName: 'PSG', crest: '' },
      awayTeam: { id: 516, name: 'Olympique de Marseille', shortName: 'Marseille', crest: '' },
      score: { fullTime: { home: null, away: null }, halfTime: { home: null, away: null } },
    },
  ];
}

export function getMockTeamStats(teamName: string, isStrong: boolean): TeamStats {
  const strongStats: TeamStats = {
    teamId: Math.floor(Math.random() * 1000),
    teamName,
    last5: [
      { goalsScored: 3, goalsConceded: 1, result: 'W', isHome: true },
      { goalsScored: 2, goalsConceded: 0, result: 'W', isHome: false },
      { goalsScored: 1, goalsConceded: 1, result: 'D', isHome: true },
      { goalsScored: 2, goalsConceded: 1, result: 'W', isHome: false },
      { goalsScored: 4, goalsConceded: 2, result: 'W', isHome: true },
    ],
    avgGoalsScored: 2.4,
    avgGoalsConceded: 1.0,
    form: 'WWDWW',
    cleanSheetRate: 20,
    scoringRate: 100,
  };

  const weakStats: TeamStats = {
    teamId: Math.floor(Math.random() * 1000),
    teamName,
    last5: [
      { goalsScored: 0, goalsConceded: 2, result: 'L', isHome: true },
      { goalsScored: 1, goalsConceded: 3, result: 'L', isHome: false },
      { goalsScored: 1, goalsConceded: 1, result: 'D', isHome: true },
      { goalsScored: 0, goalsConceded: 1, result: 'L', isHome: false },
      { goalsScored: 2, goalsConceded: 2, result: 'D', isHome: true },
    ],
    avgGoalsScored: 0.8,
    avgGoalsConceded: 1.8,
    form: 'LLDLL',
    cleanSheetRate: 0,
    scoringRate: 40,
  };

  return isStrong ? strongStats : weakStats;
}
