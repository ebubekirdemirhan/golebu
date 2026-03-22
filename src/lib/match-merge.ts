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
