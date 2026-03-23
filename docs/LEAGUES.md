# Ligler ve veri kaynağı

## Hibrit mimari

| Kaynak | Rol | Dosya |
|--------|-----|--------|
| **football-data.org** | Birincil: geniş Avrupa/dünya ligleri, `getTeamMatches` ile son maç istatistiği | [`src/lib/football-api.ts`](../src/lib/football-api.ts) |
| **API-Football (api-sports.io)** | İkincil: fikstür (TFF 1–2, Suudi, BAE, Katar vb.); kartta **tahmini** analiz | [`src/lib/api-football.ts`](../src/lib/api-football.ts) |

İki kaynak önce [`mergeMatchesPrimaryWins`](../src/lib/match-merge.ts) ile dedupe edilir; ardından [`mergeWithReservedSecondarySlots`](../src/lib/match-merge.ts) ile toplam **en fazla 20** kartta **en fazla 8 slot API-Football** için ayrılır (büyük ligler listeyi doldurmasın diye).

## football-data.org

- Maç listesi `competitions` parametresiyle sorgulanır; boş/hata durumunda genel `/matches` denenir.
- Kapsam: [football-data.org/coverage](https://www.football-data.org/coverage)

## API-Football (ikincil)

- Anahtar: `API_FOOTBALL_KEY` ([api-football.com](https://www.api-football.com/)).
- Varsayılan lig ID’leri: `203` (Süper Lig), `204, 205, 307, 301, 305` — `API_FOOTBALL_LEAGUE_IDS` ile değiştirilebilir.
- **Ücretsiz plan:** günlük istek limiti düşüktür; her ana sayfa yükünde lig başına bir istek gider.
- İkincil maçlarda son maç / gol trendi **gerçek istatistik değildir**; UI’da “Tahmini analiz” bandı gösterilir.

## Türkiye

| Lig | football-data | API-Football (varsayılan ID) |
|-----|---------------|------------------------------|
| Süper Lig | Var (`TSL`) | `203` (varsayılan; football-data ile aynı maçta dedupe — tek kart, öncelik football-data tam analiz) |
| TFF 1. Lig | Plan’a bağlı | `204` |
| TFF 2. Lig | Yok | `205` |

## Arap Körfezi

Suudi (`307`), BAE (`301`), Katar (`305`) ikincil kaynakta varsayılan listeye dahildir.

## Süper Lig’in “gözükmemesi” (football-data)

1. API planı — [pricing](https://www.football-data.org/client/pricing)
2. Hafta içi boş gün — önümüzdeki 7 günde maç yoksa liste boş
3. Kota — `429`

Kod: [`src/lib/leagues.config.ts`](../src/lib/leagues.config.ts) (`ALL_LEAGUE_FILTERS` birincil + ikincil filtre etiketleri).
