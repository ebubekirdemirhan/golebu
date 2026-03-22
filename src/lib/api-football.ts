import type { Match, Team } from './types';

const BASE_URL = 'https://v3.football.api-sports.io';

/**
 * api-football.com lig ID’leri.
 * 204 = Türkiye Süper Lig (football-data ile çakışırsa dedupe tek maç bırakır; FD yoksa yedek kaynak).
 */
export const API_FOOTBALL_DEFAULT_LEAGUE_IDS = [204, 205, 206, 307, 301, 233] as const;

interface ApiFootballFixtureResponse {
  response?: ApiFootballFixtureItem[];
}

interface ApiFootballFixtureItem {
  fixture: {
    id: number;
    date: string;
    status: { short: string; long?: string };
  };
  league: {
    id: number;
    name: string;
    country: string;
    logo?: string;
    season?: number;
  };
  teams: {
    home: { id: number; name: string; logo?: string };
    away: { id: number; name: string; logo?: string };
  };
  goals: { home: number | null; away: number | null };
  score: {
    halftime?: { home: number | null; away: number | null };
    fulltime?: { home: number | null; away: number | null };
  };
}

export function hasApiFootballKey(): boolean {
  const k = process.env.API_FOOTBALL_KEY;
  return Boolean(k && k !== 'your_api_football_key_here');
}

/** Avrupa sezonu: Temmuz+ = o yıl başlangıç */
export function currentSeasonStartYear(d = new Date()): number {
  const y = d.getFullYear();
  return d.getMonth() >= 6 ? y : y - 1;
}

function parseLeagueIds(): number[] {
  const raw = process.env.API_FOOTBALL_LEAGUE_IDS?.trim();
  if (!raw) {
    return [...API_FOOTBALL_DEFAULT_LEAGUE_IDS];
  }
  return raw
    .split(',')
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !Number.isNaN(n) && n > 0);
}

const STATUS_MAP: Record<string, Match['status']> = {
  NS: 'SCHEDULED',
  TBD: 'SCHEDULED',
  PST: 'POSTPONED',
  CANC: 'CANCELLED',
  ABD: 'CANCELLED',
  LIVE: 'LIVE',
  '1H': 'IN_PLAY',
  HT: 'IN_PLAY',
  '2H': 'IN_PLAY',
  ET: 'IN_PLAY',
  FT: 'FINISHED',
  AET: 'FINISHED',
  PEN: 'FINISHED',
};

function mapStatus(short: string): Match['status'] {
  return STATUS_MAP[short] ?? 'SCHEDULED';
}

/** api-football takım id çakışmasını önlemek için ofset */
function offsetTeamId(id: number): number {
  return 800_000_000 + id;
}

function offsetMatchId(fixtureId: number): number {
  return 1_000_000_000 + fixtureId;
}

function normalizeFixture(item: ApiFootballFixtureItem): Match {
  const { fixture, league, teams, goals, score } = item;
  const leagueId = league.id;
  const code = `AF${leagueId}`;

  const home: Team = {
    id: offsetTeamId(teams.home.id),
    name: teams.home.name,
    shortName: teams.home.name,
    crest: teams.home.logo ?? '',
  };
  const away: Team = {
    id: offsetTeamId(teams.away.id),
    name: teams.away.name,
    shortName: teams.away.name,
    crest: teams.away.logo ?? '',
  };

  const ftHome = score.fulltime?.home ?? goals.home ?? null;
  const ftAway = score.fulltime?.away ?? goals.away ?? null;
  const htHome = score.halftime?.home ?? null;
  const htAway = score.halftime?.away ?? null;

  return {
    id: offsetMatchId(fixture.id),
    dataSource: 'api-football',
    competition: {
      id: leagueId,
      name: league.name,
      code,
      emblem: league.logo ?? '',
      country: league.country,
    },
    utcDate: fixture.date,
    status: mapStatus(fixture.status.short),
    homeTeam: home,
    awayTeam: away,
    score: {
      fullTime: { home: ftHome, away: ftAway },
      halfTime: { home: htHome, away: htAway },
    },
  };
}

async function fetchFixturesForLeague(
  leagueId: number,
  season: number,
  from: string,
  to: string,
  apiKey: string
): Promise<ApiFootballFixtureItem[]> {
  const params = new URLSearchParams({
    league: String(leagueId),
    season: String(season),
    from,
    to,
  });
  const url = `${BASE_URL}/fixtures?${params.toString()}`;
  const res = await fetch(url, {
    headers: { 'x-apisports-key': apiKey },
    cache: 'no-store',
  });

  if (!res.ok) {
    return [];
  }

  const json = (await res.json()) as ApiFootballFixtureResponse;
  return json.response ?? [];
}

/**
 * İkincil kaynak: yaklaşan / canlı maçlar (ücretsiz kotada sınırlı).
 * İstatistik için football-data takım id’leri kullanılmaz; kartta tahmini model kullanılır.
 */
export async function getApiFootballMatchesInRange(from: string, to: string): Promise<Match[]> {
  if (!hasApiFootballKey()) {
    return [];
  }
  const apiKey = process.env.API_FOOTBALL_KEY as string;
  const leagueIds = parseLeagueIds();
  const season = currentSeasonStartYear();
  const seasonsToTry = [season, season - 1];

  const all: Match[] = [];

  for (const leagueId of leagueIds) {
    let items: ApiFootballFixtureItem[] = [];
    for (const s of seasonsToTry) {
      items = await fetchFixturesForLeague(leagueId, s, from, to, apiKey);
      if (items.length > 0) break;
    }
    for (const item of items) {
      const status = item.fixture.status.short;
      if (['FT', 'AET', 'PEN', 'CANC', 'ABD', 'AWD', 'WO'].includes(status)) continue;
      all.push(normalizeFixture(item));
    }
  }

  return all;
}
