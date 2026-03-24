import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMatchTime(utcDate: string): string {
  const date = new Date(utcDate);
  return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

export function formatMatchDate(utcDate: string): string {
  const date = new Date(utcDate);
  return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function isToday(utcDate: string): boolean {
  const date = new Date(utcDate);
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

export function getLeagueFlag(code: string): string {
  const flags: Record<string, string> = {
    PL: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    PD: '🇪🇸',
    BL1: '🇩🇪',
    SA: '🇮🇹',
    FL1: '🇫🇷',
    CL: '🏆',
    EL: '🏆',
    UCL: '🏆',
    EC: '🇪🇺',
    WC: '🌍',
    PPL: '🇵🇹',
    DED: '🇳🇱',
    BSA: '🇧🇷',
    TSL: '🇹🇷',
    TFF1: '🇹🇷',
    ELC: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    BL2: '🇩🇪',
    FL2: '🇫🇷',
    SB: '🇮🇹',
    SD: '🇪🇸',
    SPL: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
    ASL: '🇦🇷',
    LMX: '🇲🇽',
    MLS: '🇺🇸',
    SCRAPE: '🌐',
  };
  if (flags[code]) return flags[code];

  const af = /^AF(\d+)$/.exec(code);
  if (af) {
    const id = parseInt(af[1], 10);
    const byId: Record<number, string> = {
      203: '🇹🇷',
      204: '🇹🇷',
      205: '🇹🇷',
      307: '🇸🇦',
      301: '🇦🇪',
      305: '🇶🇦',
    };
    return byId[id] ?? '⚽';
  }
  return '⚽';
}

export function getResultColor(result: string): string {
  if (result === 'W') return 'text-green-400';
  if (result === 'D') return 'text-yellow-400';
  return 'text-red-400';
}

export function getResultBg(result: string): string {
  if (result === 'W') return 'bg-green-500';
  if (result === 'D') return 'bg-yellow-500';
  return 'bg-red-500';
}
