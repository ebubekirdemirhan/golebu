import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

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
    return NextResponse.json({ response: getDemoResponse(message) });
  }

  // Gemini API dene
  const genAI = new GoogleGenerativeAI(geminiKey);
  const fullMessage = `${SYSTEM_PROMPT}\n\nKullanıcının sorusu: ${message}`;

  for (const modelName of MODELS_TO_TRY) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(fullMessage);
      const response = result.response.text();

      if (response) {
        return NextResponse.json({ response, model: modelName });
      }
    } catch (error: unknown) {
      const err = error as { status?: number; message?: string };
      console.log(`[${modelName}] hata:`, err.status || '', err.message?.slice(0, 100) || '');
      
      // 429 = rate limit, sonraki modeli dene
      // 404 = model yok, sonraki modeli dene
      // Diğer hatalar için de sonrakini dene
      continue;
    }
  }

  // Tüm modeller başarısız
  console.error('Tüm Gemini modelleri başarısız oldu');
  return NextResponse.json({
    response: '⚠️ AI asistan şu anda yoğun. Gemini API kotası dolmuş olabilir.\n\nBirkaç dakika sonra tekrar dene veya aşağıdaki hazır sorulara tıkla.\n\n' + getDemoResponse(message),
    error: 'rate_limit',
  });
}

function getDemoResponse(message: string): string {
  const msg = message.toLowerCase();

  if (msg.includes('2.5') || msg.includes('gol üst') || msg.includes('gol ust')) {
    return '⚽ **2.5 Gol Üstü** tahmini için şunlara bakıyoruz:\n\n- Her iki takımın son 5 maçtaki gol ortalaması\n- Karşılıklı maç geçmişi (H2H)\n- Lig ortalaması\n\n**%70+** ise yüksek ihtimal, **%65+** ise oynamayı düşünebilirsin. 📊';
  }
  if (msg.includes('kg var') || msg.includes('btts')) {
    return '🔁 **KG Var** (Both Teams to Score) için:\n\n- Her takımın skorsuz maç oranı\n- Savunma güçleri\n- Son maçlardaki gol atma tutarlılığı\n\n**%65+** olduğunda anlamlı bir tahmin olarak değerlendir. 💡';
  }
  if (msg.includes('value bet') || msg.includes('değer bet') || msg.includes('deger bet')) {
    return '💎 **Value Bet** nedir?\n\nBizim hesapladığımız olasılık (%60) ile bahisçinin implied oranının (%50) farkı **+10%** veya üzerindeyse Value Bet fırsatı oluşur.\n\nFormül: Bizim % - Bahisçi % ≥ +5% = VALUE ✅\n\nBu fırsatlar uzun vadede kazandırır. 📈';
  }

  return '⚽ Merhaba! GolEbu AI Asistan burada.\n\nSana şu konularda yardımcı olabilirim:\n- 2.5 Gol Üstü tahminleri\n- KG Var / Yok analizi\n- İlk Yarı gol beklentisi\n- Value Bet fırsatları\n\nBir soru sor! 🎯';
}
