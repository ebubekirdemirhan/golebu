export interface Team {
  id: number;
  name: string;
  shortName: string;
  crest: string;
}

/** football-data.org birincil; api-football (API-Sports) ikincil fikstür kaynağı */
export type MatchDataSource = 'football-data' | 'api-football';

export interface Match {
  id: number;
  /** Yoksa football-data kabul edilir (geriye uyum) */
  dataSource?: MatchDataSource;
  competition: {
    id: number;
    name: string;
    code: string;
    emblem: string;
    country?: string;
  };
  utcDate: string;
  status: 'SCHEDULED' | 'LIVE' | 'IN_PLAY' | 'PAUSED' | 'FINISHED' | 'POSTPONED' | 'CANCELLED';
  homeTeam: Team;
  awayTeam: Team;
  score: {
    fullTime: { home: number | null; away: number | null };
    halfTime: { home: number | null; away: number | null };
  };
}

export interface TeamStats {
  teamId: number;
  teamName: string;
  last5: MatchResult[];
  avgGoalsScored: number;
  avgGoalsConceded: number;
  form: string; // e.g. "WWDLL"
  cleanSheetRate: number;
  scoringRate: number;
}

export interface MatchResult {
  goalsScored: number;
  goalsConceded: number;
  result: 'W' | 'D' | 'L';
  isHome: boolean;
}

export interface Analysis {
  matchId: number;
  homeTeam: Team;
  awayTeam: Team;
  competition: Match['competition'];
  utcDate: string;
  
  // Tahminler
  over25Pct: number;         // 2.5 Gol Üstü %
  btts: number;              // KG Var (Both Teams to Score) %
  hy05Pct: number;           // İY 0.5 Üst %
  winnerPrediction: '1' | 'X' | '2'; // Ev / Beraberlik / Deplasman
  winnerTeamName: string;
  confidence: 'Düşük' | 'Orta' | 'Yüksek' | 'Çok Yüksek';
  confidenceLevel: 1 | 2 | 3 | 4;
  
  // Gol ortalamaları
  homeGoalAvg: number;
  awayGoalAvg: number;
  
  // Gol trendi (son 5 maç)
  homeGoalTrend: { scored: number[]; conceded: number[] };
  awayGoalTrend: { scored: number[]; conceded: number[] };
  
  // Value Bet
  valueBet?: {
    market: string;
    ourProb: number;
    impliedProb: number;
    edge: number;
  };
  
  // Güçlü tahmin notu
  strongestPick: string;
  analysisNote: string;

  tableContext?: {
    homeRank: number | null;
    awayRank: number | null;
    raceTag: 'Sampiyonluk' | 'Avrupa' | 'Orta Sira' | 'Kume Hatti' | 'Bilinmiyor';
    note: string;
  };
  last5Opponents?: {
    home: Array<{ name: string; rank: number | null }>;
    away: Array<{ name: string; rank: number | null }>;
  };

  /** Tam istatistik (football-data) vs tahmini model (ikincil kaynak) */
  statsQuality?: 'full' | 'estimated' | 'demo';
}

export interface AnalysisResult {
  analysisId: string;
  matchId: number;
  actualScore: { home: number; away: number };
  over25Hit: boolean;
  bttsHit: boolean;
  hy05Hit: boolean;
  winnerHit: boolean;
  createdAt: string;
}

export interface OverallStats {
  totalMatches: number;
  winnerSuccess: number;  // 1X2 başarı %
  over25Success: number;  // 2.5 Üst/Alt %
  bttsSuccess: number;    // KG Var/Yok %
  hy05Success: number;    // İY 0.5 Üst %
}

export type ConfidenceColor = 'green' | 'orange' | 'red';

export function getPercentColor(pct: number): ConfidenceColor {
  if (pct >= 70) return 'green';
  if (pct >= 40) return 'orange';
  return 'red';
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
