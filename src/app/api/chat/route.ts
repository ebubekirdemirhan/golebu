import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getDemoAIResponse } from '@/lib/static-data';

const SYSTEM_PROMPT = `Sen GolEbu'nun AI futbol analiz asistanısın. Türkçe konuşuyorsun.
Görevin: Futbol maç analizleri, istatistikler, tahminler ve bahis stratejileri hakkında yardımcı olmak.
Kurallar:
- Sadece veri odaklı, istatistiksel analizler yap
- Kumarbaz gibi kesin kazanma garantisi verme
- Disiplinli ve sorumlu bahis yaklaşımını savun
- Kısa ve öz cevaplar ver
- Emoji kullanabilirsin`;

const MODELS_TO_TRY = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash',
];

export async function POST(req: NextRequest) {
  const { message } = await req.json();
  const geminiKey = process.env.GEMINI_API_KEY;

  if (!geminiKey || geminiKey === 'your_gemini_api_key_here') {
    return NextResponse.json({ response: getDemoAIResponse(message || ''), demo: true });
  }

  const genAI = new GoogleGenerativeAI(geminiKey);
  const fullMessage = `${SYSTEM_PROMPT}\n\nKullanıcının sorusu: ${message}`;

  for (const modelName of MODELS_TO_TRY) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(fullMessage);
      const text = result.response.text();
      if (text) {
        return NextResponse.json({ response: text, model: modelName, demo: false });
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
