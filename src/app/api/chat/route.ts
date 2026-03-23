import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getDemoAIResponse } from '@/lib/static-data';
import type { Analysis } from '@/lib/types';

const SYSTEM_PROMPT = `Sen GolEbu'nun AI futbol analiz asistanısın. Türkçe konuşuyorsun.
Görevin: Futbol maç analizleri, istatistikler, tahminler ve bahis stratejileri hakkında yardımcı olmak.
Kurallar:
- Sadece veri odaklı, istatistiksel analizler yap
- Kumarbaz gibi kesin kazanma garantisi verme
- Disiplinli ve sorumlu bahis yaklaşımını savun
- Kısa ve öz cevaplar ver
- Emoji kullanabilirsin
- Eğer CONTEXT_JSON verilmişse öncelikle onu referans al
- Context'te olmayan kesin bilgileri "eldeki veride görünmüyor" diye belirt
- Cevapta mümkünse "neden" kısmını 2-3 kısa maddeyle açıkla`;

const MODELS_TO_TRY = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash',
];

type MatchesContextResponse = {
  analyses?: Analysis[];
  source?: string;
  demo?: boolean;
};

function compactAnalysis(a: Analysis) {
  return {
    matchId: a.matchId,
    league: a.competition.name,
    home: a.homeTeam.name,
    away: a.awayTeam.name,
    kickoff: a.utcDate,
    winnerPrediction: a.winnerTeamName,
    confidence: a.confidence,
    over25Pct: a.over25Pct,
    btts: a.btts,
    hy05Pct: a.hy05Pct,
    strongestPick: a.strongestPick,
    tableContext: a.tableContext ?? null,
    performanceContext: a.performanceContext ?? null,
    last5Opponents: a.last5Opponents ?? null,
  };
}

async function fetchLiveContext(baseUrl: string): Promise<{
  source: string;
  matchCount: number;
  analyses: ReturnType<typeof compactAnalysis>[];
} | null> {
  try {
    const res = await fetch(`${baseUrl}/api/matches?t=${Date.now()}`, {
      cache: 'no-store',
      next: { revalidate: 0 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as MatchesContextResponse;
    const analyses = (data.analyses ?? []).slice(0, 8).map(compactAnalysis);
    return {
      source: data.source ?? 'unknown',
      matchCount: analyses.length,
      analyses,
    };
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const { message } = await req.json();
  const geminiKey = process.env.GEMINI_API_KEY;

  if (!geminiKey || geminiKey === 'your_gemini_api_key_here') {
    return NextResponse.json({ response: getDemoAIResponse(message || ''), demo: true });
  }

  const genAI = new GoogleGenerativeAI(geminiKey);
  const baseUrl = process.env.NEXTAUTH_URL || req.nextUrl.origin;
  const liveContext = await fetchLiveContext(baseUrl);
  const contextJson = liveContext
    ? JSON.stringify(liveContext, null, 2)
    : '{"source":"none","matchCount":0,"analyses":[]}';
  const fullMessage =
    `${SYSTEM_PROMPT}\n\n` +
    `CONTEXT_JSON:\n${contextJson}\n\n` +
    `Kullanıcının sorusu: ${message}\n\n` +
    `Yanıt formatı: kısa özet + veri dayanağı + dikkat notu.`;

  for (const modelName of MODELS_TO_TRY) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(fullMessage);
      const text = result.response.text();
      if (text) {
        return NextResponse.json({
          response: text,
          model: modelName,
          demo: false,
          contextSource: liveContext?.source ?? 'none',
          contextMatches: liveContext?.matchCount ?? 0,
        });
      }
    } catch (err: unknown) {
      const e = err as { message?: string };
      console.error(`[chat ${modelName}]`, e.message?.slice(0, 120));
    }
  }

  return NextResponse.json({
    response:
      '⚠️ AI şu an yanıt veremedi (kota veya ağ). Birkaç dakika sonra tekrar dene.\n\n' +
      getDemoAIResponse(message || ''),
    demo: true,
    error: 'fallback',
  });
}
