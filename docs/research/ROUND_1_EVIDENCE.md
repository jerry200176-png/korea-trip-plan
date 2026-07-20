# Round 1 Evidence Sheet

**Branch:** `feat/korea-trip-textbook-edition`  
**Draft PR:** https://github.com/jerry200176-png/korea-trip-plan/pull/12  
**Base main verified:** `b907145d2b677fd6328cb0a4f0eb9601af76a858`  
**Quality correction date:** 2026-07-20

## Phase A (prerequisite — closed on main)

| Item | Result |
|------|--------|
| PR #10 | Merged squash |
| Merge commit | `b907145d2b677fd6328cb0a4f0eb9601af76a858` |
| main CI + Pages | success; deploy SHA matches main |
| Live checks | Jerry & Nikita; JYP 周邊打卡; zero `plc-jyp-tower`; zero「Jerry 與女友」 |

Epic #11 write attempts returned 403 for this bot token — paste gate-close text manually if needed.

## Round 1 Research Quality Correction + governance blocker fixes

Scope: **research governance only** — no itinerary / site / PDF / media product changes.

### Governance blockers addressed (post independent review FAIL)

1. `check:research-registry` integrity gate (unique IDs, required freshness fields, A1/A2/B/C only, blocked/usable overlap, tier sum = usable total, HTTP-alone `current` fails, claim ID roles validated) wired into `npm run ci`
2. Claim map role split: `supporting_source_ids` / `discovery_source_ids` / `blocked_source_ids` / `contradicting_source_ids` / `missing_evidence_requirements` — blocked IDs cannot sit in supporting or raise confidence

### Corrected source count table (unique primary)

| Primary category | Count |
|------------------|------:|
| travel factual evidence | 40 |
| independent experience evidence | 20 |
| creator discovery | 12 |
| map validation endpoints | 4 |
| design / publication benchmarks | 10 |
| usable total | 86 |
| blocked sources | 9 |

Recount: `python3 scripts/recount-research-sources.py`

### Tier distribution

| Tier | Count |
|------|------:|
| A1 | 15 |
| A2 | 25 |
| B | 34 |
| C | 12 |

### Freshness distribution

| Value | Count |
|-------|------:|
| content_last_updated unknown | 86 |
| operational_freshness needs_recheck | 64 |
| operational_freshness unknown | 22 |
| operational_freshness current | 0 |

### Tier C diversity

| Metric | Count |
|--------|------:|
| direct YouTube readable | 0 |
| direct Instagram readable | 0 |
| blog readable | 12 |
| blocked creator sources | 2 |

### Claim-level examples

See `data/claim-evidence-map.yaml` — includes palace, hanbok, Day 3 shopping, JYP, fortune (P0), pork soup, Sky Capsule, Day 6 low-energy.

### Scorecard schema (corrected)

- `gates.textbook_final_exit` — Overall ≥ 90 whole-product bar  
- `gates.round_1_acceptance` — research governance checklist  
- `gates.round_2_slice_exit` — per-PR slice exit without requiring 90  
- `p0_open` — only `p0-fortune-shop`  
- `founder_decision_dependencies` — `dep-d1-dates` (does not block Round 2 research)  
- Honest overall score: **48 / 100**

### Round 1 Acceptance judgment (agent self-check)

| Check | Status |
|-------|--------|
| Required docs exist | PASS |
| Source counts recomputable | PASS |
| No category padding | PASS |
| Freshness semantics correct | PASS |
| Top 3 gaps have claim map | PASS |
| Scope not expanded | PASS |
| Independent AI / Jerry review | **PENDING** |

**Verdict:** Ready for Jerry independent review toward Round 1 Acceptance.  
**Not** Textbook Final Exit.  
**Do not merge. Do not start Round 2 implementation.**

### Round 2 planned slices (discussion only)

1. Day 4 Feasibility Decision  
2. Nikita Shopping Teaching Slice  
3. Busan Food & Coastal Rhythm  
