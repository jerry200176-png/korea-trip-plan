# Textbook Edition Roadmap

**Round:** 1 Research Foundation · Quality correction 2026-07-20  
**Gate closed:** PR #10 merged at `b907145`  
**Draft PR:** [#12](https://github.com/jerry200176-png/korea-trip-plan/pull/12) — do not merge; Round 2 implementation not started  
**Epic:** [#11](https://github.com/jerry200176-png/korea-trip-plan/issues/11)

## Round 1 outcome

Establish the research, personalization, visual-candidate, and critique loop that can support a textbook-grade product — and honestly measure how under-researched the current 7-day plan still is.

Round 1 does **not** rewrite the formal itinerary, import a large media atlas, or rebuild the public site/PDF.

---

## Answers required by Round 1

### 1. Which current itinerary parts lack research?

- Hanbok shop (Day 2)  
- Fortune-telling shop (Day 4)  
- Specific cosmetics/clothes stores + tax refund path (Day 3)  
- Locked pork-soup restaurant (Days 5–6)  
- Day 7 value bands without a flight time  
- Rain venue names (still generic)  
- Walking-meter / transfer counts for most days  

### 2. Which sights may exist mainly because they are popular?

- Myeongdong as the default shopping answer  
- Haeundae + Gwangalli postcard pairing  
- JYP exterior check-in as a GOT7 proxy without proven visit value  

### 3. Which Jerry preferences are underserved?

- Sufficient research & choice rationale on several stops  
- Transfer minimization evidence (station choice, Seongsu temptation)  
- Risk foresight (queue, Tuesday palace, March beach weather)  
- Not sacrificing the day for low-value check-ins (JYP pending)  

### 4. Which Nikita preferences are underserved?

- Executable cosmetics/clothes path  
- Feasible Korean fortune-telling  
- GOT7 experience with real value  
- Authentic pork soup with dietary-safe framing  
- Clean lodging still not selected (area scores only)  

### 5. Which pages have too few images?

- `/today/*` execution pages  
- `/food/`, `/shopping/`, `/before/`, `/packing/`  
- Day 3 / Day 4 / Day 7 content surfaces  
- Teaching diagrams everywhere (currently near-zero)  

### 6. Which images are mostly decorative?

- `shopping-atmosphere` abstract bottles  
- `seoul-street-food` mood shot without dish identity  
- Chapter AI art (valid Inspire, but not teaching)  

### 7. Which pages still feel like templates or work reports?

- Thin Day 4 (theme without vendors)  
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

### 9. What must wait for dates?

- Palace closed-day alignment  
- Exact flight buffers and airport-day value  
- Seasonal beach facility claims for the precise week  
- Final booking holds and some ticket prices  

### 10. Round 2 boundary — three separate PRs (no mega-PR)

Round 2 implementation must **not** start until Jerry accepts Round 1.  
Round 2 is **not** one large PR. Split into:

| # | Slice PR | Must include |
|---|----------|--------------|
| 1 | **Day 4 Feasibility Decision** | fortune feasibility evidence; JYP retain/replace; personalized rationale; ≥1 functional diagram; independent critic; no self-merge |
| 2 | **Nikita Shopping Teaching Slice** | cosmetics/clothes path; tax-refund teaching; rationale; ≥1 diagram; independent critic; no self-merge |
| 3 | **Busan Food & Coastal Rhythm** | pork-soup shortlist; Day 6 low-energy coastal variant; rationale; ≥1 diagram; independent critic; no self-merge |

Each slice uses **Round 2 Slice Exit** (local), not **Textbook Final Exit** (Overall ≥ 90).

Claim anchors already mapped: `clm-fortune-shop-missing`, `clm-jyp-visit-value-unproven`, `clm-day3-shopping-path-thin`, `clm-pork-soup-shortlist-incomplete`, `clm-day6-low-energy-variant-missing`, `clm-sky-capsule-ops-unconfirmed`.

---

## Delivery sequence (later rounds)

1. Research Foundation ← Round 1 PR #12 (Draft; quality correction in progress)  
2. Round 2 slices (three PRs above) — after Round 1 Acceptance  
3. Personalized Itinerary Model  
4. Visual Media Atlas (licensed, function-tagged)  
5. Editorial Website Architecture  
6. Textbook PDF Edition  
7. Independent Quality Review → Textbook Final Exit  

## Non-goals reminding all rounds

- No invented preferences  
- No bulk unlicensed media  
- No AI art as place evidence  
- No self-merge  
- CI green ≠ textbook done  
- Do not demand Overall ≥ 90 to close a Round 2 slice  
