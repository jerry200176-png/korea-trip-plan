# Food Atlas Independent Critic — Personalized Korea Food Atlas Slice

**PR branch:** `cursor/textbook-food-atlas-e48c`  
**Critic context:** fresh-context subagent (not PR author)  
**Reviewed head:** `340e856c80c66d464134e50aa55c04cbdddbcdb3`  
**Verdict:** **PASS**

## Critics

| Critic | Verdict |
|--------|---------|
| Research | PASS |
| Factual Trust | PASS |
| Personalization | PASS |
| Mobile UX | PASS |
| Publication | PASS |

## Blockers

None. Soft residuals only (non-blocking).

## Soft residuals (non-blocking)

- `/phrases/` lists alcohol + crustacean + `돼지국밥` but omits `새우젓 빼주세요` and bones/organ lines that live on the order-card diagram / `/food/` / handbook — discoverability gap, not a missing Atlas deliverable.
- `/food/` teaching figures use `.media-block` (same pattern as `/transport/`); with `height: auto` they do not crop, but Day pages already use safer `.day-visual-diagram` (`object-fit: contain`).
- Licensed close-up Identify photos per dish family remain `missing_evidence` on `clm-food-atlas-identify-order` — diagrams + Unsplash street-food mood photo only; acceptable for slice exit.

## Squash-merge under autonomous policy

Allowed when GitHub CI is green and PR is mergeable with no blocking review threads.

## Outcome confirmed

### Research Critic

- VisitKorea dwaejigukbap authorities `rs-104` / `rs-105` (A2) + Michelin how-to `rs-106` (B, discovery/supporting for queue) with `checked_at: 2026-07-21` and revalidate windows.
- Claims `clm-food-atlas-identify-order` and `clm-food-queue-alt-and-rain` use role-split fields; Michelin stays appropriately non-operator.
- Decision surface `docs/research/FOOD_ATLAS.md` + Decision Log entry; pork shortlist retained from Round 2C without inventing hours/bookings.

### Factual Trust Critic

- **No AI photoreal food pretending to be real dishes as evidence.** Six assets are original SVG teaching diagrams (`generation_tool: null`); mood photo `seoul-street-food` is Unsplash-licensed with purpose_note “非特定餐廳證據”.
- Crustacean / salted-shrimp **Warn** wired on diagram + `/food/` + handbook: always ask; **cannot guarantee zero** / 不得宣稱完全無甲殼類 — no zero-allergen kitchen claim.
- Shop list framed as shortlist / Provisional, not locked bookings.

### Personalization Critic

- Couple hard rules on hub + handbook: no alcohol, avoid crustacean-led, bones/organ preference, ~1h queue skip, no cross-town when tired.
- **Order phrases present** on `food-order-korean-cards` (five Explain cards including `새우젓 빼주세요`) and mirrored in emergency `phrases_ko.no_alcohol` / `no_crustaceans`; pork shortlist order lines in `restaurants.yaml`.
- Queue/alt + rain backup diagram aligns with Low-Energy / feet-tired preference.

### Mobile UX Critic

- Six diagrams + prior pork card registered and wired on `/food/` (`food-identify-cards`, `food-order-korean-cards`, `food-crustacean-shrimp-warn`, `food-bbq-cuts-compare`, `food-market-snack-identify`, `food-queue-or-alt-decision`); `media/` ↔ `site/public/media/` byte-identical.
- `/food/` in `scripts/mobile-smoke.ts` and `scripts/capture-visual.ts`.
- Spot-check: no raw `rs-*` IDs on `food.astro`.

### Publication Critic

- Handbook `handbook/food.md` updated; status Teaching Provisional / **not** Booking Ready on research doc + Decision Log.
- Emergency dietary Korean lines already published; Atlas does not claim Final Acceptance.

### Registry / scorecard verification

| Check | Result |
|-------|--------|
| Six food diagrams under `media/diagrams/` and `site/public/media/` (byte-identical) | PASS |
| Registered in `data/media.yaml` with purpose_note / alt / checked_at | PASS |
| Scorecard overall **85**; `score_deltas_food_atlas_2026_07_21` 81→85 with evidence | PASS |
| `textbook_final_exit_met: false` / gate `met: false` | PASS |
| No Booking Ready / Final approved product claims | PASS |
| `p0_open: []` | PASS |
| `npm run check:control-state` | PASS |

## VERDICT

**PASS** — Food Atlas slice exit met; soft residuals only; do not treat as Textbook Final Exit.
