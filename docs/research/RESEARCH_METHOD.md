# Research Method — Textbook Edition

**Round:** 1 · Research Foundation  
**Updated:** 2026-07-20  
**Related:** [SOURCE_QUALITY_RUBRIC.md](./SOURCE_QUALITY_RUBRIC.md), [COPYRIGHT_AND_MEDIA_RESEARCH_RULES.md](./COPYRIGHT_AND_MEDIA_RESEARCH_RULES.md), [`data/research-sources.yaml`](../../data/research-sources.yaml)

This document extends (does not replace) [`docs/RESEARCH_METHOD.md`](../RESEARCH_METHOD.md) for the Textbook Edition loop.

## Purpose

Build a Korea trip product that is:

1. Evidence-backed for operational facts  
2. Personalized to Jerry & Nikita (see [`data/couple-profile.yaml`](../../data/couple-profile.yaml))  
3. Visually instructional, not decorative-only  
4. Honest about gaps when D1 dates / tickets / shops remain open  

## Evidence tiers

### Tier A1 — Operator / government / venue primary

Confirm operational facts with A1 when possible:

- Open / closed status, hours, closed days  
- Tickets / prices, reservations  
- Transit / schedules, baggage, entry rules  
- Venue/shop’s own pages, airport/rail operators, government ministries  

### Tier A2 — Official tourism portals / aggregators

VisitKorea / VisitSeoul / VisitBusan and similar **official tourism entry pages**.

- Useful for orientation and official summaries  
- **Must not** be treated as automatic latest venue-operator proof  
- Harden hours/tickets/closure with A1 (or two independent high-quality sources including A1) before itinerary lock  

### Tier B — Independent experience / maps / trusted editorial

Use for understanding (never sole confirmation of prices/hours/schedules):

- Queues, walking load, on-site flow  
- Dwell time, crowding, photo conditions  
- Rain-day feel, tourist-trap risk  
- Map validation endpoints (separate primary category)  

### Tier C — Creator discovery

Use for discovery and atmosphere only.

Allowed: candidate places, photo angles, vibe, hidden flows, queue warnings.  
**Forbidden:** Tier C alone confirming price, hours, schedules, regulations, or “still open.”  
Do not claim a YouTube/Instagram item was reviewed unless the full public item was actually readable.

## Freshness fields (required per source)

| Field | Meaning |
|-------|---------|
| `accessibility_status` | accessible / blocked / partial |
| `publish_date` | page publish date if known, else null |
| `content_last_updated` | page update date if known, else `unknown` |
| `operational_freshness` | `needs_recheck` / `unknown` / rarely `current` |
| `checked_at` | when we inspected |
| `revalidate_by` | next required revalidation date |
| `freshness_basis` | human-readable why freshness was graded |
| `freshness_basis_type` | typed basis (see below) |

### `freshness_basis_type`

Allowed values:

- `http_reachability_only`
- `page_review_no_update_date`
- `dated_official_notice`
- `operator_live_data`
- `direct_provider_confirmation`
- `unknown`

`operational_freshness: current` is allowed **only** when:

- `freshness_basis_type` ∈ `dated_official_notice` | `operator_live_data` | `direct_provider_confirmation`
- `content_last_updated` is a valid ISO date (not `unknown`)
- `checked_at` and `revalidate_by` are valid ISO dates
- `revalidate_by >= checked_at`
- `freshness_basis` is non-empty
- `accessibility_status: accessible` (fully readable)

These phrases must never justify `current`: HTTP 200 / HTTP 200 OK / curl success / page reachable / title present / search result exists / URL works / content accessible but update date unknown.

Gate + fixtures: `npm run check:research-registry` and `npm run test:research-registry`.

## Primary categories (unique count)

Every source has one `primary_category`:

- `travel_factual_evidence`  
- `independent_experience_evidence`  
- `creator_discovery`  
- `map_validation_endpoint`  
- `design_publication_benchmark`  

Benchmarks must not inflate travel evidence depth. Recount with `python3 scripts/recount-research-sources.py`.

## Research workflow (every claim)

1. State the question in couple-fit terms (which Jerry / Nikita field does this serve?).  
2. Gather sources; grade with the rubric.  
3. Record in `data/research-sources.yaml`.  
4. Mark `claims_requiring_official_verification`.  
5. Prefer “unknown / Research Gap” over invented certainty.  
6. Never spend money, create accounts, or store PII while researching.

## Blocked sources

If Instagram / YouTube / region / robots block access:

- Record under `blocked_sources`  
- Do not guess content  
- Do not claim the source was fully read  
- Find a publicly reachable replacement  

## Freshness

| Category | Warn if older than | Pre-trip action |
|----------|--------------------|-----------------|
| Entry, flights, transit rules | 90 days | Re-check |
| Place / restaurant hours & prices | 60 days | Re-check |
| Live itinerary places | — | Full re-verify at T-30 |
| Hours, weather, transit, bookings | — | Final pass at T-7 |

## Couple-fit rule

Every retained or proposed stop must cite at least one concrete field from `data/couple-profile.yaml`. Popularity alone is not a reason to keep a stop.
