import { Analysis, TeamStats, Match } from './types';

/**
 * Poisson dağılımı kullanarak beklenen gol sayısından üst/alt olasılığını hesaplar
 */
function poissonProbability(lambda: number, k: number): number {
  if (lambda <= 0) return 0;
  let result = Math.exp(-lambda);
  for (let i = 1; i <= k; i++) {
    result *= lambda / i;
  }
  return result;
}

/**
 * 2.5 Gol Üstü Olasılığı
 * Ev + Deplasman beklenen gol sayısına göre Poisson ile hesaplanır
 */
export function calcOver25(homeAvgScored: number, awayAvgScored: number, leagueAvg = 2.7): number {
  const expectedGoals = (homeAvgScored + awayAvgScored) * 0.85 + leagueAvg * 0.15;
  const lambda = Math.max(0.5, expectedGoals);
  
  // P(toplam gol <= 2) hesapla, tersini al
  let probUnder3 = 0;
  for (let homeGoals = 0; homeGoals <= 10; homeGoals++) {
    for (let awayGoals = 0; awayGoals <= 10; awayGoals++) {
      if (homeGoals + awayGoals <= 2) {
        const homeLambda = lambda * (homeAvgScored / (homeAvgScored + awayAvgScored + 0.1));
        const awayLambda = lambda * (awayAvgScored / (homeAvgScored + awayAvgScored + 0.1));
        probUnder3 += poissonProbability(homeLambda, homeGoals) * poissonProbability(awayLambda, awayGoals);
      }
    }
  }
  
  const over25 = (1 - probUnder3) * 100;
  return Math.min(95, Math.max(15, Math.round(over25)));
}

/**
 * KG Var (Both Teams to Score) Olasılığı
 */
export function calcBTTS(
  homeScoringRate: number,
  awayScoringRate: number,
  homeCleanSheetRate: number,
  awayCleanSheetRate: number
): number {
  // Her iki takımın gol atma olasılığı
  const homeScores = (homeScoringRate / 100) * (1 - awayCleanSheetRate / 100 * 0.5);
  const awayScores = (awayScoringRate / 100) * (1 - homeCleanSheetRate / 100 * 0.5);
  
  const btts = homeScores * awayScores * 100;
  return Math.min(90, Math.max(10, Math.round(btts)));
}

/**
 * İlk Yarı 0.5 Üst (İlk yarıda en az 1 gol) Olasılığı
 */
export function calcHY05(homeAvgScored: number, awayAvgScored: number): number {
  // İlk yarıda ortalama toplam gol (maç genelinin ~%45'i ilk yarıda)
  const hyExpected = (homeAvgScored + awayAvgScored) * 0.45;
  
  // P(ilk yarı 0 gol) = e^(-lambda)
  const probZero = Math.exp(-hyExpected);
  const hy05Over = (1 - probZero) * 100;
  
  return Math.min(92, Math.max(20, Math.round(hy05Over)));
}

/**
 * 1X2 Kazanan Tahmini - Form skoru ve gol ortalaması bazlı
 */
export function calcWinner(
  homeStats: TeamStats,
  awayStats: TeamStats
): { prediction: '1' | 'X' | '2'; teamName: string; probabilities: { home: number; draw: number; away: number } } {
  
  // Form skoru: W=3, D=1, L=0 (son 5 maç)
  const formScore = (form: string) => {
    let score = 0;
    for (const ch of form) {
      if (ch === 'W') score += 3;
      else if (ch === 'D') score += 1;
    }
    return score;
  };

  const homeForm = formScore(homeStats.form);
  const awayForm = formScore(awayStats.form);
  
  // Gol farkı avantajı
  const homeGoalDiff = homeStats.avgGoalsScored - homeStats.avgGoalsConceded;
  const awayGoalDiff = awayStats.avgGoalsScored - awayStats.avgGoalsConceded;
  
  // Güç endeksi (form + gol farkı + ev sahibi avantajı)
  const homeStrength = homeForm * 1.5 + homeGoalDiff * 5 + 3; // +3 ev avantajı
  const awayStrength = awayForm * 1.5 + awayGoalDiff * 5;
  
  const total = homeStrength + awayStrength + 8; // +8 beraberlik katkısı
  
  let homePct = Math.round((homeStrength / total) * 100);
  let awayPct = Math.round((awayStrength / total) * 100);
  let drawPct = 100 - homePct - awayPct;
  
  // Sınır kontrolleri
  homePct = Math.min(80, Math.max(10, homePct));
  awayPct = Math.min(80, Math.max(10, awayPct));
  drawPct = Math.min(40, Math.max(10, drawPct));
  
  // Normalize
  const sum = homePct + awayPct + drawPct;
  homePct = Math.round((homePct / sum) * 100);
  awayPct = Math.round((awayPct / sum) * 100);
  drawPct = 100 - homePct - awayPct;

  let prediction: '1' | 'X' | '2';
  let teamName: string;

  if (homePct >= awayPct && homePct >= drawPct) {
    prediction = '1';
    teamName = homeStats.teamName;
  } else if (awayPct > homePct && awayPct >= drawPct) {
    prediction = '2';
    teamName = awayStats.teamName;
  } else {
    prediction = 'X';
    teamName = 'Beraberlik';
  }

  return {
    prediction,
    teamName,
    probabilities: { home: homePct, draw: drawPct, away: awayPct },
  };
}

/**
 * Güven skoru hesaplama (veri tutarlılığı + form istikrarı)
 */
export function calcConfidence(
  homeStats: TeamStats,
  awayStats: TeamStats,
  over25: number,
  btts: number
): { level: 1 | 2 | 3 | 4; label: 'Düşük' | 'Orta' | 'Yüksek' | 'Çok Yüksek' } {
  let score = 0;
  
  // Form istikrarı
  const homeFormConsistency = homeStats.last5.filter(m => m.result === homeStats.last5[0]?.result).length;
  const awayFormConsistency = awayStats.last5.filter(m => m.result === awayStats.last5[0]?.result).length;
  
  score += homeFormConsistency * 2;
  score += awayFormConsistency * 2;
  
  // Güçlü göstergeler varsa güven artar
  if (over25 >= 70) score += 3;
  if (btts >= 65) score += 2;
  if (homeStats.form.startsWith('WW') || awayStats.form.startsWith('WW')) score += 2;
  
  // Veri kalitesi (son 5 maç var mı)
  if (homeStats.last5.length >= 5) score += 2;
  if (awayStats.last5.length >= 5) score += 2;
  
  if (score >= 18) return { level: 4, label: 'Çok Yüksek' };
  if (score >= 13) return { level: 3, label: 'Yüksek' };
  if (score >= 8) return { level: 2, label: 'Orta' };
  return { level: 1, label: 'Düşük' };
}

/**
 * Value Bet hesaplama
 * Bizim tahminin bahisçi implied oranından %5+ yüksek olması
 */
export function calcValueBet(
  ourProb: number,
  market: string,
  impliedProb?: number
): { market: string; ourProb: number; impliedProb: number; edge: number } | undefined {
  
  // Varsayılan implied oran (genellikle %50 civarı)
  const implied = impliedProb ?? Math.max(30, ourProb - 12);
  const edge = ourProb - implied;
  
  if (edge >= 5) {
    return { market, ourProb, impliedProb: implied, edge: Math.round(edge) };
  }
  return undefined;
}

/**
 * Ana analiz fonksiyonu - bir maç için tam analiz üretir
 */
export function generateAnalysis(
  match: Match,
  homeStats: TeamStats,
  awayStats: TeamStats,
  context?: {
    homeRank?: number | null;
    awayRank?: number | null;
    raceTag?: 'Sampiyonluk' | 'Avrupa' | 'Orta Sira' | 'Kume Hatti' | 'Bilinmiyor';
    raceNote?: string;
    homeOpponents?: Array<{ name: string; rank: number | null }>;
    awayOpponents?: Array<{ name: string; rank: number | null }>;
    homeTeamHome?: string;
    homeTeamAway?: string;
    awayTeamHome?: string;
    awayTeamAway?: string;
    homeTeamFavorite?: string;
    awayTeamFavorite?: string;
  }
): Analysis {
  const over25 = calcOver25(homeStats.avgGoalsScored, awayStats.avgGoalsScored);
  const btts = calcBTTS(
    homeStats.scoringRate,
    awayStats.scoringRate,
    homeStats.cleanSheetRate,
    awayStats.cleanSheetRate
  );
  const hy05 = calcHY05(homeStats.avgGoalsScored, awayStats.avgGoalsScored);
  
  const winnerResult = calcWinner(homeStats, awayStats);
  const confidence = calcConfidence(homeStats, awayStats, over25, btts);
  
  // En güçlü tahmini bul
  const metrics = [
    { name: '2.5 Gol Üstü', pct: over25 },
    { name: 'KG Var', pct: btts },
    { name: 'İY 0.5 Üst', pct: hy05 },
  ];
  const strongest = metrics.sort((a, b) => b.pct - a.pct)[0];
  
  // Value bet kontrolü
  const valueBet = calcValueBet(winnerResult.probabilities.home > 60
    ? winnerResult.probabilities.home
    : winnerResult.probabilities.away > 60
    ? winnerResult.probabilities.away
    : over25,
    winnerResult.prediction === '1'
      ? `1X2 (Ev Sahibi)`
      : winnerResult.prediction === '2'
      ? `1X2 (Deplasman)`
      : `2.5 Gol Üstü`
  );
  
  // Analiz notu oluştur
  let note = '';
  if (over25 >= 70) note += `Gol beklentisi yüksek (${over25}%). `;
  if (btts >= 65) note += `Her iki takım da gol atabilir. `;
  if (hy05 >= 70) note += `İlk yarıda gol kuvvetle muhtemel. `;
  if (homeStats.form.startsWith('WW')) note += `${homeStats.teamName} formda. `;
  if (awayStats.form.startsWith('WW')) note += `${awayStats.teamName} formda. `;
  if (!note) note = 'Veri odaklı analiz. Disiplinli yaklaşım önerilir.';
  
  return {
    matchId: match.id,
    homeTeam: match.homeTeam,
    awayTeam: match.awayTeam,
    competition: match.competition,
    utcDate: match.utcDate,
    over25Pct: over25,
    btts,
    hy05Pct: hy05,
    winnerPrediction: winnerResult.prediction,
    winnerTeamName: winnerResult.teamName,
    confidence: confidence.label,
    confidenceLevel: confidence.level,
    homeGoalAvg: homeStats.avgGoalsScored,
    awayGoalAvg: awayStats.avgGoalsScored,
    homeGoalTrend: {
      scored: homeStats.last5.map(m => m.goalsScored),
      conceded: homeStats.last5.map(m => m.goalsConceded),
    },
    awayGoalTrend: {
      scored: awayStats.last5.map(m => m.goalsScored),
      conceded: awayStats.last5.map(m => m.goalsConceded),
    },
    valueBet,
    strongestPick: strongest.pct >= 65 ? `${strongest.name} (%${strongest.pct})` : '',
    analysisNote: note.trim(),
    tableContext: {
      homeRank: context?.homeRank ?? null,
      awayRank: context?.awayRank ?? null,
      raceTag: context?.raceTag ?? 'Bilinmiyor',
      note: context?.raceNote ?? '',
    },
    last5Opponents: {
      home: context?.homeOpponents ?? [],
      away: context?.awayOpponents ?? [],
    },
    performanceContext: {
      homeTeamHome: context?.homeTeamHome ?? '-',
      homeTeamAway: context?.homeTeamAway ?? '-',
      awayTeamHome: context?.awayTeamHome ?? '-',
      awayTeamAway: context?.awayTeamAway ?? '-',
      homeTeamFavorite: context?.homeTeamFavorite ?? '-',
      awayTeamFavorite: context?.awayTeamFavorite ?? '-',
    },
    statsQuality: 'full',
  };
}

/**
 * Mock analiz üretici (API key yokken demo için)
 */
export function generateMockAnalysis(match: Match): Analysis {
  const homeStrong = Math.random() > 0.4;
  
  const homeStats: TeamStats = {
    teamId: match.homeTeam.id,
    teamName: match.homeTeam.name,
    last5: homeStrong
      ? [
          { goalsScored: 3, goalsConceded: 1, result: 'W', isHome: true },
          { goalsScored: 2, goalsConceded: 0, result: 'W', isHome: false },
          { goalsScored: 1, goalsConceded: 1, result: 'D', isHome: true },
          { goalsScored: 2, goalsConceded: 1, result: 'W', isHome: false },
          { goalsScored: 4, goalsConceded: 2, result: 'W', isHome: true },
        ]
      : [
          { goalsScored: 1, goalsConceded: 2, result: 'L', isHome: true },
          { goalsScored: 2, goalsConceded: 2, result: 'D', isHome: false },
          { goalsScored: 0, goalsConceded: 1, result: 'L', isHome: true },
          { goalsScored: 2, goalsConceded: 1, result: 'W', isHome: false },
          { goalsScored: 1, goalsConceded: 1, result: 'D', isHome: true },
        ],
    avgGoalsScored: homeStrong ? 2.4 : 1.2,
    avgGoalsConceded: homeStrong ? 1.0 : 1.4,
    form: homeStrong ? 'WWDWW' : 'LLDWW',
    cleanSheetRate: homeStrong ? 40 : 10,
    scoringRate: homeStrong ? 100 : 60,
  };

  const awayStrong = !homeStrong && Math.random() > 0.5;
  const awayStats: TeamStats = {
    teamId: match.awayTeam.id,
    teamName: match.awayTeam.name,
    last5: awayStrong
      ? [
          { goalsScored: 2, goalsConceded: 1, result: 'W', isHome: false },
          { goalsScored: 3, goalsConceded: 0, result: 'W', isHome: true },
          { goalsScored: 1, goalsConceded: 1, result: 'D', isHome: false },
          { goalsScored: 2, goalsConceded: 1, result: 'W', isHome: true },
          { goalsScored: 1, goalsConceded: 0, result: 'W', isHome: false },
        ]
      : [
          { goalsScored: 1, goalsConceded: 3, result: 'L', isHome: false },
          { goalsScored: 0, goalsConceded: 2, result: 'L', isHome: true },
          { goalsScored: 2, goalsConceded: 2, result: 'D', isHome: false },
          { goalsScored: 1, goalsConceded: 1, result: 'D', isHome: true },
          { goalsScored: 0, goalsConceded: 1, result: 'L', isHome: false },
        ],
    avgGoalsScored: awayStrong ? 1.8 : 0.8,
    avgGoalsConceded: awayStrong ? 0.8 : 1.8,
    form: awayStrong ? 'WWDWW' : 'LLDLL',
    cleanSheetRate: awayStrong ? 60 : 0,
    scoringRate: awayStrong ? 80 : 40,
  };

  const base = generateAnalysis(match, homeStats, awayStats);
  return { ...base, statsQuality: 'demo' as const };
}
