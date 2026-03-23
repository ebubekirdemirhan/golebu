import type { Match, Team } from './types';
import type { MatchSourceProvider, SourceFetchResult, FetchRange } from './source-contract';

type EspnCompetition = { id?: string; name?: string };
type EspnTeam = { id?: string; displayName?: string; shortDisplayName?: string; logo?: string };
type EspnCompetitor = { homeAway?: 'home' | 'away'; team?: EspnTeam };
type EspnEvent = {
  id?: string;
  date?: string;
  competitions?: Array<{
    id?: string;
    date?: string;
    status?: { type?: { state?: string; completed?: boolean } };
    competitors?: EspnCompetitor[];
  }>;
  leagues?: EspnCompetition[];
};
type EspnResponse = { events?: EspnEvent[] };

const ESPN_SCOREBOARD = 'https://site.api.espn.com/apis/site/v2/sports/soccer/all/scoreboard';

function normalizeText(v: string): string {
  return v
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function hash32(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h >>> 0);
}

function deterministicTeamId(name: string): number {
  return 900_000_000 + (hash32(name) % 50_000_000);
}

function allowedLeagueKeywords(): string[] {
  const raw = process.env.SCRAPE_ALLOWED_LEAGUE_KEYWORDS?.trim();
  if (raw) {
    return raw
      .split(',')
      .map((s) => normalizeText(s))
      .filter(Boolean);
  }
  return [
    'super lig',
    'turkey',
    'tff',
    'saudi',
    'uae',
    'qatar',
    'premier league',
    'la liga',
    'bundesliga',
    'serie a',
    'ligue 1',
    'champions league',
    'europa league',
    'conference league',
    'eredivisie',
    'portugal',
    'brazil',
    'mls',
    'liga mx',
  ];
}

function mapLeagueCode(leagueName: string): string {
  const n = normalizeText(leagueName);
  if (n.includes('super lig') && n.includes('tur')) return 'TSL';
  if (n.includes('tff 1')) return 'AF204';
  if (n.includes('tff 2')) return 'AF205';
  if (n.includes('saudi')) return 'AF307';
  if (n.includes('uae') || n.includes('emirates')) return 'AF301';
  if (n.includes('qatar')) return 'AF305';
  if (n.includes('premier league') && n.includes('eng')) return 'PL';
  if (n.includes('la liga')) return 'PD';
  if (n.includes('bundesliga')) return 'BL1';
  if (n.includes('serie a') && n.includes('ital')) return 'SA';
  if (n.includes('ligue 1')) return 'FL1';
  if (n.includes('champions league')) return 'CL';
  if (n.includes('europa league')) return 'EL';
  if (n.includes('conference league')) return 'UCL';
  if (n.includes('eredivisie')) return 'DED';
  if (n.includes('portugal')) return 'PPL';
  if (n.includes('brazil')) return 'BSA';
  if (n.includes('mls')) return 'MLS';
  if (n.includes('liga mx')) return 'LMX';
  return 'SCRAPE';
}

function yyyymmdd(iso: string): string {
  return iso.slice(0, 10).replace(/-/g, '');
}

function espnStateToStatus(state?: string, completed?: boolean): Match['status'] {
  if (completed) return 'FINISHED';
  if (!state) return 'SCHEDULED';
  if (state === 'in') return 'IN_PLAY';
  if (state === 'post') return 'FINISHED';
  return 'SCHEDULED';
}

function asTeam(team?: EspnTeam, fallback = 'Unknown'): Team {
  const baseName = team?.displayName ?? fallback;
  const id = Number.parseInt(team?.id ?? '0', 10) || deterministicTeamId(baseName);
  return {
    id,
    name: baseName,
    shortName: team?.shortDisplayName ?? baseName,
    crest: team?.logo ?? '',
  };
}

function normalizeEspnEvent(event: EspnEvent): Match | null {
  const comp = event.competitions?.[0];
  if (!comp) return null;
  const homeRaw = comp.competitors?.find((c) => c.homeAway === 'home')?.team;
  const awayRaw = comp.competitors?.find((c) => c.homeAway === 'away')?.team;
  if (!homeRaw || !awayRaw) return null;

  const eventId = Number.parseInt(event.id ?? comp.id ?? '0', 10) || Math.floor(Math.random() * 100000) + 1200000000;
  const league = event.leagues?.[0];
  const leagueName = league?.name ?? 'Web Fixture Feed';
  const code = mapLeagueCode(leagueName);

  return {
    id: eventId,
    dataSource: 'scrape',
    competition: {
      id: Number.parseInt(league?.id ?? '0', 10) || 0,
      name: leagueName,
      code,
      emblem: '',
      country: 'Global',
    },
    utcDate: comp.date ?? event.date ?? new Date().toISOString(),
    status: espnStateToStatus(comp.status?.type?.state, comp.status?.type?.completed),
    homeTeam: asTeam(homeRaw, 'Home'),
    awayTeam: asTeam(awayRaw, 'Away'),
    score: {
      fullTime: { home: null, away: null },
      halfTime: { home: null, away: null },
    },
  };
}

export class ScrapeProvider implements MatchSourceProvider {
  name = 'scrape' as const;

  async fetch(range: FetchRange): Promise<SourceFetchResult> {
    const started = Date.now();
    try {
      const params = new URLSearchParams({ dates: yyyymmdd(range.from) });
      const res = await fetch(`${ESPN_SCOREBOARD}?${params.toString()}`, {
        cache: 'no-store',
        headers: {
          // Basit bot engeli olan kaynaklar için gerçek tarayıcıya yakın UA.
          'user-agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        },
      });
      const latencyMs = Date.now() - started;
      if (!res.ok) {
        return {
          source: this.name,
          matches: [],
          health: {
            source: this.name,
            code: res.status === 429 ? 'RATE_LIMIT' : 'SCRAPE_BLOCK',
            matchCount: 0,
            latencyMs,
            message: `Scrape kaynağı hata verdi: ${res.status}`,
          },
        };
      }

      const json = (await res.json()) as EspnResponse;
      const allow = allowedLeagueKeywords();
      const matches = (json.events ?? [])
        .map(normalizeEspnEvent)
        .filter((m): m is Match => Boolean(m))
        .filter((m) => {
          const leagueNorm = normalizeText(m.competition.name);
          if (m.competition.code !== 'SCRAPE') return true;
          return allow.some((k) => leagueNorm.includes(k));
        })
        .filter((m) => m.utcDate >= `${range.from}T00:00:00.000Z` && m.utcDate <= `${range.to}T23:59:59.999Z`)
        .slice(0, 50);

      return {
        source: this.name,
        matches,
        health: {
          source: this.name,
          code: matches.length > 0 ? 'OK' : 'NO_FIXTURE',
          matchCount: matches.length,
          latencyMs,
          message: matches.length > 0 ? 'Web skorboard kaynağı aktif.' : 'Scrape kaynağında aralıkta maç yok.',
          lastSuccessAt: matches.length > 0 ? new Date().toISOString() : undefined,
        },
      };
    } catch (error) {
      return {
        source: this.name,
        matches: [],
        health: {
          source: this.name,
          code: 'SCRAPE_BLOCK',
          matchCount: 0,
          latencyMs: Date.now() - started,
          message: error instanceof Error ? error.message : 'Scrape kaynağına erişilemedi.',
        },
      };
    }
  }
}
