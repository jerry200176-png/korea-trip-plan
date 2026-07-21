# Website IA — Independent Information Architecture Critic

**PR branch:** `cursor/textbook-website-ia-e48c`  
**Reviewed vs:** `origin/main` @ `861ed98`  
**Critic role:** fresh-context IA review (not PR author)  
**Evidence read:** `WEBSITE_IA_DECISION.md`, `SITEMAP_BEFORE_AFTER.md`, `docs/design-proof/discovery/`, `Handbook.astro`, `guides/index.astro`, `index.astro`, `guide-links.ts`, scorecard delta  
**Verdict:** **PASS**

## Acceptance matrix

| # | Criterion | Verdict | Evidence |
|---|-----------|---------|----------|
| 1 | Dock = Home / Journey / Today / Guides / Review; Transport / Food / Before not More-only | **PASS** | Dock labels `首頁 · 行程 · 今日 · 教材 · 驗收` in `Handbook.astro`. Transport/Food/Before linked from `/guides/` hub + Home `discovery-strip`. `/more/` is a redirect notice to Guides, not the primary discovery path. |
| 2 | `/guides/` hub has real content; no blank hubs | **PASS** | `GUIDES_HUB` lists Transport, Food, Before, Shopping, Hanbok (Day 2), Emergency, Phrases with blurbs; built `guides/index.html` non-empty. No `/areas/*` blank hubs introduced. |
| 3 | Home discovery finds journey / today / transport / food / before / review without card wall | **PASS** | Home strip labels: 七天旅程、今天怎麼走、交通教學、食物教學、出發前準備、一起驗收. CSS is hairline list links (`.discovery-list` / `.discovery-link`), not a card grid. |
| 4 | Day ↔ Guide cross-links; Today stays execution-first | **PASS** | `relatedGuidesForDay` on day pages; `relatedDaysForGuide` on transport/food/before/shopping/phrases/emergency/packing. Today day page first `h2` remains `今天只做這件事` (no Guides hub on first screen). |
| 5 | Click-path evidence: 8 tasks @ 390/430 ≤2 primary clicks | **PASS** | `CLICK_PATH_EVIDENCE.md` + PNGs; re-ran `npm run test:discovery` → all PASS. |
| 6 | `website_ux` +1 at most → 9; overall 88; Final Exit unmet; no Booking Ready | **PASS** | Scorecard 8→9 / 87→88 with documented delta. `textbook_final_exit_met: false`. No READY / Booking Ready product claims in IA slice docs or hub copy. |
| 7 | No engineering language / raw IDs in reader **nav** | **PASS** | Dock and discovery labels are reader Chinese. No `plc-` / `place_id` / raw source IDs in primary nav. Soft residual only: pre-existing English eyebrow `Review` on review page (not dock). |
| 8 | Base path + offline core still OK | **PASS** | `astro.config.mjs` `base: "/korea-trip-plan"`. SW `korea-trip-v4` precaches `/`, `/today/`, `/days/`, `/emergency/`, `/guides/`. |

## Blockers

**None.**

## Soft residuals (non-blocking)

- English `Review` eyebrow and days hub `7 days` eyebrow are pre-existing chrome, outside the five-item dock.
- Click-path suite encodes optimal selectors; it proves ≤2-tap reachability, not an unaided user study.
- Squash-merge only after full CI green (includes `capture:visual`).

## Squash-merge

**Allowed after CI green.** IA acceptance criteria for this slice are met.
