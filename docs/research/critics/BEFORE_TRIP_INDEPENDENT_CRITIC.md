# Before-Trip Independent Critic — Korea Before-Trip Preparation Slice

**PR branch:** `cursor/textbook-before-trip-e48c`  
**Critic context:** fresh-context subagent (not PR author)  
**Reviewed head:** `d8f0af3f1fc74467defd479da808b893e2d01a10`  
**Verdict:** **FAIL**

## Critics

| Critic | Verdict |
|--------|---------|
| Research | PASS |
| Factual Trust | PASS |
| Personalization | PASS |
| Mobile UX | FAIL |
| Publication | PASS |

## Blockers

1. **All five Before-Trip teaching SVGs ship with corrupted CJK text** (`nul` bytes / mojibake in `<text>` nodes). Prior Transport/Food diagrams retain intact Chinese; these do not. English structure labels (`Date Pending`, `Airline-dependent`, `T-90`, `Power bank`, `eSIM`) survive, but on-diagram Chinese teaching is unreadable on `/before/` and `/packing/`.
   - Assets: `before-trip-timeline.svg`, `packing-luggage-decision.svg`, `march-2027-layers-pack.svg`, `sim-esim-powerbank-card.svg`, `offline-docs-checklist.svg` (and byte-identical `site/public/media/` copies).

## Soft residuals (non-blocking)

- Claim `clm-before-trip-conditional-checklist` supports only via reused `rs-009` (KMA) + `rs-098` (VisitKorea T-money); no new dedicated SIM/card/insurance/baggage sources — acceptable because missing airline/bank pages are listed under `missing_evidence_requirements`, but research is thinner than Transport/Food Atlas slices.
- `handbook/weather.md` not touched this PR despite research doc naming weather handbook; March layering lives on `/packing/` + existing weather note.
- `/before/` and `/packing/` figures use `.media-block` (same as `/food/` / `/transport/`); Day pages still use safer `.day-visual-diagram`.

## Squash-merge under autonomous policy

**Not allowed** until Mobile UX blocker is fixed (re-encode / regenerate five SVGs with intact UTF-8 CJK, keep media↔public byte-identical, re-check `/before/` + `/packing/`). Then re-run this critic.

## Outcome confirmed

### Research Critic — PASS

- Decision surface `docs/research/BEFORE_TRIP_TEXTBOOK.md` + Decision Log entry; modules cover luggage, March layers, SIM/power-bank, cards, cash/DCC, insurance, passport, meds, instant camera, dual-phone, T-90…T-1 bands, rain/cold, offline docs.
- Claim `clm-before-trip-conditional-checklist` role-split present; `requires_revalidation: true`; missing airline baggage/battery + bank fee re-read honestly recorded.
- Timeline hardened in `data/timeline.yaml` with conditional / official-check language.

### Factual Trust Critic — PASS

- **Conditional Date Pending:** research doc lists flight buffers, hotel KO addresses, KTX, hanbok/fortune T-14, airline packing weights; timeline + `/before/` copy frame unlocked D1/airline/lodging as conditional; timeline diagram embeds `Date Pending` markers.
- **No invented cashback:** `/before/`, timeline task, handbook, media `desc`/notes, and research doc all refuse fixed 回饋％ / cashback rates; point to Taishin/Fubon official pages only.
- **Airline-dependent baggage/battery:** packing + before page copy; luggage + SIM/power-bank diagrams carry `Airline-dependent` / airline-dependent battery framing; no fixed cm/kg invented.

### Personalization Critic — PASS

- First-abroad checklist clarity (`/before/` hero + T-bands).
- Couple packing: dual-phone hotspot/test, instant camera + film, March layers + Busan coast wind, meds, offline emergency docs.
- Card principles without benefit invention match Jerry risk foresight / Nikita packing comfort notes on the claim.

### Mobile UX Critic — FAIL

- Diagrams are registered and wired: `/before/` → timeline + SIM/power-bank + offline docs; `/packing/` → luggage + March layers + SIM/power-bank; `media/` ↔ `site/public/media/` byte-identical; `scripts/mobile-smoke.ts` + `scripts/capture-visual.ts` include both paths; no raw `rs-*` on pages.
- **Blocker:** CJK corruption on all five slice SVGs makes the primary teaching visuals fail for the Chinese-first reader even though surrounding Astro prose is intact.

### Publication Critic — PASS

- Status Teaching Provisional / **not** Booking Ready on research doc + Decision Log.
- Scorecard `textbook_final_exit_met: false`, gate `met: false`; loop doc Overall **87** and “do not emit READY / Final approved”.
- Handbook connectivity/payments updated with explicit no-cashback discipline.
- `npm run check:control-state` OK; `p0_open: []`.

### Registry / scorecard verification

| Check | Result |
|-------|--------|
| Conditional Date Pending items (doc + timeline + diagram markers + page framing) | PASS |
| No invented cashback rates | PASS |
| Airline-dependent baggage/battery notes | PASS |
| Diagrams wired on `/before/` and `/packing/` (registered, byte-identical) | PASS |
| Diagram CJK text intact / readable | **FAIL** |
| Scorecard overall **87**; research_depth **18**; personalization **18**; delta 85→87 documented | PASS |
| `textbook_final_exit_met: false` / gate `met: false` | PASS |
| No Booking Ready / Final approved product claims | PASS |
| `p0_open: []` | PASS |
| `npm run check:control-state` | PASS |

## VERDICT

**FAIL** — Research, Factual Trust, Personalization, and Publication meet slice exit; **Mobile UX blocked** by corrupted CJK in all five Before-Trip teaching SVGs. Do not treat as Textbook Final Exit (Overall 87; Final Exit false). Fix diagrams, then re-critic.
