# Website IA — Independent Mobile Critic

**PR branch:** `cursor/textbook-website-ia-e48c`  
**Critic role:** fresh-context mobile review (not PR author)  
**Evidence:** `npm run test:discovery` (re-run PASS), `npm run test:mobile` (PASS), `docs/design-proof/discovery/` PNGs @ 390/430, Today execution screenshot  
**Verdict:** **PASS**

## Acceptance matrix

| # | Criterion | Verdict | Evidence |
|---|-----------|---------|----------|
| 1 | Dock Home/Journey/Today/Guides/Review; high-value guides not More-only | **PASS** | Playwright a11y assert: dock `首頁 · 行程 · 今日 · 教材 · 驗收`; `aria-current` + tap targets ≥40px. Guides via dock + Home strip. |
| 2 | `/guides/` hub not blank on mobile | **PASS** | `test:mobile` requires hub needles (交通/食物/出發前/購物/韓服/緊急/實用韓文 + `guides-hub`). |
| 3 | Home discovery present; not a card wall | **PASS** | Mobile-smoke checks `discovery-strip` + six discovery labels on `index.html`. List/hairline pattern, not card tiles. |
| 4 | Day↔Guide links; Today execution-first | **PASS** | Day-6 path in discovery suite; Today assert `first h2 = 今天只做這件事` @ 390/430 (`today-exec-*.png`). |
| 5 | 8 tasks ≤2 primary clicks @ 390 and 430 | **PASS** | All eight tasks PASS both viewports in re-run; evidence PNGs under `docs/design-proof/discovery/`. |
| 6 | Score / Final Exit / no Booking Ready | **PASS** | Out of scope for layout but consistent with IA critic: ux 9 / overall 88; Final Exit unmet. |
| 7 | Reader nav free of eng IDs | **PASS** | Dock labels Chinese-only; no SyncTrip / `place_id` tokens in mobile-smoke page set. |
| 8 | Base path + offline core | **PASS** | Served under `/korea-trip-plan/`; SW precache includes `/guides/`. |

## Blockers

**None** on local discovery + mobile-smoke.

## Soft residuals (non-blocking)

- Full CI `capture:visual` not re-executed in this critic session — gate remains on PR CI.
- Emergency is dock-secondary (Guides / footer / Today); still ≤2 taps via Guides → Emergency (t7).

## Squash-merge

**Allowed after CI green** (must include `test:discovery` + `capture:visual`).
