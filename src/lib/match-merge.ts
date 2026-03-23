import type { Match } from './types';

function normalizeTeamName(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/gi, '')
    .trim();
}

/** Aynı gün + ev/deplasman adı (çift kaynaklı çakışmayı azaltır) */
export function matchDedupeKey(m: Match): string {
  const day = m.utcDate.slice(0, 10);
  return `${day}|${normalizeTeamName(m.homeTeam.name)}|${normalizeTeamName(m.awayTeam.name)}`;
}

const byDate = (a: Match, b: Match) =>
  new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime();

function sourceScore(m: Match): number {
  if (m.dataSource === 'football-data' || !m.dataSource) return 300;
  if (m.dataSource === 'api-football') return 200;
  return 100;
}

function statusScore(m: Match): number {
  if (m.status === 'LIVE' || m.status === 'IN_PLAY') return 30;
  if (m.status === 'TIMED' || m.status === 'SCHEDULED') return 20;
  return 10;
}

function qualityScore(m: Match): number {
  return sourceScore(m) + statusScore(m);
}

/**
 * Birincil (football-data) öncelikli sıra: önce tüm birincil maçlar (tarihe göre),
 * sonra ikincil; çakışan fikstür birincilde tutulur.
 */
export function mergeMatchesPrimaryWins(primary: Match[], secondary: Match[]): Match[] {
  const seen = new Set<string>();
  const prim: Match[] = [];
  const sec: Match[] = [];

  for (const m of primary) {
    const k = matchDedupeKey(m);
    seen.add(k);
    prim.push(m);
  }
  for (const m of secondary) {
    const k = matchDedupeKey(m);
    if (seen.has(k)) continue;
    seen.add(k);
    sec.push(m);
  }

  prim.sort(byDate);
  sec.sort(byDate);
  return [...prim, ...sec];
}

const MAX_SECONDARY_DEFAULT = 8;

/**
 * İkincil kaynağa en az slot ayırır: API-Football (Suudi, TFF, Süper Lig yedek vb.) her zaman görünür kalır.
 * Önce birincil (max total − ikincil kotası), sonra ikincil (en fazla maxSecondary).
 */
export function mergeWithReservedSecondarySlots(
  primary: Match[],
  secondary: Match[],
  maxTotal: number,
  maxSecondary: number = MAX_SECONDARY_DEFAULT
): Match[] {
  const merged = mergeMatchesPrimaryWins(primary, secondary);
  const prim = merged.filter((m) => m.dataSource !== 'api-football');
  const sec = merged.filter((m) => m.dataSource === 'api-football');

  const secTake = Math.min(sec.length, maxSecondary, maxTotal);
  const primTake = Math.min(prim.length, maxTotal - secTake);

  return [...prim.slice(0, primTake), ...sec.slice(0, secTake)];
}

/**
 * Çok-kaynaklı senaryoda kalite + dedupe:
 * - Aynı fikstürde yüksek kalite skorlu kayıt tutulur
 * - Toplamda maxTotal kadar maç döner
 * - İkincil (api-football/scrape) için maxSecondary kadar alan ayrılır
 */
export function mergeByQualityWithDedupe(
  items: Match[],
  maxTotal: number,
  maxSecondary: number = MAX_SECONDARY_DEFAULT
): Match[] {
  const bestByKey = new Map<string, Match>();
  for (const m of items) {
    const key = matchDedupeKey(m);
    const current = bestByKey.get(key);
    if (!current || qualityScore(m) > qualityScore(current)) {
      bestByKey.set(key, m);
    }
  }

  const all = Array.from(bestByKey.values()).sort((a, b) => {
    const d = byDate(a, b);
    if (d !== 0) return d;
    return qualityScore(b) - qualityScore(a);
  });

  const primary = all.filter((m) => m.dataSource === 'football-data' || !m.dataSource);
  const secondary = all.filter((m) => m.dataSource !== 'football-data' && m.dataSource !== undefined);
  const secTake = Math.min(secondary.length, maxSecondary, maxTotal);
  const primTake = Math.min(primary.length, maxTotal - secTake);
  return [...primary.slice(0, primTake), ...secondary.slice(0, secTake)];
}
