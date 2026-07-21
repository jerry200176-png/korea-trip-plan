# Round 1 Evidence Sheet

> **Status (2026-07-21):** Historical Round 1 packet. Round 1 Acceptance **PASS**. PR #12 **merged**.  
> Round 2A–2C + Day 2 teaching **merged** (PR #13–#16). Overall **72 / 100**. Textbook Final Exit **not** met.  
> Do **not** treat the “Do not merge / Do not start Round 2” lines below as current control state.

**Branch (historical):** `feat/korea-trip-textbook-edition`  
**Draft PR (historical):** https://github.com/jerry200176-png/korea-trip-plan/pull/12 — now merged  
**Base main verified (at Round 1):** `b907145d2b677fd6328cb0a4f0eb9601af76a858`  
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

### Governance blockers addressed

1. `check:research-registry` integrity gate wired into `npm run ci`
2. Claim map role split (supporting / discovery / blocked / contradicting / missing)
3. **Freshness negative-gate (final blocker):**
   - every usable source has `freshness_basis_type`
   - `current` only with `dated_official_notice` | `operator_live_data` | `direct_provider_confirmation` + valid dates + readable source
   - forbidden reachability phrases cannot justify `current`
   - formal fixtures via `npm run test:research-registry` (10 negative + 3 positive + live)
   - TypeScript validator and Python twin share the same semantics

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
- `p0_open` — empty after Round 2A closed `p0-fortune-shop` (historical Round 1 sheet listed only that P0)  
- `founder_decision_dependencies` — `dep-d1-dates` (does not block Round 2 research)  
- Honest overall score at Round 1 close: **48 / 100** (later Round 2 + Day 2 teaching raised main to **72 / 100** without claiming Final Exit)

### Round 1 Acceptance judgment (agent self-check)

| Check | Status |
|-------|--------|
| Required docs exist | PASS |
| Source counts recomputable | PASS |
| No category padding | PASS |
| Freshness semantics correct | PASS |
| Top 3 gaps have claim map | PASS |
| Scope not expanded | PASS |
| Independent AI / Jerry review | **PASS** (governance critic; Acceptance recorded on scorecard) |

**Verdict (historical at draft time):** Ready for Jerry independent review toward Round 1 Acceptance.  
**Current (2026-07-21):** Round 1 Acceptance **met**. Round 2 + Day 2 slices **merged**.  
**Not** Textbook Final Exit.  
**Superseded instruction:** ~~Do not merge. Do not start Round 2 implementation.~~

### Round 2 planned slices (now complete)

1. Day 4 Feasibility Decision — **merged** PR #13  
2. Nikita Shopping Teaching Slice — **merged** PR #14  
3. Busan Food & Coastal Rhythm — **merged** PR #15  
4. Day 2 Hanbok & Palace Teaching — **merged** PR #16  

**Next Top 3:** Transport · Food Atlas · Before-Trip  
