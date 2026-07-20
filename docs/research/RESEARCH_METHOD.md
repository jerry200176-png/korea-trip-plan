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

### Tier A — Primary / official

Confirm only with Tier A (or two independent Tier A):

- Open / closed status  
- Hours, closed days  
- Tickets / prices  
- Reservations  
- Transit / schedules  
- Official events  
- Regulations, entry, baggage  

Examples: government portals, airports, Korail, venue official sites, VisitKorea / VisitSeoul / VisitBusan city pages.

### Tier B — Aggregated experience

Use for understanding (never sole confirmation of prices/hours/schedules):

- Queues, walking load, on-site flow  
- Dwell time, crowding, photo conditions  
- Rain-day feel, tourist-trap risk  

Examples: Michelin / reputable guides, independent local blogs with first-person experience, map-platform reviews used only as signals.

### Tier C — Creator discovery

Use for discovery and atmosphere:

- YouTube, Instagram, Threads, TikTok  
- Taiwan / Korea / English blogs  
- Travel media, local lifestyle content  

Allowed uses: candidate places, photo angles, vibe, hidden flows, queue warnings.  
**Forbidden:** Tier C alone confirming price, hours, schedules, regulations, or “still open.”

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
