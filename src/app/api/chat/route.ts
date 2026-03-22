import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { message, history } = await req.json();

  const geminiKey = process.env.GEMINI_API_KEY;

  if (!geminiKey || geminiKey === 'your_gemini_api_key_here') {
    // Demo mod: hazır cevaplar
    const demoResponse = getDemoResponse(message);
    return NextResponse.json({ response: demoResponse });
  }

  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const systemPrompt = `Sen GolLazım'ın AI futbol analiz asistanısın. Türkçe konuşuyorsun.
Görevin: Futbol maç analizleri, istatistikler, tahminler ve bahis stratejileri hakkında yardımcı olmak.
Kurallar:
- Sadece veri odaklı, istatistiksel analizler yap
- Kumarbaz gibi kesin kazanma garantisi verme
- Disiplinli ve sorumlu bahis yaklaşımını savun
- %65+ olasılık eşiğini öner
- Kısa ve öz cevaplar ver
- Emoji kullanabilirsin`;

    const chat = model.startChat({
      history: (history || []).map((msg: { role: string; content: string }) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      })),
      systemInstruction: systemPrompt,
    });

    const result = await chat.sendMessage(message);
    const response = result.response.text();

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Gemini error:', error);
    return NextResponse.json({ response: getDemoResponse(message) });
  }
}

function getDemoResponse(message: string): string {
  const msg = message.toLowerCase();

  if (msg.includes('2.5') || msg.includes('gol üst')) {
    return '⚽ **2.5 Gol Üstü** tahmini için şunlara bakıyoruz:\n\n- Her iki takımın son 5 maçtaki gol ortalaması\n- Karşılıklı maç geçmişi (H2H)\n- Lig ortalaması\n\n**%70+** ise yüksek ihtimal, **%65+** ise oynamayı düşünebilirsin. 📊';
  }
  if (msg.includes('kg var') || msg.includes('btts')) {
    return '🔁 **KG Var** (Both Teams to Score) için:\n\n- Her takımın skorsuz maç oranı\n- Savunma güçleri\n- Son maçlardaki gol atma tutarlılığı\n\n**%65+** olduğunda anlamlı bir tahmin olarak değerlendir. Düşük güven skorlu maçlarda pas geçmeyi öneriyoruz. 💡';
  }
  if (msg.includes('value bet') || msg.includes('değer bet')) {
    return '💎 **Value Bet** nedir?\n\nBizim hesapladığımız olasılık (%60) ile bahisçinin implied oranının (%50) farkı **+10%** veya üzerindeyse Value Bet fırsatı oluşur.\n\nFormül: Bizim % - Bahisçi % ≥ +5% = VALUE ✅\n\nBu fırsatlar uzun vadede kazandırır. 📈';
  }
  if (msg.includes('nasıl') || msg.includes('sistem')) {
    return '🤖 **GolLazım Analiz Sistemi** nasıl çalışır?\n\n1. **Veri toplama**: Son 5 maç istatistikleri\n2. **Poisson analizi**: Beklenen gol hesabı\n3. **Form skoru**: W=3, D=1, L=0 puanı\n4. **Güven skoru**: Veri kalitesi + tutarlılık\n5. **Value Bet**: Olasılık vs bahisçi oranı karşılaştırması\n\nEşiğimiz: **%65+** 🎯';
  }

  return '⚽ Merhaba! Ben GolLazım\'ın AI analiz asistanıyım.\n\nSana şu konularda yardımcı olabilirim:\n- 2.5 Gol Üstü tahminleri\n- KG Var / Yok analizi\n- İlk Yarı gol beklentisi\n- Value Bet fırsatları\n- Genel sistem nasıl çalışır\n\nNe sormak istersin? 🎯';
}
