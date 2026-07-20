# Lodging area scoring model

**Status:** Provisional · **Machine source:** [data/lodging-area-scores.yaml](../data/lodging-area-scores.yaml)  
**Depends on:** D2 Confirmed `seoul-4n-busan-2n` · D3 Provisional `D3-B` (TPE→ICN / PUS→TPE + KTX)  
**Updated:** 2026-07-20

No hotel names, no date-priced rates, no booking links in this phase.

## Method

- Scale **1–5** (5 = best fit for this trip’s constraints).
- Each cell: **Fact** | **Inference** | **Assumption** + rationale + `source_ids`.
- **Null score** = dimension not applicable (e.g. beach score in Seoul).
- Regenerate YAML from maintainer script: `npx tsx scripts/generate-lodging-area-scores.ts` (deterministic seed).

## Dimensions (14)

| ID | 中文 |
|----|------|
| icn_arrival | ICN 抵達後進城便利性 |
| seoul_days1_4_transit | 前四晚首爾行程平均交通成本 |
| ktx_seoul_station | 前往 Seoul Station 搭 KTX 便利性 |
| pus_departure | PUS 離境便利性 |
| pork_soup_food | 豬肉湯飯與日常餐飲密度 |
| beach_scenery | 海灘／海景可達性 |
| shopping | 購物、化妝品、服飾便利性 |
| evening_safety | 晚間安全與回住宿便利性 |
| walking_elevator | 步行量、坡度、轉乘與電梯風險 |
| room_couple_supply | 房間大小與雙人住宿供給 |
| noise | 噪音風險 |
| convenience_breakfast | 便利商店與早餐取得 |
| luggage_movement | 行李移動成本 |
| schedule_0900_2100 | 對 09:00–21:00 作息適配 |

## Seoul areas scored

- Myeongdong / Euljiro  
- Hongdae  
- Jongno / Insadong  
- Gangnam *(included: itinerary Day 4 evidence)*

## Busan areas scored

- Seomyeon  
- Haeundae  
- Gwangalli  
- Busan Station / Nampo *(conditional: KTX / transit evidence)*

## Provisional recommendation (areas only)

| City | Primary | Backup | Rationale (short) |
|------|---------|--------|-------------------|
| Seoul (4N) | **Jongno / Insadong** | Myeongdong / Euljiro | Best average fit for Day 2 palace/hanbok + acceptable Day 3 shopping hop + KTX day |
| Busan (2N) | **Haeundae** | Seomyeon | Day 6 beach-first; PUS departure with buffer (not ticket-verified) |

See YAML for per-dimension scores and epistemic tags.

## CI

- Schema: `schemas/lodging-area-scores.json`
- `npm run check:lodging-scores` — dimension completeness + source refs

## Next (not this PR)

After D1 + D3 ticket verification: refine PUS buffer scores, then **area shortlist** (still no hotel names until booking phase).
