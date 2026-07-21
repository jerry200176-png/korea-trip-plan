# Source Quality Rubric

**Updated:** 2026-07-20

## Tier assignment

| Tier | Who | Can confirm operational facts? | Typical use |
|------|-----|--------------------------------|-------------|
| A1 | Government, operators, venue/shop primary pages | Yes (preferred) | Hours, tickets, transit, entry, rules |
| A2 | Official tourism portals / aggregators | Partial — orient only until A1 corroboration | Official summaries, discovery into A1 |
| B | Independent experience, maps, trusted editorial | No (signal only) | Queue, walking, vibe, trap risk |
| C | Creators / social / discovery blogs | No | Candidates, angles, atmosphere |

Anti-padding rules:

- Design/publication benchmarks use `primary_category: design_publication_benchmark`  
- Map ping/search pages use `map_validation_endpoint`  
- Do not count benchmarks inside travel factual depth  
- Do not mark freshness `current` from HTTP 200 alone  

## Scoring checklist (per source)

Score each dimension 0–2 (0 = weak, 2 = strong). Prefer sources with total ≥ 8 for retention in the matrix “high confidence” cells.

| Dimension | 0 | 1 | 2 |
|-----------|---|---|---|
| Identity | Anonymous / unclear | Named creator, unclear org | Clear official or known publisher |
| Access | Blocked / paywalled unread | Partial page | Full public page reviewed |
| Freshness | Unknown / years old | Dated but aging | Recent or continuously updated |
| Specificity | Vague listicle | Some place detail | Actionable location / process detail |
| Bias | Heavy promo / affiliate-first | Mild sponsorship risk | Low commercial bias |
| Corroboration | Alone | Soft match elsewhere | Explicit second source available |
| Couple relevance | Generic Korea | Partial Jerry or Nikita fit | Direct profile linkage |

## Rejection rules

Reject (or demote to blocked) if:

- Content was not actually accessible  
- Source is pure SEO scrapes with no author/date  
- Source invents ticket prices without citing operators  
- Source requires copying long copyrighted text to be useful  

## Brand / copyright boundary

- Facts and short paraphrases: OK with citation  
- Long quotes, full transcripts, post dumps: forbidden  
- Images: never hotlink or download without license path (see COPYRIGHT_AND_MEDIA_RESEARCH_RULES)  
- Do not copy competitor brand systems or UI chrome  

## Jerry & Nikita filters

When ranking otherwise equal sources, prefer those that help:

- Jerry: transfer friction, risk, pacing, rationale  
- Nikita: GOT7 light touch, beach/scenery, cosmetics/clothes, hanbok, fortune-telling, pork soup rice, comfortable lodging  
- Shared: first overseas trip success, couple photos / instant camera  
