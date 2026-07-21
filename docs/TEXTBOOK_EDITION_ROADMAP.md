# Textbook Edition Roadmap

**Updated:** 2026-07-21 (State Integrity Sync)  
**Gate closed:** PR #10 merged at `b907145`  
**Round 1:** PR #12 merged — Round 1 Acceptance **PASS**  
**Round 2 + Day 2 teaching:** PR #13–#16 squash-merged on main (`702c911`)  
**Epic:** [#11](https://github.com/jerry200176-png/korea-trip-plan/issues/11)  
**Scorecard:** Overall **72 / 100** — Textbook Final Exit **not** met  
**Next Top 3:** Transport Textbook Slice · Food Atlas Slice · Before-Trip Textbook Slice

## Round 1 outcome

Establish the research, personalization, visual-candidate, and critique loop that can support a textbook-grade product — and honestly measure how under-researched the current 7-day plan still is.

Round 1 does **not** rewrite the formal itinerary, import a large media atlas, or rebuild the public site/PDF.

---

## Answers required by Round 1

### 1. Which current itinerary parts lack research?

- Hanbok shop (Day 2) — **shortlist teaching closed in PR #16**; T-14 shop lock still open  
- Fortune-telling shop (Day 4) — **Result B Optional/T-14 (PR #13)**; Core shop not locked  
- Specific cosmetics/clothes stores + tax refund path (Day 3) — **teaching path closed in PR #14**  
- Locked pork-soup restaurant (Days 5–6) — **named shortlist in PR #15**; not booking-locked  
- Day 7 value bands without a flight time  
- Rain venue names (still generic)  
- Walking-meter / transfer counts for most days  

### 2. Which sights may exist mainly because they are popular?

- Myeongdong as the default shopping answer  
- Haeundae + Gwangalli postcard pairing  
- JYP exterior check-in as a GOT7 proxy without proven visit value — **removed from Core (PR #13)**  

### 3. Which Jerry preferences are underserved?

- Sufficient research & choice rationale on several stops  
- Transfer minimization evidence (station choice, Seongsu temptation) — **Transport slice next**  
- Risk foresight (queue, Tuesday palace, March beach weather)  
- Not sacrificing the day for low-value check-ins (JYP removed from Core)  

### 4. Which Nikita preferences are underserved?

- Executable cosmetics/clothes path — **Day 3 teaching present**  
- Feasible Korean fortune-telling — **Optional/T-14, not Core**  
- GOT7 experience with real value — **theme retained; HQ visit not Core**  
- Authentic pork soup with dietary-safe framing — **shortlist + ask rules**  
- Clean lodging still not selected (area scores only)  

### 5. Which pages have too few images?

- `/today/*` execution pages  
- `/food/`, `/shopping/`, `/before/`, `/packing/`  
- Day 7 content surfaces  
- Teaching diagrams improved for Days 2–4 and 6; Transport/Food Atlas still thin  

### 6. Which images are mostly decorative?

- `shopping-atmosphere` abstract bottles  
- `seoul-street-food` mood shot without dish identity  
- Chapter AI art (valid Inspire, but not teaching)  

### 7. Which pages still feel like templates or work reports?

- Day 7 near-empty pending flights  
- Some utility pages still lighter than a guidebook chapter  
- Residual risk if maintainer language regresses into public nav  

### 8. What can still be finished while D1 dates are open?

- Couple profile & recommendation rules  
- Source registry + coverage matrix upkeep  
- Shop/restaurant shortlists that are date-agnostic  
- Visual candidates & diagram specs  
- Area comparisons, food Identify cards, packing/phrase teaching  
- Day 7 hour-band playbooks (early/mid/late departure)  
- **Transport / Food Atlas / Before-Trip textbooks**  

### 9. What must wait for dates?

- Palace closed-day alignment  
- Exact flight buffers and airport-day value  
- Seasonal beach facility claims for the precise week  
- Final booking holds and some ticket prices  

### 10. Round 2 boundary — completed as separate PRs (no mega-PR)

Round 1 Acceptance passed before Round 2 product slices. Round 2 was **not** one large PR:

| # | Slice PR | Status |
|---|----------|--------|
| 1 | **Day 4 Feasibility Decision** — PR [#13](https://github.com/jerry200176-png/korea-trip-plan/pull/13) | **merged** — fortune Result B + JYP Remove |
| 2 | **Nikita Shopping Teaching Slice** — PR [#14](https://github.com/jerry200176-png/korea-trip-plan/pull/14) | **merged** |
| 3 | **Busan Food & Coastal Rhythm** — PR [#15](https://github.com/jerry200176-png/korea-trip-plan/pull/15) | **merged** |
| + | **Day 2 Hanbok & Palace Teaching** — PR [#16](https://github.com/jerry200176-png/korea-trip-plan/pull/16) | **merged** at `702c911` |

Each slice used **Round 2 Slice Exit** (local), not **Textbook Final Exit** (Overall ≥ 90).

Claim anchors: `clm-fortune-shop-missing`, `clm-jyp-visit-value-unproven`, `clm-day3-shopping-path-thin`, `clm-pork-soup-shortlist-incomplete`, `clm-day6-low-energy-variant-missing`, `clm-sky-capsule-ops-unconfirmed`, Day 2 hanbok claims in `claim-evidence-map.yaml`.

---

## Delivery sequence

1. Research Foundation ← Round 1 PR #12 — **done** (Acceptance PASS)  
2. Round 2 slices + Day 2 teaching (PR #13–#16) — **done**  
3. **Transport Textbook Slice** ← next  
4. **Food Atlas Slice**  
5. **Before-Trip Textbook Slice**  
6. Re-score → further Top 3 (Photo & Memory / IA / PDF / offline / a11y / …) until Textbook Final Exit  
7. `FINAL_ACCEPTANCE_PACKET.md` → READY FOR JERRY & NIKITA ACCEPTANCE (only after Final Exit)  

## Non-goals reminding all rounds

- No invented preferences  
- No bulk unlicensed media  
- No AI art as place evidence  
- No self-merge  
- CI green ≠ textbook done  
- Do not demand Overall ≥ 90 to close a slice  
- Do not claim Booking Ready / Final approved / Jerry & Nikita accepted early  
