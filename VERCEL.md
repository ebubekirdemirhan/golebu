# GolEbu — Vercel’e deploy

## 1. Repo’yu bağla

1. [vercel.com](https://vercel.com) → **Add New** → **Project** → GitHub’dan `golebu` reposunu seç.
2. **Framework Preset:** Next.js (otomatik algılanır).
3. **Deploy** (ilk build).

## 2. Ortam değişkenleri (Settings → Environment Variables)

| Değişken | Açıklama |
|----------|----------|
| `FOOTBALL_DATA_API_KEY` | [football-data.org](https://www.football-data.org/client/register) ücretsiz anahtar — **canlı maçlar için zorunlu** |
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
- **Vercel:** Next.js API route’ları çalışır → `football-data.org`, Gemini, NextAuth kullanılabilir.
