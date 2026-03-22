import { CheckCircle } from 'lucide-react';

const COLOR_SYSTEM = [
  { range: '%70 ve üzeri', label: 'Yüksek İhtimal', color: 'bg-green-500/20 text-green-400 border border-green-500/30' },
  { range: '%40 – %69', label: 'Orta İhtimal', color: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' },
  { range: '%40 altı', label: 'Düşük İhtimal', color: 'bg-red-500/20 text-red-400 border border-red-500/30' },
];

const CARD_FIELDS = [
  { num: 1, title: 'Kazanan tahmini', desc: 'Ev sahibi, deplasman veya beraberlik — AI\'ın 1X2 tahmini' },
  { num: 2, title: 'Taraf güveni', desc: 'Analiz kalitesi: Düşük / Orta / Yüksek / Çok Yüksek' },
  { num: 3, title: '2.5 Gol Üstü %', desc: 'Maçta toplam 3 veya daha fazla gol atılma ihtimali' },
  { num: 4, title: 'İY 0.5 Üst %', desc: 'İlk yarıda en az 1 gol atılma ihtimali' },
  { num: 5, title: 'KG Var (BTTS) %', desc: 'Her iki takımın da gol atma ihtimali' },
  { num: 6, title: 'Gol ortalaması', desc: 'Ev sahibi / Deplasman — son 5 maç ortalaması' },
  { num: 7, title: 'Gol trendi', desc: 'Son 5 maçta attığı ve yediği goller — eskiden yeniye' },
  { num: 8, title: 'Value Bet', desc: 'Bizim tahmin oranımız bahisçi oranından +5%+ yüksekse gösterilir' },
];

const EXAMPLES = [
  { team: 'Bayern Münih', market: '2.5 Gol Üstü', pct: 75, color: 'bg-green-500/20 text-green-400', result: '→ Yeşil, eşik aşıldı ✓' },
  { team: 'Bayern Münih', market: 'KG Var', pct: 45, color: 'bg-yellow-500/20 text-yellow-400', result: '→ Turuncu, eşik yok ✗' },
  { team: 'Bayern Münih', market: 'İY 0.5 Üst', pct: 85, color: 'bg-green-500/20 text-green-400', result: '→ Yeşil, eşik aşıldı ✓' },
];

const HOW_IT_WORKS = [
  { step: 1, title: 'Veri Toplama', desc: 'Her iki takımın son 5 maç istatistikleri, gol ortalamaları ve form durumu alınır.' },
  { step: 2, title: 'Poisson Analizi', desc: 'Beklenen toplam gol sayısından matematiksel olasılık hesabı yapılır.' },
  { step: 3, title: 'Form Skoru', desc: 'W=3, D=1, L=0 puanlamasıyla takım form gücü belirlenir.' },
  { step: 4, title: 'Güven Skoru', desc: 'Veri kalitesi, form tutarlılığı ve göstergelerin gücü güven seviyesini belirler.' },
  { step: 5, title: 'Value Bet Tespiti', desc: 'Bizim tahmin % ile implied bahisçi oranı karşılaştırılır. +5%+ fark = VALUE BET.' },
];

export default function GuidePage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white mb-1">
          📊 Analiz Kartı <span className="gradient-text">Rehberi</span>
        </h1>
        <p className="text-gray-400 text-sm">GolEbu analiz kartlarını nasıl okuyacağını öğren</p>
      </div>

      {/* Renk Sistemi */}
      <div className="bg-[#13132a] border border-white/5 rounded-2xl p-4 mb-4">
        <h2 className="text-white font-bold mb-3 text-sm uppercase tracking-wider">Renk Sistemi</h2>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {COLOR_SYSTEM.map(c => (
            <div key={c.range} className={`${c.color} rounded-xl p-3 text-center`}>
              <p className="font-bold text-sm">{c.range}</p>
              <p className="text-xs opacity-80 mt-0.5">{c.label}</p>
            </div>
          ))}
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
          <p className="text-gray-300 text-sm">
            ✦ Bahis için önerilen eşik: <strong className="text-green-400">%65 ve üzeri</strong> ✦
          </p>
        </div>
      </div>

      {/* Kart Alanları */}
      <div className="bg-[#13132a] border border-white/5 rounded-2xl p-4 mb-4">
        <h2 className="text-white font-bold mb-3 text-sm uppercase tracking-wider">Kart Alanları</h2>
        <div className="space-y-3">
          {CARD_FIELDS.map(f => (
            <div key={f.num} className="flex gap-3">
              <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center text-xs font-bold shrink-0">
                {f.num}
              </div>
              <div>
                <p className="text-white text-sm font-medium">{f.title}</p>
                <p className="text-gray-400 text-xs">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Nasıl Çalışır */}
      <div className="bg-[#13132a] border border-white/5 rounded-2xl p-4 mb-4">
        <h2 className="text-white font-bold mb-3 text-sm uppercase tracking-wider">🤖 Nasıl Çalışır?</h2>
        <div className="space-y-3">
          {HOW_IT_WORKS.map(s => (
            <div key={s.step} className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 flex items-center justify-center text-xs font-bold shrink-0">
                {s.step}
              </div>
              <div>
                <p className="text-white text-sm font-medium">{s.title}</p>
                <p className="text-gray-400 text-xs">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Premium vs Ücretsiz */}
      <div className="bg-[#13132a] border border-purple-500/20 rounded-2xl p-4 mb-4">
        <h2 className="text-white font-bold mb-3 text-sm uppercase tracking-wider">👑 Premium vs Ücretsiz</h2>
        <div className="space-y-2">
          {[
            { feature: 'Günlük analiz kartı limiti', free: '2 maç', premium: 'Sınırsız', highlight: true },
            { feature: 'Value Bet fırsatları', free: 'Gizli', premium: 'Tam erişim', highlight: true },
            { feature: 'Gol trend grafiği', free: 'Görünür', premium: 'Görünür', highlight: false },
            { feature: 'AI Asistan sohbet', free: '5 mesaj/gün', premium: 'Sınırsız', highlight: true },
            { feature: 'Sonuç takibi', free: 'Görünür', premium: 'Detaylı rapor', highlight: false },
            { feature: 'Güven skoru detayı', free: 'Sadece seviye', premium: 'Tam analiz notu', highlight: true },
          ].map((row, i) => (
            <div key={i} className={`flex items-center justify-between rounded-lg p-3 ${row.highlight ? 'bg-purple-900/10 border border-purple-500/10' : 'bg-[#1a1a35]'}`}>
              <span className="text-gray-300 text-sm">{row.feature}</span>
              <div className="flex items-center gap-4 text-xs">
                <span className="text-gray-500 w-20 text-right">{row.free}</span>
                <span className="text-purple-400 font-semibold w-24 text-right">{row.premium}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Örnek Okuma */}
      <div className="bg-[#13132a] border border-white/5 rounded-2xl p-4 mb-4">
        <h2 className="text-white font-bold mb-3 text-sm uppercase tracking-wider">Örnek Okuma</h2>
        <div className="space-y-2">
          {EXAMPLES.map((e, i) => (
            <div key={i} className="flex items-center justify-between bg-[#1a1a35] rounded-lg p-3">
              <div>
                <p className="text-gray-300 text-sm">{e.team}</p>
                <p className="text-gray-500 text-xs">→ {e.market}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`${e.color} px-2 py-1 rounded-lg text-sm font-bold`}>%{e.pct}</span>
                <span className="text-gray-400 text-xs">{e.result}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* API Kurulumu */}
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-2xl p-4">
        <h2 className="text-blue-300 font-bold mb-3 text-sm uppercase tracking-wider">🔧 Gerçek Veri için Kurulum</h2>
        <p className="text-blue-400/80 text-xs mb-3">
          Canlı maçlar ve API route’ları için site <strong className="text-white">Vercel</strong> üzerinde çalışmalıdır.
          GitHub Pages yalnızca statik sayfa sunar; sunucu tarafı yoktur. Projede <code className="text-green-400">VERCEL.md</code> dosyasına bak.
        </p>
        <div className="space-y-3">
          <div className="flex gap-3">
            <CheckCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-blue-200 text-sm font-medium">football-data.org API Key</p>
              <p className="text-blue-400/70 text-xs">Ücretsiz kayıt: football-data.org/client/register</p>
              <code className="text-green-400 text-xs">Vercel Env → FOOTBALL_DATA_API_KEY=...</code>
            </div>
          </div>
          <div className="flex gap-3">
            <CheckCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-blue-200 text-sm font-medium">Google Gemini API Key (AI Asistan)</p>
              <p className="text-blue-400/70 text-xs">Ücretsiz: aistudio.google.com/app/apikey</p>
              <code className="text-green-400 text-xs">Vercel Env → GEMINI_API_KEY=...</code>
            </div>
          </div>
          <div className="flex gap-3">
            <CheckCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-blue-200 text-sm font-medium">Supabase (Veritabanı)</p>
              <p className="text-blue-400/70 text-xs">Ücretsiz: supabase.com → Yeni proje oluştur</p>
              <code className="text-green-400 text-xs">.env.local → NEXT_PUBLIC_SUPABASE_URL=...</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
