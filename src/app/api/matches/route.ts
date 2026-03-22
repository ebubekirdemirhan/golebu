import { NextResponse } from 'next/server';
import { getTodayMatches, getMockMatches, getMockTeamStats } from '@/lib/football-api';
import { generateAnalysis, generateMockAnalysis } from '@/lib/analysis-engine';

export const revalidate = 900; // 15 dakikada bir yenile

export async function GET() {
  try {
    const apiKey = process.env.FOOTBALL_DATA_API_KEY;
    
    if (!apiKey || apiKey === 'your_football_data_api_key_here') {
      // Demo modu: mock veriler
      const mockMatches = getMockMatches();
      const analyses = mockMatches.map(match => generateMockAnalysis(match));
      
      return NextResponse.json({
        matches: mockMatches,
        analyses,
        mode: 'demo',
        message: 'Demo modu aktif. Gerçek veriler için football-data.org API key ekleyin.',
      });
    }

    const matches = await getTodayMatches();
    
    // Her maç için analiz üret
    const analyses = matches.map(match => {
      const homeStats = getMockTeamStats(match.homeTeam.name, true);
      homeStats.teamId = match.homeTeam.id;
      const awayStats = getMockTeamStats(match.awayTeam.name, false);
      awayStats.teamId = match.awayTeam.id;
      return generateAnalysis(match, homeStats, awayStats);
    });

    return NextResponse.json({
      matches,
      analyses,
      mode: 'live',
    });
  } catch (error) {
    console.error('Matches API error:', error);
    
    const mockMatches = getMockMatches();
    const analyses = mockMatches.map(match => generateMockAnalysis(match));
    
    return NextResponse.json({
      matches: mockMatches,
      analyses,
      mode: 'demo',
      error: 'API bağlantı hatası, demo veriler gösteriliyor.',
    });
  }
}
