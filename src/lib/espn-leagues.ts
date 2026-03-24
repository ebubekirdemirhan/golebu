/**
 * ESPN site.api lig scoreboard yolları (slug) → uygulama competition.code eşlemesi.
 * Override: SCRAPE_LEAGUES=slug1,slug2,... (boşsa varsayılan liste).
 */

export type EspnLeagueConfig = {
  slug: string;
  code: string;
  /** Filtre / gösterim kısa adı */
  label: string;
  flag: string;
  /** competition.name için ülke veya bölge */
  region: string;
};

/** Production’da test edilen uefa.europaconf 400 veriyor; geçerli slug: uefa.europa.conf */
export const DEFAULT_ESPN_LEAGUES: EspnLeagueConfig[] = [
  { slug: 'eng.1', code: 'PL', label: 'Premier League', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', region: 'England' },
  { slug: 'eng.2', code: 'ELC', label: 'Championship', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', region: 'England' },
  { slug: 'esp.1', code: 'PD', label: 'La Liga', flag: '🇪🇸', region: 'Spain' },
  { slug: 'esp.2', code: 'SD', label: 'La Liga 2', flag: '🇪🇸', region: 'Spain' },
  { slug: 'ger.1', code: 'BL1', label: 'Bundesliga', flag: '🇩🇪', region: 'Germany' },
  { slug: 'ger.2', code: 'BL2', label: '2. Bundesliga', flag: '🇩🇪', region: 'Germany' },
  { slug: 'ita.1', code: 'SA', label: 'Serie A', flag: '🇮🇹', region: 'Italy' },
  { slug: 'ita.2', code: 'SB', label: 'Serie B', flag: '🇮🇹', region: 'Italy' },
  { slug: 'fra.1', code: 'FL1', label: 'Ligue 1', flag: '🇫🇷', region: 'France' },
  { slug: 'fra.2', code: 'FL2', label: 'Ligue 2', flag: '🇫🇷', region: 'France' },
  { slug: 'tur.1', code: 'TSL', label: 'Süper Lig', flag: '🇹🇷', region: 'Turkey' },
  { slug: 'tur.2', code: 'TFF1', label: 'TFF 1. Lig', flag: '🇹🇷', region: 'Turkey' },
  { slug: 'ned.1', code: 'DED', label: 'Eredivisie', flag: '🇳🇱', region: 'Netherlands' },
  { slug: 'por.1', code: 'PPL', label: 'Primeira Liga', flag: '🇵🇹', region: 'Portugal' },
  { slug: 'sco.1', code: 'SPL', label: 'Premiership', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', region: 'Scotland' },
  { slug: 'bra.1', code: 'BSA', label: 'Série A', flag: '🇧🇷', region: 'Brazil' },
  { slug: 'arg.1', code: 'ASL', label: 'Liga Profesional', flag: '🇦🇷', region: 'Argentina' },
  { slug: 'mex.1', code: 'LMX', label: 'Liga MX', flag: '🇲🇽', region: 'Mexico' },
  { slug: 'usa.1', code: 'MLS', label: 'MLS', flag: '🇺🇸', region: 'United States' },
  { slug: 'uefa.champions', code: 'CL', label: 'Champions League', flag: '🏆', region: 'UEFA' },
  { slug: 'uefa.europa', code: 'EL', label: 'Europa League', flag: '🏆', region: 'UEFA' },
  { slug: 'uefa.europa.conf', code: 'UCL', label: 'Conference League', flag: '🏆', region: 'UEFA' },
];

const bySlug = new Map(DEFAULT_ESPN_LEAGUES.map((e) => [e.slug, e]));

/** competition.name — football-data tarzı */
export function espnCompetitionName(cfg: EspnLeagueConfig): string {
  if (cfg.region === 'UEFA') {
    if (cfg.code === 'CL') return 'UEFA Champions League';
    if (cfg.code === 'EL') return 'UEFA Europa League';
    return 'UEFA Conference League';
  }
  return `${cfg.region} - ${cfg.label}`;
}

function parseOverrideSlugs(raw: string | undefined): EspnLeagueConfig[] | null {
  if (raw === undefined || raw.trim() === '') return null;
  const slugs = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (slugs.length === 0) return null;
  const out: EspnLeagueConfig[] = [];
  for (const slug of slugs) {
    const known = bySlug.get(slug);
    if (known) {
      out.push(known);
      continue;
    }
    out.push({
      slug,
      code: 'SCRAPE',
      label: slug.replace(/\./g, ' '),
      flag: '🌐',
      region: 'Global',
    });
  }
  return out;
}

/** Aktif ESPN lig listesi (env veya varsayılan). */
export function getActiveEspnLeagues(): EspnLeagueConfig[] {
  return parseOverrideSlugs(process.env.SCRAPE_LEAGUES?.trim()) ?? [...DEFAULT_ESPN_LEAGUES];
}
