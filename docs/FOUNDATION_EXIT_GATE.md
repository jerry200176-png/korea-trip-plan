# Foundation Exit Gate

**Version:** 2026-07-20  
**Applies to:** PR #1 (`cursor/korea-handbook-foundation-f5a1`)

All sections **A–G** must pass for **PASS**. Any fail ⇒ PR stays **draft**.

## A. Reproducibility

| Requirement | Verification |
|-------------|--------------|
| `npm ci` + `npm ci --prefix site` | CI step "Clean install" |
| `npm run ci` | CI step "Foundation Exit Gate" |
| Node version pinned | `.nvmrc` + `package.json` `engines` |
| No secrets for core build | No `.env` required |
| No SyncTrip runtime | `archive/synctrip-mvp/` not in install/build |
| Lockfiles committed | `package-lock.json`, `site/package-lock.json` |

## B. Single Source of Truth

| Output | Source |
|--------|--------|
| Site itinerary/days | `data/itinerary.yaml`, `data/places.yaml`, … |
| Handbook PDF | Astro print routes + Playwright (`npm run publication:build`) |
| Emergency PDF + Emergency page | `data/emergency-public.yaml` |
| Founder Decisions page | `data/founder-decisions.yaml` |
| Readiness dashboard | `dist/readiness-report.json` from `scripts/generate-readiness.ts` |

Automated checks (`npm run validate`, `test:itinerary`, `check:route-messaging`):

- Duplicate IDs, missing source refs, invalid status enum
- Night math Σ nights = `duration_days - 1`
- No active `seoul-4n-busan-3n` route option on 7-day trip
- Itinerary place/restaurant refs exist
- ≥3 `foundation_slice` days

## C. Product vertical slice

Required pages built under `site/dist/`:

Dashboard, Overview, Route, Days 2/5/6 (slice), Before, Budget, Packing, Emergency, Sources, Founder Decisions.

Sample days marked **Foundation vertical slice** + Provisional status.

## D. Mobile usability

`npm run test:mobile` — static checks on built HTML + CSS tap/viewport/overflow rules.  
Manual spot-check viewports 375/390/430 recommended before trip.

## E. Offline behavior

- Static site, no backend/login
- Emergency PDF downloadable from `/downloads/`
- SW caches subset only — **honest status:** offline = Provisional (see readiness gate `offline_readiness`)

## F. Privacy

`npm run check:privacy` — no PII patterns in tracked files.  
PDFs/gitignored; `bookings.local.yaml` gitignored.

## G. CI evidence

`npm run ci` includes: validate, privacy, stale, itinerary, route messaging, links, md lint, readiness, site build, pdf, verify pdf, prepare artifacts, mobile smoke.  
GitHub Actions uploads `handbook-dist-<sha>` artifact.

## PASS criteria

Local and GitHub Actions both green on `npm run ci` with clean install.

See also: [FOUNDATION_EXIT_AUDIT.md](./FOUNDATION_EXIT_AUDIT.md)
