# Seoul / Busan Research Coverage Matrix

**Round:** 1 · Quality correction 2026-07-20  
**Source inventory:** [`data/research-sources.yaml`](../../data/research-sources.yaml) · [SOURCE_COUNT_SUMMARY.md](./SOURCE_COUNT_SUMMARY.md)  
**Claims:** [`data/claim-evidence-map.yaml`](../../data/claim-evidence-map.yaml)

Confidence: `Low` / `Medium` / `High` — honest baseline.  
Freshness column uses `operational_freshness` semantics (`needs_recheck` / `unknown`) — **not** HTTP-200 ⇒ current.

Tier columns now mean **A1+A2** combined under “Official”, with notes when only A2 exists.

## Summary

| Region | Topics tracked | High | Medium | Low / gap-heavy |
|--------|----------------|-----:|-------:|----------------:|
| Seoul | 18 | 2 | 8 | 8 |
| Busan | 14 | 2 | 6 | 6 |

Travel factual primary sources: **40** (not the full 86 inventory). Personalization-critical cells remain thin.

## High-impact claim links (role-split)

See [`data/claim-evidence-map.yaml`](../../data/claim-evidence-map.yaml) for full role fields.

| Topic | Claim ID | Supporting | Discovery | Blocked |
|-------|----------|------------|-----------|---------|
| 景福宮 | clm-gyeongbokgung-closed-tuesday | rs-011, rs-010 | rs-012 | — |
| 韓服 | clm-hanbok-shop-unselected | — | rs-010, rs-013, rs-050, rs-062, rs-067, rs-068 | — |
| Day 3 購物 | clm-day3-shopping-path-thin | — | rs-018–021, rs-061, rs-051 | — |
| JYP | clm-jyp-visit-value-unproven | rs-026 | rs-024, rs-025, rs-059 | — |
| 韓國算命 | clm-fortune-shop-missing | rs-087, rs-088 | rs-065, rs-066, rs-089, rs-090 | rs-blocked-005 |
| 明洞購物／退稅 | clm-day3-shopping-path-thin | rs-018, rs-020, rs-021, rs-091 | rs-019, rs-023, rs-061 | — |
| 豬肉湯飯 | clm-pork-soup-shortlist-incomplete | rs-041–043 | rs-037, rs-038, rs-063 | — |
| Sky Capsule | clm-sky-capsule-ops-unconfirmed | rs-028 | rs-027, rs-029, rs-057, rs-058 | — |
| Day 6 低體力 | clm-day6-low-energy-variant-missing | — | rs-032, rs-030, rs-060, rs-039, rs-009 | — |

---

## Seoul

| Topic | Official A1/A2 | Indep. B | Creator C | Confidence | Ops freshness | Personalization | Unresolved gaps | Next action |
|-------|----------------:|---------:|----------:|------------|---------------|-----------------|-----------------|-------------|
| 景福宮 | A1+A2 | 1+ | 2 | Medium | needs_recheck | Jerry pacing + Nikita photos | Weekday lock needs D1 | Revalidate hours; keep Changdeok backup |
| 韓服體驗 | A2 context only | 1+ | 2 | Low | unknown | Nikita priority | **No shop selected** | Shortlist 3 shops; prefer A1 shop pages |
| 仁寺洞 | A2 | 1 | 1 | Medium | needs_recheck | Rain backup | Not primary day | Decide rain path |
| 益善洞 | A2/gov | 1 | 1 | Low | needs_recheck | Photos vs walking | Stairs / crowds | Compare vs Bukchon load |
| 北村 | A1+A2 | 1+ | 0 | Medium | needs_recheck | Couple photos | Etiquette / slopes | Droppable + Warn visual |
| 明洞 | A2 | 1+ | 0 | Medium | needs_recheck | Shopping hub | Store path thin | See Day 3 claim |
| 弘大 | A2 | 1 | 1 | Medium | needs_recheck | Clothes backup | Not scheduled | Overflow only |
| 聖水 | A2 | 1 | 1 | Low | unknown | Clothes/cafe | Transfer cost | Only if lodging fits |
| 江南 | A1/A2 | 1+ | 1 | Medium | needs_recheck | GOT7 + fortune | Shop gaps | Keep single cluster |
| 化妝品購物 | A2 tax/shopping | 1+ | 0 | Low | needs_recheck | Nikita priority | No store IDs | Round 2 shopping slice |
| GOT7／JYP | A1 org + A2 adj. | 1 | 0 | Low | unknown | Nikita GOT7 | Visit value unproven | Feasibility PR |
| 韓國算命 | 0 A1 shops | 0 | 2 | Low | unknown | Nikita priority | **P0 shop gap** | Find 2 Gangnam shops |
| 市場與街頭美食 | A2 | 1+ | 1 | Medium | needs_recheck | Food constraints | Shellfish mapping | Label safe stalls |
| 兩人拍照地點 | mixed | 1+ | 2 | Medium | unknown | Couple + instant camera | Scattered tips | Photo cards later |
| 雨天方案 | thin | 1+ | 0 | Low | unknown | Jerry risk | Generic indoor | Named venues |
| 低體力方案 | thin | 1+ | 1 | Low | unknown | feet_tire_easily | No walking meters | Compare diagrams |
| 住宿區域 | scores + A2 | 1+ | 0 | Medium | needs_recheck | Clean lodging | Hotel unchosen | Area shortlist |
| 機場進市區 | A1 airports | maps | 0 | Medium | needs_recheck | Jerry transit | Mode depends D1/D3 | Transfer Compare card |

## Busan

| Topic | Official A1/A2 | Indep. B | Creator C | Confidence | Ops freshness | Personalization | Unresolved gaps | Next action |
|-------|----------------:|---------:|----------:|------------|---------------|-----------------|-----------------|-------------|
| 海雲台 | A1/A2 | 1+ | 1+ | Medium | needs_recheck | Beach/scenery | March facilities | Climate + layers note |
| 廣安里 | A2 | 1 | 1 | Medium | needs_recheck | Night photos | Seafood trap | Keep droppable |
| 青沙浦 | A2 | 1 | 1 | Medium | needs_recheck | Capsule adjacency | Fatigue | Compare vs Haeundae-only |
| 尾浦 | A2 | 1 | 0 | Low | unknown | Connector | Thin | Optional only |
| 海岸／膠囊列車 | A1 operator + A2 | 2 | 0 | Medium | needs_recheck | Photo value | Hours/queue/price | Harden via rs-028 |
| 豬肉湯飯 | A2 explainers | Michelin+ | 0 direct | Medium | needs_recheck | Nikita food | No locked shop | Round 2 food slice |
| 市場 | A2 | 1 | 1 | Low | needs_recheck | Food/shopping | Shellfish exposure | Brief or skip |
| 海景咖啡 | 0 A1 | 1 | 1+ | Low | unknown | Rain/low-energy | Unverified cafes | Pick 2 with hours |
| 夜景 | A2 | 1 | 1 | Medium | unknown | Couple photos | Wind/tiredness | Optional evening |
| 雨天方案 | thin | 1 | 0 | Low | unknown | Weather | Generic | Name venues |
| 低體力方案 | thin | 1+ | 1 | Low | unknown | Jerry pacing | Variant missing | Claim clm-day6-low-energy |
| 住宿區域 | A2 + scores | 1+ | 0 | Medium | needs_recheck | Comfort | Hotel unchosen | Prefer beach-proximal |
| 釜山站 | A1/A2 + maps | maps | 0 | Medium | needs_recheck | KTX arrival | Luggage path | Station card |
| 金海機場 | A1 | 0 | 0 | Medium | needs_recheck | Return logistics | Flight unknown | Buffer bands after D1 |

## Matrix reading for Round 2 slices

1. ~~**Day 4 Feasibility Decision**~~ — **done in Round 2A** (fortune Result B; JYP Remove)  
2. ~~**Nikita Shopping Teaching Slice**~~ — Round 2B in progress — Day 3 path (`clm-day3-shopping-path-thin`)  
3. **Busan Food & Coastal Rhythm** — pork soup + Day 6 low-energy (`clm-pork-soup-shortlist-incomplete`, `clm-day6-low-energy-variant-missing`, `clm-sky-capsule-ops-unconfirmed`)  
