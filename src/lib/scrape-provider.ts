import type { Match, Team } from './types';
import type { MatchSourceProvider, SourceFetchResult, FetchRange } from './source-contract';
import {
  getActiveEspnLeagues,
  espnCompetitionName,
  type EspnLeagueConfig,
} from './espn-leagues';

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
};
type EspnResponse = { events?: EspnEvent[] };

function scoreboardUrl(slug: string): string {
  return `https://site.api.espn.com/apis/site/v2/sports/soccer/${slug}/scoreboard`;
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

function normalizeEspnEvent(event: EspnEvent, cfg: EspnLeagueConfig): Match | null {
  const comp = event.competitions?.[0];
  if (!comp) return null;
  const homeRaw = comp.competitors?.find((c) => c.homeAway === 'home')?.team;
  const awayRaw = comp.competitors?.find((c) => c.homeAway === 'away')?.team;
  if (!homeRaw || !awayRaw) return null;

  const eventId =
    Number.parseInt(event.id ?? comp.id ?? '0', 10) ||
    deterministicTeamId(`${cfg.slug}|${homeRaw.displayName}|${awayRaw.displayName}|${comp.date}`);
  const name = espnCompetitionName(cfg);

  return {
    id: eventId,
    dataSource: 'scrape',
    competition: {
      id: hash32(cfg.slug) % 1_000_000,
      name,
      code: cfg.code,
      emblem: '',
      country: cfg.region === 'UEFA' ? 'Europe' : cfg.region,
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

function inRange(iso: string, range: FetchRange): boolean {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return false;
  const start = new Date(`${range.from}T00:00:00.000Z`).getTime();
  const end = new Date(`${range.to}T23:59:59.999Z`).getTime();
  return t >= start && t <= end;
}

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

export class ScrapeProvider implements MatchSourceProvider {
  name = 'scrape' as const;

  async fetch(range: FetchRange): Promise<SourceFetchResult> {
    const started = Date.now();
    const leagues = getActiveEspnLeagues();

    const settled = await Promise.allSettled(
      leagues.map(async (cfg) => {
        const res = await fetch(scoreboardUrl(cfg.slug), {
          cache: 'no-store',
          headers: { 'user-agent': UA },
        });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const json = (await res.json()) as EspnResponse;
        const matches = (json.events ?? [])
          .map((ev) => normalizeEspnEvent(ev, cfg))
          .filter((m): m is Match => Boolean(m))
          .filter((m) => inRange(m.utcDate, range));
        return { cfg, matches, rawEventCount: json.events?.length ?? 0 };
      })
    );

    const perLeague: Array<{ slug: string; ok: boolean; count: number; error?: string }> = [];
    const allMatches: Match[] = [];
    const seen = new Set<string>();

    for (let i = 0; i < settled.length; i++) {
      const cfg = leagues[i]!;
      const r = settled[i]!;
      if (r.status === 'fulfilled') {
        const { matches, rawEventCount } = r.value;
        perLeague.push({ slug: cfg.slug, ok: true, count: matches.length });
        for (const m of matches) {
          const k = `${m.utcDate.slice(0, 10)}|${m.homeTeam.name}|${m.awayTeam.name}`;
          if (seen.has(k)) continue;
          seen.add(k);
          allMatches.push(m);
        }
        if (matches.length === 0 && rawEventCount > 0) {
          perLeague[perLeague.length - 1] = {
            slug: cfg.slug,
            ok: true,
            count: 0,
            error: 'aralik disi',
          };
        }
      } else {
        const msg = r.reason instanceof Error ? r.reason.message : String(r.reason);
        perLeague.push({ slug: cfg.slug, ok: false, count: 0, error: msg });
      }
    }

    const okLeagues = perLeague.filter((p) => p.ok && p.count > 0).length;
    const emptyOk = perLeague.filter((p) => p.ok && p.count === 0).length;
    const failed = perLeague.filter((p) => !p.ok).length;
    const latencyMs = Date.now() - started;

    const healthMsg = `ESPN lig bazlı: ${okLeagues} lig maç içeriyor, ${emptyOk} lig boş (veya aralık dışı), ${failed} lig istek hatası.`;

    return {
      source: this.name,
      matches: allMatches,
      health: {
        source: this.name,
        code: allMatches.length > 0 ? 'OK' : okLeagues === 0 && failed > 0 ? 'SCRAPE_BLOCK' : 'NO_FIXTURE',
        matchCount: allMatches.length,
        latencyMs,
        message: allMatches.length > 0 ? healthMsg : `${healthMsg} Toplam ${leagues.length} lig sorgulandı.`,
        lastSuccessAt: allMatches.length > 0 ? new Date().toISOString() : undefined,
      },
    };
  }
}
