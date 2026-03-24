import type { Match, MatchDataSource, SourceHealth } from './types';

export interface FetchRange {
  from: string;
  to: string;
}

export interface SourceFetchResult {
  source: MatchDataSource;
  matches: Match[];
  health: SourceHealth;
}

export interface MatchSourceProvider {
  name: MatchDataSource;
  fetch(range: FetchRange): Promise<SourceFetchResult>;
}

/** `YYYY-MM-DD` takvimi üzerinden aralığı kaydırır (ESPN çekimi için birincil pencereden geniş). */
export function expandFetchRange(range: FetchRange, daysBefore: number, extraDaysAhead: number): FetchRange {
  const pad = (n: number) => String(n).padStart(2, '0');
  const toParts = (iso: string) => {
    const [y, m, d] = iso.split('-').map((x) => parseInt(x, 10));
    return { y, m, d };
  };
  const addDays = (iso: string, delta: number): string => {
    const { y, m, d } = toParts(iso);
    const utc = Date.UTC(y, m - 1, d, 12, 0, 0) + delta * 86400000;
    const nd = new Date(utc);
    return `${nd.getUTCFullYear()}-${pad(nd.getUTCMonth() + 1)}-${pad(nd.getUTCDate())}`;
  };
  return {
    from: addDays(range.from, -Math.max(0, daysBefore)),
    to: addDays(range.to, Math.max(0, extraDaysAhead)),
  };
}
