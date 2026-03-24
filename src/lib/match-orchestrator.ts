import { getTodayMatches, getMatchesByDate } from './football-api';
import { getApiFootballMatchesInRange, hasApiFootballKey } from './api-football';
import { ScrapeProvider } from './scrape-provider';
import { mergeByQualityWithDedupe } from './match-merge';
import type { Match, MatchDiagnostics, SourceHealth } from './types';
import { expandFetchRange, type FetchRange, type SourceFetchResult } from './source-contract';

type OrchestratorOptions = {
  hasFootballData: boolean;
  hasApiFootball: boolean;
  maxMatches: number;
  /** API-Football için ayrılan slot (football-data sonrası) */
  maxSecondary: number;
  /** ESPN / scrape için ayrılan slot */
  maxScrape: number;
  primaryRange: FetchRange;
  /** ESPN çekim aralığı; yoksa primary + varsayılan genişletme (1 gün geri, 14 gün ileri) */
  scrapeFetchRange?: FetchRange;
  fallbackRange?: FetchRange;
  scrapeFallbackFetchRange?: FetchRange;
  sourceTimeoutMs: number;
  scrapeTimeoutMs: number;
  sourceRetryCount: number;
  enableScraping: boolean;
};

type OrchestratorResult = {
  matches: Match[];
  diagnostics: MatchDiagnostics;
};

function timeoutWrap<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const id = setTimeout(() => reject(new Error(`SOURCE_TIMEOUT_${ms}`)), ms);
    promise
      .then((v) => {
        clearTimeout(id);
        resolve(v);
      })
      .catch((e) => {
        clearTimeout(id);
        reject(e);
      });
  });
}

async function withRetry<T>(fn: () => Promise<T>, attempts: number): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < Math.max(1, attempts); i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      await new Promise((r) => setTimeout(r, 200 * (i + 1)));
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error('Unknown source error');
}

function buildDisabledHealth(source: SourceHealth['source'], message: string): SourceHealth {
  return { source, code: 'ERROR', matchCount: 0, latencyMs: 0, message };
}

async function footballDataSource(range: FetchRange, hasFd: boolean): Promise<SourceFetchResult> {
  if (!hasFd) {
    return { source: 'football-data', matches: [], health: buildDisabledHealth('football-data', 'FOOTBALL_DATA_API_KEY yok.') };
  }
  const started = Date.now();
  const scoped = await getTodayMatches();
  const broad = scoped.length > 0 ? scoped : await getMatchesByDate(range.from, range.to);
  const matches = broad
    .filter((m) => ['SCHEDULED', 'TIMED', 'LIVE', 'IN_PLAY'].includes(m.status))
    .map((m) => ({ ...m, dataSource: 'football-data' as const }));
  const code: SourceHealth['code'] = matches.length > 0 ? 'OK' : 'NO_FIXTURE';
  return {
    source: 'football-data',
    matches,
    health: {
      source: 'football-data',
      code,
      matchCount: matches.length,
      latencyMs: Date.now() - started,
      message: matches.length ? 'football-data kaynağı aktif.' : 'football-data aralığında fikstür yok.',
      lastSuccessAt: matches.length ? new Date().toISOString() : undefined,
    },
  };
}

async function apiFootballSource(range: FetchRange, hasAf: boolean): Promise<SourceFetchResult> {
  if (!hasAf || !hasApiFootballKey()) {
    return { source: 'api-football', matches: [], health: buildDisabledHealth('api-football', 'API_FOOTBALL_KEY yok.') };
  }
  const started = Date.now();
  const res = await getApiFootballMatchesInRange(range.from, range.to);
  return {
    source: 'api-football',
    matches: res.matches.map((m) => ({ ...m, dataSource: 'api-football' as const })),
    health: {
      source: 'api-football',
      code: res.matches.length > 0 ? 'OK' : res.planRestricted ? 'PLAN_BLOCK' : 'NO_FIXTURE',
      matchCount: res.matches.length,
      latencyMs: Date.now() - started,
      blockedByPlan: res.planRestricted,
      rateLimitHint: 'API-Football free planda günlük limit düşüktür.',
      message: res.planRestricted
        ? 'API-Football free plan bu sezon future endpointlerini kısıtlıyor.'
        : res.matches.length > 0
          ? 'API-Football kaynağı aktif.'
          : 'API-Football aralığında fikstür yok.',
      lastSuccessAt: res.matches.length ? new Date().toISOString() : undefined,
    },
  };
}

async function runOne(
  label: string,
  fn: () => Promise<SourceFetchResult>,
  timeoutMs: number,
  retries: number,
  source: SourceHealth['source']
): Promise<SourceFetchResult> {
  try {
    return await withRetry(() => timeoutWrap(fn(), timeoutMs), retries);
  } catch (e) {
    return {
      source,
      matches: [],
      health: {
        source,
        code: e instanceof Error && e.message.startsWith('SOURCE_TIMEOUT_') ? 'TIMEOUT' : 'ERROR',
        matchCount: 0,
        latencyMs: timeoutMs,
        message: `${label} başarısız: ${e instanceof Error ? e.message : 'bilinmeyen hata'}`,
      },
    };
  }
}

const DEFAULT_SCRAPE_DAYS_BEFORE = 1;
const DEFAULT_SCRAPE_EXTRA_AHEAD = 14;

function resolveScrapeRange(explicit: FetchRange | undefined, base: FetchRange): FetchRange {
  return explicit ?? expandFetchRange(base, DEFAULT_SCRAPE_DAYS_BEFORE, DEFAULT_SCRAPE_EXTRA_AHEAD);
}

export async function orchestrateMatches(options: OrchestratorOptions): Promise<OrchestratorResult> {
  const scrapeProvider = new ScrapeProvider();
  const scrapeRange = resolveScrapeRange(options.scrapeFetchRange, options.primaryRange);
  const sourcePromises: Array<Promise<SourceFetchResult>> = [
    runOne(
      'football-data',
      () => footballDataSource(options.primaryRange, options.hasFootballData),
      options.sourceTimeoutMs,
      options.sourceRetryCount,
      'football-data'
    ),
    runOne(
      'api-football',
      () => apiFootballSource(options.primaryRange, options.hasApiFootball),
      options.sourceTimeoutMs,
      options.sourceRetryCount,
      'api-football'
    ),
  ];

  if (options.enableScraping) {
    sourcePromises.push(
      runOne(
        'scrape',
        () => scrapeProvider.fetch(scrapeRange),
        options.scrapeTimeoutMs,
        options.sourceRetryCount,
        'scrape'
      )
    );
  }

  const firstPass = await Promise.all(sourcePromises);
  let allResults = [...firstPass];

  let merged = mergeByQualityWithDedupe(
    allResults.flatMap((r) => r.matches),
    options.maxMatches,
    options.maxSecondary,
    options.maxScrape
  );

  if (merged.length === 0 && options.fallbackRange) {
    const fallbackRuns: Array<Promise<SourceFetchResult>> = [
      runOne(
        'football-data-fallback',
        () => footballDataSource(options.fallbackRange as FetchRange, options.hasFootballData),
        options.sourceTimeoutMs,
        options.sourceRetryCount,
        'football-data'
      ),
      runOne(
        'api-football-fallback',
        () => apiFootballSource(options.fallbackRange as FetchRange, options.hasApiFootball),
        options.sourceTimeoutMs,
        options.sourceRetryCount,
        'api-football'
      ),
    ];
    if (options.enableScraping) {
      const fbBase = options.fallbackRange as FetchRange;
      const fbScrape = resolveScrapeRange(options.scrapeFallbackFetchRange, fbBase);
      fallbackRuns.push(
        runOne(
          'scrape-fallback',
          () => scrapeProvider.fetch(fbScrape),
          options.scrapeTimeoutMs,
          options.sourceRetryCount,
          'scrape'
        )
      );
    }
    const fallbackResults = await Promise.all(fallbackRuns);
    allResults = [...allResults, ...fallbackResults];
    merged = mergeByQualityWithDedupe(
      fallbackResults.flatMap((r) => r.matches),
      options.maxMatches,
      options.maxSecondary,
      options.maxScrape
    );
  }

  const diagnostics: MatchDiagnostics = {
    emptyPolicy: 'show_empty_hard',
    sourceHealth: allResults.map((r) => r.health),
    range: {
      primaryFrom: options.primaryRange.from,
      primaryTo: options.primaryRange.to,
      fallbackFrom: options.fallbackRange?.from,
      fallbackTo: options.fallbackRange?.to,
      scrapeFetchFrom: scrapeRange.from,
      scrapeFetchTo: scrapeRange.to,
    },
  };

  return { matches: merged, diagnostics };
}
