# Research Method

## Evidence first

Any fact that affects real travel must record:

1. Source URL  
2. Source name  
3. `checked_at` date (ISO)  
4. Credibility tier  
5. Status: `Confirmed` | `Provisional` | `Assumption` | `DecisionRequired` | `Stale`

Register sources in [`data/sources.yaml`](../data/sources.yaml) and summarize in [SOURCE_REGISTRY.md](SOURCE_REGISTRY.md).

## Source priority

1. Korean government, foreign missions, airports, airlines  
2. Official rail / metro / bus / venue / shop sites  
3. Naver Map, Kakao Map, official social accounts  
4. Reputable travel platforms (supplement only)  
5. Blogs / short video — inspiration only, never sole factual source  

## Freshness thresholds

| Category | Warn if older than | Action before trip |
|----------|--------------------|--------------------|
| Entry rules, flights, transit regulations | 90 days | Re-check |
| Place / restaurant hours & prices | 60 days | Re-check |
| All places on the live itinerary | — | Full re-verify at T-30 |
| Hours, weather, transit, bookings | — | Final pass at T-7 |

## Writing rules

- Do not present guesses as facts.  
- Prefer “unknown / needs re-check” over fabricated hours.  
- Mark blog-derived tips as `Provisional` and seek an official corroboration.  
- Never spend money, create external accounts, or submit personal data while researching.

## Status definitions

| Status | Meaning |
|--------|---------|
| Confirmed | Backed by official or high-credibility source, currently in date |
| Provisional | Best current plan; not booked or not fully verified |
| Assumption | Temporary working hypothesis |
| DecisionRequired | Waiting on Founder |
| Stale | Past freshness threshold; must re-query before use |
