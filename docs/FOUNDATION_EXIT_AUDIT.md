# Foundation Exit Audit

**Audit date:** 2026-07-20  
**Branch:** `cursor/korea-handbook-foundation-f5a1`  
**PR:** #1  
**Auditor:** Agent (verified against repo + clean `npm run ci`)

## 1. Actually working (verified)

| Capability | Evidence |
|------------|----------|
| Clean install | `npm ci` + `npm ci --prefix site` (CI + local) |
| Data schema validation | `npm run validate` — 10 YAML files + cross-ref checks |
| Night math enforcement | 6N for 7-day arrive/depart; fails on 4N+3N @ 7 days |
| Itinerary integrity | Overlap + non-adjacent area + ref checks |
| Privacy scan | `check:privacy` on tracked files |
| Stale warnings | `check:stale` → `dist/stale-report.json` |
| Astro static site | 23 pages incl. route, decisions, slice days |
| PDF generation | From same YAML; `verify:pdf` checks headers/size |
| Mobile smoke (static) | Viewport, nav, badges, no SyncTrip leak |
| Readiness model | `dist/readiness-report.json` + Dashboard binding |
| Founder decision packages | `data/founder-decisions.yaml` → site + docs |
| CI artifacts | `handbook-dist-<sha>` with site + dist + downloads |
| Archived SyncTrip isolated | Under `archive/`; not in npm workspaces |

## 2. Skeleton only (not trip-ready)

- All 7 days are Provisional skeletons; only days 2/5/6 flagged `foundation_slice`
- Restaurants/places mostly candidates (TBD addresses)
- No real flights/hotels/KTX bookings
- K-ETA Taiwan exemption **not** asserted for 2027
- Lodging = area shortlist only (`docs/LODGING_AREAS.md`)
- Readiness overall **blocked** until D1–D3 + bookings offline

## 3. Claimed but missing / overstated (corrected this round)

| Claim | Reality |
|-------|---------|
| "Full offline PWA" | SW precaches few URLs only → readiness `offline_readiness: provisional` |
| "Trip ready" | Not — dates/route/airports open |
| "4N+3N provisional route" | **Fixed** — was incompatible with 7-day math |
| Dashboard readiness % | **Removed** subjective %; gate-based report only |
| Founder decisions hardcoded in site | **Fixed** — now YAML-driven |
| Emergency page hardcoded | **Fixed** — `emergency-public.yaml` + PDF |
| `npm run ci` incomplete | **Fixed** — PDF verify, mobile smoke, readiness, route messaging |

## 4. Duplicates / conflicts / stale

- **Resolved:** 4N+3N vs 6-night math (see `DECISION_LOG` 2026-07-20)
- **Resolved:** Day4 Gangnam+Jongno non-adjacent pairing
- **Historical only:** `docs/ROUTE_DECISION.md` Option B′ documents 4N+3N for **8 days** — allowed
- Sources checked_at 2026-07-20 — not stale yet; K-ETA rules need re-check before apply

## 5. SyncTrip impact on primary product

- **Install:** No — root/site package.json only handbook deps
- **CI/build:** No — archive not built
- **Deploy:** No — not linked in site nav
- **Risk:** Large PR diff size from archive move (review map in PR)

## 6. PR #1 scope

| Item | Assessment |
|------|------------|
| Size | Large (~12k LOC) but single pivot — acceptable with review map |
| Generated PDFs in git | **No** — `dist/` gitignored |
| `site/dist/` in git | **No** — gitignored |
| Downloads PDFs | Generated into `site/public/downloads/` at CI only |
| Scope creep | No mass POI research this round |

## 7. Foundation Exit Gate verdict

| Gate | Result |
|------|--------|
| A Reproducibility | **PASS** (after `npm ci` workflow) |
| B Single source of truth | **PASS** (validators + shared YAML) |
| C Vertical slice | **PASS** |
| D Mobile | **PASS** (automated static smoke) |
| E Offline | **PROVISIONAL** (documented honestly) |
| F Privacy | **PASS** |
| G CI evidence | **PASS** when Actions green |

**Overall:** **PASS** for Foundation Exit (product foundation, not trip-ready).

**Merge recommendation:** Ready for review after GitHub Actions confirms `npm run ci`. Do not merge until Jerry accepts this is foundation-only.
