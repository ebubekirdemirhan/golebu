import { Analysis } from './types';
import { getMockMatches } from './football-api';
import { generateMockAnalysis } from './analysis-engine';

export function getStaticAnalyses(): Analysis[] {
  const matches = getMockMatches();
  return matches.map(match => generateMockAnalysis(match));
}

export function getStaticStats() {
  return {
    totalMatches: 17,
    winnerSuccess: 65,
    over25Success: 76,
    bttsSuccess: 88,
    hy05Success: 76,
  };
}

export function getStaticResults() {
  return [
    {
      id: '1',
      matchId: 9001,
      homeTeam: 'Brighton & Hove Albion',
      awayTeam: 'Liverpool',
      competition: 'Premier League',
      utcDate: new Date(Date.now() - 86400000 * 2).toISOString(),
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
      note: 'Gol marketleri guclu okumaya devam ediyor. Mac beklendigi gibi gollu gecti.',
    },
    {
      id: '2',
      matchId: 9002,
      homeTeam: 'Manchester City',
      awayTeam: 'Arsenal',
      competition: 'Premier League',
      utcDate: new Date(Date.now() - 86400000 * 1).toISOString(),
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
      note: 'Tum tahminler tuttu. Yuksek guven skoru dogrulandi.',
    },
    {
      id: '3',
      matchId: 9003,
      homeTeam: 'Real Madrid',
      awayTeam: 'Barcelona',
      competition: 'La Liga',
      utcDate: new Date(Date.now() - 86400000 * 3).toISOString(),
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
      note: 'Sonuc tarafinda surpriz cikti. Gol marketleri yine beklendiyi karsiladi.',
    },
    {
      id: '4',
      matchId: 9004,
      homeTeam: 'Bayern München',
      awayTeam: 'Dortmund',
      competition: 'Bundesliga',
      utcDate: new Date(Date.now() - 86400000 * 4).toISOString(),
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
      note: '4 tahminden 4 tuttu! Bundesliga derbisinde mukemmel okuma.',
    },
  ];
}

export function getDemoAIResponse(message: string): string {
  const msg = message.toLowerCase();

  if (msg.includes('2.5') || msg.includes('gol üst') || msg.includes('gol ust')) {
    return '⚽ **2.5 Gol Üstü** tahmini icin sunlara bakiyoruz:\n\n- Her iki takimin son 5 mactaki gol ortalamasi\n- Karsilikli mac gecmisi (H2H)\n- Lig ortalamasi\n\n**%70+** ise yüksek ihtimal, **%65+** ise oynamayi dusunebilirsin. 📊';
  }
  if (msg.includes('kg var') || msg.includes('btts')) {
    return '🔁 **KG Var** (Both Teams to Score) icin:\n\n- Her takimin skorsuz mac orani\n- Savunma gucleri\n- Son maclardaki gol atma tutarliligi\n\n**%65+** oldugunda anlamli bir tahmin olarak degerlendir. 💡';
  }
  if (msg.includes('value bet') || msg.includes('deger') || msg.includes('değer')) {
    return '💎 **Value Bet** nedir?\n\nBizim hesapladigimiz olasilik (%60) ile bahiscinin implied oraninin (%50) farki **+10%** veya üzerindeyse Value Bet firsati olusur.\n\nFormul: Bizim % - Bahisci % >= +5% = VALUE ✅\n\nBu firsatlar uzun vadede kazandirir. 📈';
  }
  if (msg.includes('nasıl') || msg.includes('nasil') || msg.includes('sistem')) {
    return '🤖 **GolEbu Analiz Sistemi** nasil calisir?\n\n1. **Veri toplama**: Son 5 mac istatistikleri\n2. **Poisson analizi**: Beklenen gol hesabi\n3. **Form skoru**: W=3, D=1, L=0 puani\n4. **Guven skoru**: Veri kalitesi + tutarlilik\n5. **Value Bet**: Olasilik vs bahisci orani karsilastirmasi\n\nEsigimiz: **%65+** 🎯';
  }
  if (msg.includes('lig') || msg.includes('league') || msg.includes('hangi')) {
    return '⚽ **GolEbu** su ligleri analiz eder:\n\n🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League\n🇪🇸 La Liga\n🇩🇪 Bundesliga\n🇮🇹 Serie A\n🇫🇷 Ligue 1\n🏆 Champions League\n🏆 Europa League\n🇵🇹 Primeira Liga\n🇳🇱 Eredivisie\n🇧🇷 Serie A (Brezilya)\n\nVeri kaynagi: football-data.org API 📊';
  }
  if (msg.includes('liverpool') || msg.includes('city') || msg.includes('madrid') || msg.includes('barcelona') || msg.includes('bayern')) {
    return '⚽ Bu takim hakkinda detayli analiz icin:\n\n1. Son 5 mac performansina bak\n2. Gol ortalamasi ve form skorunu incele\n3. Ev sahibi/deplasman farki onemli\n4. Sakatlik ve kadro durumu etkili\n\nAnasayfadaki analiz kartlarinda bu verileri bulabilirsin! 📊\n\n%65+ ustu tahminlere odaklan. 🎯';
  }

  return '⚽ Merhaba! GolEbu AI Asistan burada.\n\nSana su konularda yardimci olabilirim:\n- **2.5 Gol Üstü** tahminleri\n- **KG Var / Yok** analizi\n- **Ilk Yari gol** beklentisi\n- **Value Bet** firsatlari\n- Sistem nasil calisir?\n- Hangi ligleri analiz ediyoruz?\n\nBir soru sor! 🎯';
}
