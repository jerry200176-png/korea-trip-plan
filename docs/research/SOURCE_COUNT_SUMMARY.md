# Source Count Summary

Generated: 2026-07-20  
Quality correction: 2026-07-20  
Inventory: [`data/research-sources.yaml`](../../data/research-sources.yaml)  
Recount: `python3 scripts/recount-research-sources.py`

## Counting rules

- Every usable source has exactly one `primary_category` (unique primary count).
- `category_tags` may list secondary roles, but **must not** inflate travel evidence depth.
- Design / publication benchmarks are **not** counted as travel factual evidence.
- Map validation endpoints are counted separately from experience evidence.
- `operational_freshness: current` is **not** assigned from HTTP 200 / title presence alone.
- When page update date is unconfirmed: `content_last_updated: unknown`.

## Primary category table (unique)

| Primary category | Count |
|------------------|------:|
| travel factual evidence | 40 |
| independent experience evidence | 20 |
| creator discovery | 12 |
| map validation endpoints | 4 |
| design / publication benchmarks | 10 |
| **Usable total (sum of unique primaries)** | **86** |
| blocked sources | 9 |

Do **not** collapse the above into a single “76/86 usable sources” travel-depth claim. Travel factual depth is **40**, not 86.

## Evidence tier (A1 / A2 / B / C)

| Tier | Meaning | Count |
|------|---------|------:|
| A1 | Government, operator, venue/shop primary pages | 15 |
| A2 | Official tourism portals / official aggregator pages | 25 |
| B | Independent experience, map platforms, trusted editorial, design benchmarks | 34 |
| C | Creator discovery | 12 |

Official tourism (A2) must **not** be treated as automatic latest venue-operator proof. Prefer A1 for hours/tickets/closure when hardening itinerary claims.

## Freshness distribution

| Field / value | Count |
|---------------|------:|
| `content_last_updated: unknown` | 86 |
| `operational_freshness: needs_recheck` | 64 |
| `operational_freshness: unknown` | 22 |
| `operational_freshness: current` | 0 |

## City distribution (usable sources)

| City | Count |
|------|------:|
| Busan | 37 |
| Seoul | 33 |
| Multi | 8 |
| National | 6 |
| Taiwan | 2 |

## Tier C diversity (honest)

| Metric | Count |
|--------|------:|
| direct YouTube sources readable | 0 |
| direct Instagram sources readable | 0 |
| blog sources readable | 12 |
| blocked creator sources | 2 |

Round 1 does **not** pad Tier C with unread videos/posts. Search snippets are not full reviews.

## Blocked sources

- Total blocked / unavailable candidates: **9**
- Includes HTTP 403/404/429/000 failures and creator-platform sessions that were not fully readable
- See `blocked_sources` in `data/research-sources.yaml`
