# Decision Log

Append-only. Newest first.

## 2026-07-20 — Correct dual-city nights for a 7-day trip

- **Decision:** Provisional split is **Seoul 4 nights + Busan 2 nights** (6 nights total), not 4N+3N.
- **Status:** Provisional (route still needs Founder D2).
- **Evidence:** Itinerary pattern is Day 1 arrive / Day 7 depart → **6 hotel nights**. Previous 4+3=7 nights is arithmetically incompatible unless the trip becomes 8 calendar days.
- **Action:** Updated trip/destinations data, route docs, lodging notes; CI now fails if Σ nights ≠ `duration_days - 1` for this pattern.
- **Supersedes:** earlier “Seoul 4N + Busan 3N” wording in the same-day route decision (kept as historical Option B′ / extended-trip variant).

## 2026-07-20 — Day 4 single-area fix

- **Decision:** Day 4 uses **Gangnam only** (JYP optional + fortune-telling candidate). Removed non-adjacent Jongno pairing.
- **Status:** Confirmed (agent itinerary hygiene).
- **Rationale:** Max two *adjacent* areas; Gangnam↔Jongno is a long metro cross-town transfer and raises foot-fatigue risk.

## 2026-07-20 — K-ETA official snapshot refresh

- **Decision:** Record only facts visible on the official K-ETA portal on 2026-07-20; do **not** assert Taiwan temporary exemption without confirming the country list for actual travel dates.
- **Status:** Portal operating facts Confirmed; Taiwan personal requirement remains re-check / Decision-adjacent.
- **Evidence (`src-keta`, checked_at 2026-07-20):** fee KRW 10,000; assessment generally within 72 hours; apply only at www.k-eta.go.kr or official app; notice “Notice on Extension of K-ETA Temporary Exemption” dated 2026-03-20; FAQ on exemption eligibility dated 2026-06-11.

## 2026-07-20 — Pivot repo to Korea trip handbook

- **Decision:** Replace SyncTrip MVP as primary product with static Korea travel handbook.
- **Status:** Confirmed (agent authority for tech / structure).
- **Rationale:** Repo had zero Korea travel content; SyncTrip was incomplete and conflicted with offline, evidence-first handbook goals.
- **Action:** Moved `frontend/`, `backend/`, `PRD_v1.md`, `.antigravity/` → `archive/synctrip-mvp/`.

## 2026-07-20 — Tech stack for handbook

- **Decision:** Astro + TypeScript + YAML data + GitHub Pages; no database, no login, no paid APIs for core handbook.
- **Status:** Confirmed (agent).
- **Rationale:** Lowest maintenance for a private 2-person trip handbook; single source of truth for web + PDF.

## 2026-07-20 — Provisional route: Seoul + Busan

- **Decision:** Recommend Seoul + Busan dual-city as current best fit (night split corrected later same day to 4N+2N for a 7-day trip).
- **Status:** Provisional — Founder must confirm.
- **Rationale:** See [ROUTE_DECISION.md](ROUTE_DECISION.md). Beach/nature + pork-soup culture (Busan) vs GOT7/shopping/hanbok/fortune (Seoul).

## 2026-07-20 — Tracking without GitHub Issues API

- **Decision:** Use `docs/BACKLOG.md` + issue templates; do not block on Issues API (integration lacks access).
- **Status:** Confirmed (agent).
