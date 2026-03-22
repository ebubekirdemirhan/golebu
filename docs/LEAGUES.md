# Ligler ve veri kaynağı

## Hibrit mimari

| Kaynak | Rol | Dosya |
|--------|-----|--------|
| **football-data.org** | Birincil: geniş Avrupa/dünya ligleri, `getTeamMatches` ile son maç istatistiği | [`src/lib/football-api.ts`](../src/lib/football-api.ts) |
| **API-Football (api-sports.io)** | İkincil: fikstür (TFF 1–2, Suudi, BAE, Katar vb.); kartta **tahmini** analiz | [`src/lib/api-football.ts`](../src/lib/api-football.ts) |

İki kaynak önce [`mergeMatchesPrimaryWins`](../src/lib/match-merge.ts) ile dedupe edilir; ardından [`mergeWithReservedSecondarySlots`](../src/lib/match-merge.ts) ile toplam 15 kartta **en az 5 slot API-Football** için ayrılır (büyük ligler listeyi doldurmasın diye).

## football-data.org

- Maç listesi `competitions` parametresiyle sorgulanır; boş/hata durumunda genel `/matches` denenir.
- Kapsam: [football-data.org/coverage](https://www.football-data.org/coverage)

## API-Football (ikincil)

- Anahtar: `API_FOOTBALL_KEY` ([api-football.com](https://www.api-football.com/)).
- Varsayılan lig ID’leri: `204` (Süper Lig), `205, 206, 307, 301, 233` — `API_FOOTBALL_LEAGUE_IDS` ile değiştirilebilir.
- **Ücretsiz plan:** günlük istek limiti düşüktür; her ana sayfa yükünde lig başına bir istek gider.
- İkincil maçlarda son maç / gol trendi **gerçek istatistik değildir**; UI’da “Tahmini analiz” bandı gösterilir.

## Türkiye

| Lig | football-data | API-Football (varsayılan ID) |
|-----|---------------|------------------------------|
| Süper Lig | Var (`TSL`) | `204` (varsayılan; football-data ile aynı maçta dedupe — tek kart, öncelik football-data tam analiz) |
| TFF 1. Lig | Plan’a bağlı | `205` |
| TFF 2. Lig | Yok | `206` (API’de lig kodu farklıysa `API_FOOTBALL_LEAGUE_IDS` güncelleyin) |

## Arap Körfezi

Suudi (`307`), BAE (`301`), Katar (`233`) ikincil kaynakta varsayılan listeye dahildir.

## Süper Lig’in “gözükmemesi” (football-data)

1. API planı — [pricing](https://www.football-data.org/client/pricing)
2. Hafta içi boş gün — önümüzdeki 7 günde maç yoksa liste boş
3. Kota — `429`

Kod: [`src/lib/leagues.config.ts`](../src/lib/leagues.config.ts) (`ALL_LEAGUE_FILTERS` birincil + ikincil filtre etiketleri).
