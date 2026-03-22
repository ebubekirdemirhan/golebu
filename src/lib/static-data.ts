import { Analysis } from './types';

export function getStaticAnalyses(): Analysis[] {
  return [
    {
      matchId: 1001,
      competition: { id: 2021, name: 'Premier League', code: 'PL', emblem: '' },
      utcDate: '2026-03-23T17:00:00Z',
      homeTeam: { id: 65, name: 'Manchester City', shortName: 'MCI', crest: '' },
      awayTeam: { id: 66, name: 'Manchester United', shortName: 'MUN', crest: '' },
      over25Pct: 82,
      btts: 68,
      hy05Pct: 78,
      winnerPrediction: '1',
      winnerTeamName: 'Manchester City',
      confidence: 'Yüksek',
      confidenceLevel: 3,
      homeGoalAvg: 2.1,
      awayGoalAvg: 1.2,
      homeGoalTrend: { scored: [2, 3, 1, 2, 4], conceded: [0, 1, 1, 0, 2] },
      awayGoalTrend: { scored: [1, 2, 0, 1, 2], conceded: [2, 1, 3, 1, 0] },
      valueBet: { market: 'Man City Galibiyet', ourProb: 71, impliedProb: 59, edge: 12 },
      strongestPick: '2.5 Gol Üstü (%82)',
      analysisNote: 'City son 5 evinde 14 gol attı.',
    },
    {
      matchId: 1002,
      competition: { id: 2014, name: 'La Liga', code: 'PD', emblem: '' },
      utcDate: '2026-03-23T19:00:00Z',
      homeTeam: { id: 86, name: 'Real Madrid', shortName: 'RMA', crest: '' },
      awayTeam: { id: 81, name: 'FC Barcelona', shortName: 'BAR', crest: '' },
      over25Pct: 79,
      btts: 72,
      hy05Pct: 85,
      winnerPrediction: '1',
      winnerTeamName: 'Real Madrid',
      confidence: 'Orta',
      confidenceLevel: 2,
      homeGoalAvg: 1.8,
      awayGoalAvg: 1.5,
      homeGoalTrend: { scored: [2, 1, 3, 2, 1], conceded: [1, 0, 1, 2, 0] },
      awayGoalTrend: { scored: [3, 1, 0, 2, 2], conceded: [1, 1, 2, 0, 1] },
      valueBet: { market: 'Real Madrid Galibiyet', ourProb: 55, impliedProb: 48, edge: 7 },
      strongestPick: 'İY 0.5 Üst (%85)',
      analysisNote: 'El Clasico her zaman gollü geçer.',
    },
    {
      matchId: 1003,
      competition: { id: 2002, name: 'Bundesliga', code: 'BL1', emblem: '' },
      utcDate: '2026-03-23T16:30:00Z',
      homeTeam: { id: 5, name: 'FC Bayern München', shortName: 'BAY', crest: '' },
      awayTeam: { id: 4, name: 'Borussia Dortmund', shortName: 'BVB', crest: '' },
      over25Pct: 88,
      btts: 75,
      hy05Pct: 82,
      winnerPrediction: '1',
      winnerTeamName: 'FC Bayern München',
      confidence: 'Yüksek',
      confidenceLevel: 3,
      homeGoalAvg: 2.4,
      awayGoalAvg: 1.3,
      homeGoalTrend: { scored: [3, 2, 4, 2, 3], conceded: [1, 0, 1, 2, 0] },
      awayGoalTrend: { scored: [2, 1, 1, 3, 0], conceded: [1, 2, 0, 1, 3] },
      valueBet: { market: 'Bayern Galibiyet', ourProb: 68, impliedProb: 55, edge: 13 },
      strongestPick: '2.5 Gol Üstü (%88)',
      analysisNote: 'Der Klassiker - golsüz bitme ihtimali çok düşük.',
    },
    {
      matchId: 1004,
      competition: { id: 2019, name: 'Serie A', code: 'SA', emblem: '' },
      utcDate: '2026-03-23T19:45:00Z',
      homeTeam: { id: 108, name: 'Inter Milan', shortName: 'INT', crest: '' },
      awayTeam: { id: 98, name: 'AC Milan', shortName: 'ACM', crest: '' },
      over25Pct: 71,
      btts: 64,
      hy05Pct: 73,
      winnerPrediction: '1',
      winnerTeamName: 'Inter Milan',
      confidence: 'Orta',
      confidenceLevel: 2,
      homeGoalAvg: 1.6,
      awayGoalAvg: 1.1,
      homeGoalTrend: { scored: [2, 1, 2, 0, 3], conceded: [0, 1, 0, 1, 1] },
      awayGoalTrend: { scored: [1, 0, 2, 1, 1], conceded: [2, 1, 1, 2, 0] },
      valueBet: { market: 'Inter Galibiyet', ourProb: 62, impliedProb: 52, edge: 10 },
      strongestPick: 'İY 0.5 Üst (%73)',
      analysisNote: 'Milano derbisi, Inter evinde güçlü.',
    },
    {
      matchId: 1005,
      competition: { id: 2015, name: 'Ligue 1', code: 'FL1', emblem: '' },
      utcDate: '2026-03-23T20:00:00Z',
      homeTeam: { id: 524, name: 'Paris Saint-Germain', shortName: 'PSG', crest: '' },
      awayTeam: { id: 516, name: 'Olympique Marseille', shortName: 'OM', crest: '' },
      over25Pct: 76,
      btts: 59,
      hy05Pct: 80,
      winnerPrediction: '1',
      winnerTeamName: 'Paris Saint-Germain',
      confidence: 'Çok Yüksek',
      confidenceLevel: 4,
      homeGoalAvg: 2.3,
      awayGoalAvg: 0.9,
      homeGoalTrend: { scored: [3, 2, 4, 1, 3], conceded: [0, 1, 0, 0, 1] },
      awayGoalTrend: { scored: [0, 1, 2, 0, 1], conceded: [2, 3, 1, 2, 1] },
      valueBet: { market: 'PSG Galibiyet', ourProb: 78, impliedProb: 65, edge: 13 },
      strongestPick: 'İY 0.5 Üst (%80)',
      analysisNote: 'Le Classique - PSG evinde ezici üstünlük.',
    },
    {
      matchId: 1006,
      competition: { id: 2001, name: 'Champions League', code: 'CL', emblem: '' },
      utcDate: '2026-03-23T21:00:00Z',
      homeTeam: { id: 64, name: 'Liverpool', shortName: 'LIV', crest: '' },
      awayTeam: { id: 78, name: 'Atletico Madrid', shortName: 'ATM', crest: '' },
      over25Pct: 65,
      btts: 58,
      hy05Pct: 70,
      winnerPrediction: '1',
      winnerTeamName: 'Liverpool',
      confidence: 'Orta',
      confidenceLevel: 2,
      homeGoalAvg: 1.5,
      awayGoalAvg: 0.8,
      homeGoalTrend: { scored: [2, 1, 3, 1, 2], conceded: [0, 1, 1, 0, 1] },
      awayGoalTrend: { scored: [1, 0, 1, 0, 2], conceded: [1, 2, 0, 1, 1] },
      valueBet: { market: 'Liverpool Galibiyet', ourProb: 64, impliedProb: 50, edge: 14 },
      strongestPick: 'İY 0.5 Üst (%70)',
      analysisNote: 'Atletico defansif oynar, düşük skorlu maç bekleniyor.',
    },
  ];
}

export function getStaticStats() {
  return {
    totalMatches: 24,
    winnerSuccess: 67,
    over25Success: 78,
    bttsSuccess: 72,
    hy05Success: 81,
  };
}

export function getStaticResults() {
  return [
    {
      id: '1',
      homeTeam: 'Brighton',
      awayTeam: 'Liverpool',
      competition: 'Premier League',
      utcDate: '2026-03-21T15:00:00Z',
      actualScore: { home: 2, away: 1 },
      predictions: {
        winner: 'Liverpool Kazanır',
        winnerHit: false,
        over25: 78,
        over25Hit: true,
        btts: 65,
        bttsHit: true,
        hy05: 82,
        hy05Hit: true,
      },
      note: 'Gol marketleri güçlü okumaya devam ediyor.',
    },
    {
      id: '2',
      homeTeam: 'Manchester City',
      awayTeam: 'Arsenal',
      competition: 'Premier League',
      utcDate: '2026-03-22T17:30:00Z',
      actualScore: { home: 3, away: 1 },
      predictions: {
        winner: 'Manchester City Kazanır',
        winnerHit: true,
        over25: 85,
        over25Hit: true,
        btts: 72,
        bttsHit: true,
        hy05: 90,
        hy05Hit: true,
      },
      note: 'Tüm tahminler tuttu! Yüksek güven skoru doğrulandı.',
    },
    {
      id: '3',
      homeTeam: 'Real Madrid',
      awayTeam: 'Barcelona',
      competition: 'La Liga',
      utcDate: '2026-03-20T20:00:00Z',
      actualScore: { home: 1, away: 2 },
      predictions: {
        winner: 'Real Madrid Kazanır',
        winnerHit: false,
        over25: 82,
        over25Hit: true,
        btts: 78,
        bttsHit: true,
        hy05: 88,
        hy05Hit: false,
      },
      note: 'Sonuç tarafında sürpriz çıktı. Gol marketleri beklentiyi karşıladı.',
    },
    {
      id: '4',
      homeTeam: 'Bayern München',
      awayTeam: 'Dortmund',
      competition: 'Bundesliga',
      utcDate: '2026-03-19T17:30:00Z',
      actualScore: { home: 4, away: 2 },
      predictions: {
        winner: 'Bayern München Kazanır',
        winnerHit: true,
        over25: 91,
        over25Hit: true,
        btts: 85,
        bttsHit: true,
        hy05: 93,
        hy05Hit: true,
      },
      note: '4 tahminden 4 tuttu! Bundesliga derbisinde mükemmel okuma.',
    },
  ];
}

export function getDemoAIResponse(message: string): string {
  const msg = message.toLowerCase();

  if (msg.includes('2.5') || msg.includes('gol üst') || msg.includes('gol ust')) {
    return '⚽ **2.5 Gol Üstü** tahmini için şunlara bakıyoruz:\n\n- Her iki takımın son 5 maçtaki gol ortalaması\n- Karşılıklı maç geçmişi (H2H)\n- Lig ortalaması\n\n**%70+** ise yüksek ihtimal, **%65+** ise oynamayı düşünebilirsin. 📊';
  }
  if (msg.includes('kg var') || msg.includes('btts')) {
    return '🔁 **KG Var** (Both Teams to Score) için:\n\n- Her takımın skorsuz maç oranı\n- Savunma güçleri\n- Son maçlardaki gol atma tutarlılığı\n\n**%65+** olduğunda anlamlı bir tahmin olarak değerlendir. 💡';
  }
  if (msg.includes('value bet') || msg.includes('deger') || msg.includes('değer')) {
    return '💎 **Value Bet** nedir?\n\nBizim hesapladığımız olasılık (%60) ile bahisçinin implied oranının (%50) farkı **+10%** veya üzerindeyse Value Bet fırsatı oluşur.\n\nFormül: Bizim % - Bahisçi % >= +5% = VALUE ✅\n\nBu fırsatlar uzun vadede kazandırır. 📈';
  }
  if (msg.includes('nasıl') || msg.includes('nasil') || msg.includes('sistem')) {
    return '🤖 **GolEbu Analiz Sistemi** nasıl çalışır?\n\n1. **Veri toplama**: Son 5 maç istatistikleri\n2. **Poisson analizi**: Beklenen gol hesabı\n3. **Form skoru**: W=3, D=1, L=0 puanı\n4. **Güven skoru**: Veri kalitesi + tutarlılık\n5. **Value Bet**: Olasılık vs bahisçi oranı karşılaştırması\n\nEşiğimiz: **%65+** 🎯';
  }
  if (msg.includes('lig') || msg.includes('league') || msg.includes('hangi')) {
    return '⚽ **GolEbu** şu ligleri analiz eder:\n\n🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League\n🇪🇸 La Liga\n🇩🇪 Bundesliga\n🇮🇹 Serie A\n🇫🇷 Ligue 1\n🏆 Champions League\n🏆 Europa League\n🇵🇹 Primeira Liga\n🇳🇱 Eredivisie\n🇧🇷 Serie A (Brezilya)\n\nVeri kaynağı: football-data.org API 📊';
  }
  if (msg.includes('liverpool') || msg.includes('city') || msg.includes('madrid') || msg.includes('barcelona') || msg.includes('bayern')) {
    return '⚽ Bu takım hakkında detaylı analiz için:\n\n1. Son 5 maç performansına bak\n2. Gol ortalaması ve form skorunu incele\n3. Ev sahibi/deplasman farkı önemli\n4. Sakatlık ve kadro durumu etkili\n\nAnasayfadaki analiz kartlarında bu verileri bulabilirsin! 📊\n\n%65+ üstü tahminlere odaklan. 🎯';
  }

  return '⚽ Merhaba! GolEbu AI Asistan burada.\n\nSana şu konularda yardımcı olabilirim:\n- **2.5 Gol Üstü** tahminleri\n- **KG Var / Yok** analizi\n- **İlk Yarı gol** beklentisi\n- **Value Bet** fırsatları\n- Sistem nasıl çalışır?\n- Hangi ligleri analiz ediyoruz?\n\nBir soru sor! 🎯';
}
