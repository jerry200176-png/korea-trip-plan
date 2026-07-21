# Website IA — Independent Mobile Critic

**PR branch:** `cursor/textbook-website-ia-e48c`  
**Evidence:** `npm run test:discovery` · `docs/design-proof/discovery/` · `npm run test:mobile`  
**Verdict:** **PASS** (pending full CI including `capture:visual`)

## Checks

| Check | Verdict |
|-------|---------|
| 390 / 430 Playwright click-paths for 8 discovery tasks ≤2 taps | PASS |
| Dock labels + `aria-current` + touch ≥40px | PASS |
| Today execution-first (no guides hub on first screen) | PASS |
| Home discovery strip present | PASS |
| Guides hub not empty | PASS |
| Emergency still reachable via Guides / footer | PASS |
| Offline SW precache includes `/guides/` (`korea-trip-v4`) | PASS |
| No horizontal overflow expected via capture:visual gate | pending CI |

## Blockers

None observed on local discovery + mobile-smoke.
