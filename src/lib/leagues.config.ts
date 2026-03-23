/**
 * football-data.org competition.code değerleri (lookup tables).
 * UI filtreleri ve API /matches?competitions=... için kullanılır.
 *
 * Notlar:
 * - TFF 2. Lig, Suudi/UAE/Katar gibi birçok Arap ligi bu API’de yoktur (coverage sayfasına bakın).
 * - Türkiye Süper Lig / 1. Lig verisi planınıza göre “Free” kutusunda olmayabilir; anahtarın erişebildiği ligler döner.
 */

export type LeagueEntry = {
  code: string;
  /** Filtre butonunda */
  filterLabel: string;
  name: string;
  flag: string;
};

export const SUPPORTED_LEAGUES: LeagueEntry[] = [
  // Avrupa — 5 büyük + CL/EL
  { code: 'PL', filterLabel: 'Premier League', name: 'England - Premier League', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { code: 'PD', filterLabel: 'La Liga', name: 'Spain - La Liga', flag: '🇪🇸' },
  { code: 'BL1', filterLabel: 'Bundesliga', name: 'Germany - Bundesliga', flag: '🇩🇪' },
  { code: 'SA', filterLabel: 'Serie A', name: 'Italy - Serie A', flag: '🇮🇹' },
  { code: 'FL1', filterLabel: 'Ligue 1', name: 'France - Ligue 1', flag: '🇫🇷' },
  { code: 'CL', filterLabel: 'Şampiyonlar L.', name: 'UEFA Champions League', flag: '🏆' },
  { code: 'EL', filterLabel: 'Avrupa Ligi', name: 'UEFA Europa League', flag: '🏆' },
  { code: 'UCL', filterLabel: 'Konferans L.', name: 'UEFA Conference League', flag: '🏆' },
  { code: 'EC', filterLabel: 'EURO', name: 'UEFA Euro', flag: '🇪🇺' },
  { code: 'WC', filterLabel: 'Dünya Kupası', name: 'FIFA World Cup', flag: '🌍' },

  // Türkiye — TFF 1./2. Lig: football-data’da yalnızca Süper Lig listelenir; 2. Lig bu API’de yok
  { code: 'TSL', filterLabel: 'Süper Lig', name: 'Turkey - Süper Lig', flag: '🇹🇷' },

  // Diğer güçlü ligler
  { code: 'PPL', filterLabel: 'Portekiz', name: 'Portugal - Primeira Liga', flag: '🇵🇹' },
  { code: 'DED', filterLabel: 'Hollanda', name: 'Netherlands - Eredivisie', flag: '🇳🇱' },
  { code: 'ELC', filterLabel: 'Championship', name: 'England - Championship', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { code: 'BL2', filterLabel: '2. Bundesliga', name: 'Germany - 2. Bundesliga', flag: '🇩🇪' },
  { code: 'FL2', filterLabel: 'Ligue 2', name: 'France - Ligue 2', flag: '🇫🇷' },
  { code: 'SB', filterLabel: 'Serie B', name: 'Italy - Serie B', flag: '🇮🇹' },
  { code: 'SD', filterLabel: 'La Liga 2', name: 'Spain - Segunda División', flag: '🇪🇸' },
  { code: 'SPL', filterLabel: 'İskoçya', name: 'Scotland - Premiership', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
  { code: 'BSA', filterLabel: 'Brezilya A', name: 'Brazil - Série A', flag: '🇧🇷' },
  { code: 'JJL', filterLabel: 'Japonya', name: 'Japan - J. League', flag: '🇯🇵' },
  { code: 'LMX', filterLabel: 'Meksika', name: 'Mexico - Liga MX', flag: '🇲🇽' },
  { code: 'MLS', filterLabel: 'MLS', name: 'United States - MLS', flag: '🇺🇸' },
  { code: 'GSL', filterLabel: 'Yunanistan', name: 'Greece - Super League', flag: '🇬🇷' },
  { code: 'CSL', filterLabel: 'Çin', name: 'China PR - Super League', flag: '🇨🇳' },
  { code: 'BJL', filterLabel: 'Belçika', name: 'Belgium - Jupiler Pro League', flag: '🇧🇪' },
  { code: 'DSU', filterLabel: 'Danimarka', name: 'Denmark - Superliga', flag: '🇩🇰' },
  { code: 'ALL', filterLabel: 'İsveç', name: 'Sweden - Allsvenskan', flag: '🇸🇪' },
  { code: 'SSL', filterLabel: 'İsviçre', name: 'Switzerland - Super League', flag: '🇨🇭' },
  { code: 'ABL', filterLabel: 'Avusturya', name: 'Austria - Bundesliga', flag: '🇦🇹' },
  { code: 'ASL', filterLabel: 'Arjantin', name: 'Argentina - Liga Profesional', flag: '🇦🇷' },
  { code: 'AAL', filterLabel: 'Avustralya', name: 'Australia - A League', flag: '🇦🇺' },
  { code: 'UPL', filterLabel: 'Ukrayna', name: 'Ukraine - Premier Liha', flag: '🇺🇦' },
  { code: 'RL1', filterLabel: 'Romanya', name: 'Romania - Liga I', flag: '🇷🇴' },
  { code: 'HNB', filterLabel: 'Macaristan', name: 'Hungary - NB I', flag: '🇭🇺' },
  { code: 'ILH', filterLabel: 'İsrail', name: 'Israel - Ligat ha’Al', flag: '🇮🇱' },
];

/** Sadece kod (API filtreleri) */
export const SUPPORTED_LEAGUE_CODES = new Set(SUPPORTED_LEAGUES.map((l) => l.code));

/**
 * api-football (API-Sports) ikincil kaynak — kod biçimi AF{ligId}
 * @see src/lib/api-football.ts API_FOOTBALL_DEFAULT_LEAGUE_IDS
 */
export const SECONDARY_LEAGUES_FOR_FILTERS: LeagueEntry[] = [
  { code: 'AF203', filterLabel: 'Süper Lig (API)', name: 'Turkey - Süper Lig (API-Football)', flag: '🇹🇷' },
  { code: 'AF204', filterLabel: 'TFF 1. Lig', name: 'Turkey - TFF 1. Lig', flag: '🇹🇷' },
  { code: 'AF205', filterLabel: 'TFF 2. Lig', name: 'Turkey - TFF 2. Lig', flag: '🇹🇷' },
  { code: 'AF307', filterLabel: 'Suudi Arabistan', name: 'Saudi Pro League', flag: '🇸🇦' },
  { code: 'AF301', filterLabel: 'BAE', name: 'UAE Pro League', flag: '🇦🇪' },
  { code: 'AF305', filterLabel: 'Katar', name: 'Qatar Stars League', flag: '🇶🇦' },
];

/** Filtre UI + izin verilen tüm competition.code değerleri */
export const ALL_LEAGUE_FILTERS = [...SUPPORTED_LEAGUES, ...SECONDARY_LEAGUES_FOR_FILTERS];
export const ALL_LEAGUE_CODES = new Set(ALL_LEAGUE_FILTERS.map((l) => l.code));
