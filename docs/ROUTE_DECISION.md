# Route Decision Model

**Status:** Provisional  
**Scored:** 2026-07-20 (night split corrected same day)  
**Founder lock required:** Yes — see Open Decision D2

## Night math (hard constraint)

For the current itinerary pattern **Day 1 arrive / Day 7 depart**:

| Nights in hotels | Calendar span |
|------------------|---------------|
| 6 | 7 travel days |

Therefore any dual-city split must sum to **6 nights**.  
**Seoul 4N + Busan 3N = 7 nights** would require an **8-day** trip (or departing the morning after night 7). That older draft was an internal conflict and is corrected below.

## Scoring weights (0–10 each, then weighted)

| Criterion | Weight | Notes |
|-----------|--------|-------|
| Food experience | 12% | Local food core; pork soup interest |
| Beach & scenery | 11% | Explicit goal |
| GOT7 / entertainment | 10% | Girlfriend preference |
| Shopping | 10% | Alien merch, cosmetics, clothes |
| Hanbok & culture (incl. fortune) | 9% | Explicit goals |
| Transit complexity | 10% | Scored as manageability (higher = easier) |
| Daily walking load | 10% | Feet tire easily |
| Lodging + transit budget | 8% | Practical budget |
| 7-day schedule loss | 8% | Transfer days consume sightseeing |
| First-overseas risk | 7% | Simpler = safer for first trip |
| Shared memory value | 5% | Distinctive couple memories |

## Options

### Option A — Seoul only (6N / 7 days)

| Criterion | Score | Rationale |
|-----------|------:|-----------|
| Food | 8 | Huge density; pork soup available but Busan is iconic for 돼지국밥 |
| Beach & scenery | 3 | Han River / near trips only; weak beach |
| GOT7 / entertainment | 9 | Best entertainment / idol infrastructure |
| Shopping | 9 | Myeongdong, Hongdae, underground malls |
| Hanbok & culture | 9 | Bukchon, palaces, fortune districts |
| Transit ease | 8 | One metro system |
| Walking manageability | 7 | Still dense; can stay area-compact |
| Budget | 7 | One lodging; Seoul prices |
| 7-day loss | 9 | No intercity transfer day |
| First-overseas risk | 9 | Simplest |
| Shared memory | 6 | Strong city memories; weaker nature/beach |
| **Weighted** | **~7.5** | |

### Option B — Seoul 4N + Busan 2N (Provisional pick for 7 days)

| Criterion | Score | Rationale |
|-----------|------:|-----------|
| Food | 9 | Seoul variety + Busan pork soup / market food |
| Beach & scenery | 8 | Two Busan nights still allow one full beach day + buffer |
| GOT7 / entertainment | 8 | Seoul covers most |
| Shopping | 8 | Seoul primary; do Alien/cosmetics before leaving Seoul |
| Hanbok & culture | 8 | Seoul primary |
| Transit ease | 5 | One KTX day |
| Walking manageability | 6 | Single-district days |
| Budget | 6 | Two lodgings + KTX |
| 7-day loss | 6 | One light transfer day |
| First-overseas risk | 6 | Doable with handbook + buffers |
| Shared memory | 9 | City + sea contrast |
| **Weighted** | **~7.6** | |

### Option B′ — Seoul 4N + Busan 3N (requires 8 calendar days)

Same dual-city benefits as B, but **incompatible with `duration_days: 7` arrive/depart pattern**. Only revive if Founder extends the trip to 8 days / 7 nights.

### Option C — Seoul 3N + Busan 3N (also 6N / 7 days)

| Criterion | Score | Rationale |
|-----------|------:|-----------|
| Food | 9 | More Busan meal nights |
| Beach & scenery | 9 | Stronger beach time |
| GOT7 / entertainment | 7 | One fewer Seoul night |
| Shopping | 7 | Tighter Seoul shopping window |
| Hanbok & culture | 7 | Tighter Seoul culture window |
| Transit ease | 5 | Still one KTX day (earlier move) |
| Walking manageability | 6 | |
| Budget | 6 | |
| 7-day loss | 6 | |
| First-overseas risk | 6 | |
| Shared memory | 9 | |
| **Weighted** | **~7.4** | |

Viable alternative if beach is non-negotiable over Seoul density.

### Option D — Busan primary (~7 days)

| Weighted | ~6.7 | Weaker GOT7/shopping/hanbok |

### Option E — Seoul + nature day-trip (no Busan stay)

| Weighted | ~6.0 | Rejected: fatigue + weak true beach stay |

## Current recommendation

**Option B — Seoul 4N + Busan 2N** as **Provisional** best fit for a **7-day / 6-night** trip.

### Why

1. Dual-city still matches beach + Seoul culture/shopping/GOT7 goals.  
2. Night count is arithmetically consistent with Day 1 arrive / Day 7 depart.  
3. Keeps existing itinerary skeleton (Seoul D1–D4, transfer D5, Busan D6–D7) without inventing an 8th day.  
4. Shopping that is denser in Seoul (cosmetics / Alien) should be finished **before** the KTX day.

### What this does *not* mean

- Cities are **not** locked.  
- No hotels or trains are booked.  
- Day plans remain Provisional skeletons.

### Next Founder action (D2)

Choose:

1. **Seoul 4N + Busan 2N** (current Provisional), or  
2. **Seoul 3N + Busan 3N** (more beach), or  
3. **Extend to 8 days** to keep 4N+3N, or  
4. Seoul-only / Busan-primary.
