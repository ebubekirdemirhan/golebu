# GolEbu — Vercel’e deploy

## 1. Repo’yu bağla

1. [vercel.com](https://vercel.com) → **Add New** → **Project** → GitHub’dan `golebu` reposunu seç.
2. **Framework Preset:** Next.js (otomatik algılanır).
3. **Deploy** (ilk build).

## 2. Ortam değişkenleri (Settings → Environment Variables)

| Değişken | Açıklama |
|----------|----------|
| `FOOTBALL_DATA_API_KEY` | [football-data.org](https://www.football-data.org/client/register) — **birincil** maç/analiz kaynağı (isteğe bağlı ama önerilir) |
| `API_FOOTBALL_KEY` | [API-Football / api-sports.io](https://www.api-football.com/) — **ikincil** fikstür (TFF 1–2, Suudi, BAE, Katar). Ücretsiz planda **günlük düşük kota**; her sayfa yükünde lig başına istek gider. |
| `API_FOOTBALL_LEAGUE_IDS` | (İsteğe bağlı) Virgülle lig ID’leri. Yoksa varsayılan: `203,204,205,307,301,305`. |
| `MAX_MATCHES` | (İsteğe bağlı) `/api/matches` üst sınırı. Varsayılan `20`, önerilen aralık `10-30`. |
| `MAX_SECONDARY` | (İsteğe bağlı) API-Football için ayrılan slot. Varsayılan `8`. |
| `ENABLE_SCRAPING` | (İsteğe bağlı) Scrape fallback aktif/pasif (`true/false`). Varsayılan `true`. |
| `SOURCE_TIMEOUT_MS` | (İsteğe bağlı) Kaynak başına timeout (ms). Varsayılan `9000`. |
| `SOURCE_RETRY_COUNT` | (İsteğe bağlı) Kaynak hata olursa tekrar deneme sayısı. Varsayılan `2`. |
| `SCRAPE_TIMEOUT_MS` | (İsteğe bağlı) Scrape sağlayıcısı timeout (ms). Varsayılan `8000`. |
| `SCRAPE_ALLOWED_LEAGUE_KEYWORDS` | (İsteğe bağlı) Virgülle lig anahtar kelimeleri; scrape sadece bu kelimelerle eşleşen ligleri alır. |
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/app/apikey) — AI asistan için |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` ile üret |
| `NEXTAUTH_URL` | Production URL: `https://senin-proje.vercel.app` (custom domain varsa o) |

İsteğe bağlı:

- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — Google ile giriş

**Önemli:** `NEXTAUTH_URL` production’da Vercel domain’in ile **aynı** olmalı; yoksa oturum çalışmaz.

## 3. Yeniden deploy

Env ekledikten sonra **Deployments → Redeploy** (veya boş commit push).

## GitHub Pages vs Vercel

- **GitHub Pages:** Sadece statik site; API yok → sahte veri.
- **Vercel:** Next.js API route’ları çalışır → `football-data.org`, isteğe bağlı `API-Football`, Gemini, NextAuth kullanılabilir.

## Sayfa “düz HTML”, stiller yok, menü üçlü görünüyor

- **Vercel → Settings → Build & Development:** **Output Directory boş** olmalı (`out` yazma). Framework: **Next.js**.
- Tarayıcı: **Ctrl+Shift+R**, gizli sekme; reklam engelleyici bazen `/_next/static/*.css` dosyasını keser — dene veya devre dışı bırak.
- Sunucu tarafı genelde doğru çalışır; sorun çoğunlukla **önbellek** veya **CSS dosyasının istemcide yüklenmemesi**. Son sürümde `layout` içine **inline kritik CSS** (koyu arka plan + mobil/masaüstü nav ayrımı) eklendi; yine de tam görünüm için Tailwind bundle’ının yüklenmesi gerekir.

## API-Football kota uyarısı

- Ücretsiz anahtarda günlük istek sınırı küçüktür; ana sayfa her açılışta birden fazla lig için `/fixtures` çağırır.
- Kota bittiğinde ikincil kaynak boş döner; birincil (`FOOTBALL_DATA_API_KEY`) hâlâ çalışıyorsa o maçlar listelenir.
- Yeni sürümde `/api/matches` yanıtında `diagnostics.sourceHealth` alanı gelir; kaynak bazlı `PLAN_BLOCK / RATE_LIMIT / SCRAPE_BLOCK` durumlarını UI’da görebilirsiniz.
- Detay: [docs/LEAGUES.md](docs/LEAGUES.md).
