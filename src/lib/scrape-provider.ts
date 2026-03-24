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

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

/** YYYY-MM-DD → YYYYMMDD (ESPN dates parametresi) */
function toEspnYyyymmdd(isoDay: string): string {
  return isoDay.replace(/-/g, '');
}

function parseYmd(isoDay: string): { y: number; m: number; d: number } {
  const [y, m, d] = isoDay.split('-').map((x) => parseInt(x, 10));
  return { y, m, d };
}

function yyyymmddUtc(d: Date): string {
  return `${d.getUTCFullYear()}${pad2(d.getUTCMonth() + 1)}${pad2(d.getUTCDate())}`;
}

/**
 * Tarihsiz scoreboard genelde son turu döndürür; gelecek turlar çoğu ligde yalnızca ?dates= ile gelir.
 * Aralık uçları + Cmt/Paz + Salı/Çarşamba (UEFA / haftaiçi) — tekrarsız YYYYMMDD.
 */
function scoreboardProbeYyyymmdd(range: FetchRange, maxWeeksPerKind: number): string[] {
  const set = new Set<string>();
  set.add(toEspnYyyymmdd(range.from));
  set.add(toEspnYyyymmdd(range.to));

  const startParts = parseYmd(range.from);
  const endParts = parseYmd(range.to);
  const startMs = Date.UTC(startParts.y, startParts.m - 1, startParts.d, 12, 0, 0);
  const endMs = Date.UTC(endParts.y, endParts.m - 1, endParts.d, 12, 0, 0);

  // Cumartesi + Pazar
  let t = startMs;
  let dow = new Date(t).getUTCDay();
  t += ((6 - dow + 7) % 7) * 86400000;
  let weeks = 0;
  while (t <= endMs && weeks < maxWeeksPerKind) {
    set.add(yyyymmddUtc(new Date(t)));
    const sunMs = t + 86400000;
    if (sunMs <= endMs) set.add(yyyymmddUtc(new Date(sunMs)));
    t += 7 * 86400000;
    weeks++;
  }

  // Salı + Çarşamba (Şampiyonlar / konferans vb.)
  t = startMs;
  dow = new Date(t).getUTCDay();
  t += ((2 - dow + 7) % 7) * 86400000;
  weeks = 0;
  while (t <= endMs && weeks < maxWeeksPerKind) {
    set.add(yyyymmddUtc(new Date(t)));
    const wedMs = t + 86400000;
    if (wedMs <= endMs) set.add(yyyymmddUtc(new Date(wedMs)));
    t += 7 * 86400000;
    weeks++;
  }

  return Array.from(set);
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

/** Tahmin listesi: bitmiş maçları çıkar (tarihsiz scoreboard eski tur döndürür). */
function isUpcomingForPrediction(m: Match): boolean {
  return m.status !== 'FINISHED';
}

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

function readProbeWeeks(): number {
  const raw = process.env.ESPN_SCOREBOARD_WEEKEND_WEEKS;
  const n = raw ? parseInt(raw, 10) : 5;
  if (Number.isNaN(n)) return 5;
  return Math.max(0, Math.min(12, n));
}

function readLeagueChunkSize(): number {
  const raw = process.env.ESPN_SCRAPE_LEAGUE_CONCURRENCY;
  const n = raw ? parseInt(raw, 10) : 4;
  if (Number.isNaN(n)) return 4;
  return Math.max(1, Math.min(22, n));
}

async function fetchEspn(url: string): Promise<EspnResponse> {
  const res = await fetch(url, {
    cache: 'no-store',
    headers: { 'user-agent': UA },
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return (await res.json()) as EspnResponse;
}

async function fetchLeagueScoreboardEvents(cfg: EspnLeagueConfig, range: FetchRange): Promise<{
  events: EspnEvent[];
  requestCount: number;
}> {
  const base = scoreboardUrl(cfg.slug);
  const probes = scoreboardProbeYyyymmdd(range, readProbeWeeks());
  const urls = [base, ...probes.map((d) => `${base}?dates=${d}`)];

  const settled = await Promise.allSettled(urls.map((u) => fetchEspn(u)));
  const byId = new Map<string, EspnEvent>();
  for (const s of settled) {
    if (s.status !== 'fulfilled') continue;
    for (const ev of s.value.events ?? []) {
      const rawId = ev.id ?? ev.competitions?.[0]?.id;
      if (rawId) {
        byId.set(`id:${rawId}`, ev);
        continue;
      }
      const c = ev.competitions?.[0];
      const h = c?.competitors?.find((x) => x.homeAway === 'home')?.team?.displayName ?? '';
      const a = c?.competitors?.find((x) => x.homeAway === 'away')?.team?.displayName ?? '';
      byId.set(`sym:${ev.date}|${h}|${a}`, ev);
    }
  }
  return { events: Array.from(byId.values()), requestCount: urls.length };
}

export class ScrapeProvider implements MatchSourceProvider {
  name = 'scrape' as const;

  async fetch(range: FetchRange): Promise<SourceFetchResult> {
    const started = Date.now();
    const leagues = getActiveEspnLeagues();
    const chunk = readLeagueChunkSize();
    const settled: PromiseSettledResult<{
      cfg: EspnLeagueConfig;
      matches: Match[];
      rawEventCount: number;
      requestCount: number;
    }>[] = [];

    for (let i = 0; i < leagues.length; i += chunk) {
      const slice = leagues.slice(i, i + chunk);
      const part = await Promise.allSettled(
        slice.map(async (cfg) => {
          const { events, requestCount } = await fetchLeagueScoreboardEvents(cfg, range);
          const matches = events
            .map((ev) => normalizeEspnEvent(ev, cfg))
            .filter((m): m is Match => Boolean(m))
            .filter((m) => inRange(m.utcDate, range))
            .filter(isUpcomingForPrediction);
          return { cfg, matches, rawEventCount: events.length, requestCount };
        })
      );
      settled.push(...part);
    }

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
            error: 'aralik_disi_veya_bitmis',
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

    const healthMsg = `ESPN (tarih taramalı): ${okLeagues} lig maç içeriyor, ${emptyOk} lig boş, ${failed} hata. Prob haftası: ${readProbeWeeks()}.`;

    return {
      source: this.name,
      matches: allMatches,
      health: {
        source: this.name,
        code: allMatches.length > 0 ? 'OK' : okLeagues === 0 && failed > 0 ? 'SCRAPE_BLOCK' : 'NO_FIXTURE',
        matchCount: allMatches.length,
        latencyMs,
        message: allMatches.length > 0 ? healthMsg : `${healthMsg} Toplam ${leagues.length} lig.`,
        lastSuccessAt: allMatches.length > 0 ? new Date().toISOString() : undefined,
      },
    };
  }
}
