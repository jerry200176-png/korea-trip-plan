# Decision Log

Append-only. Newest first.

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

- **Decision:** Recommend Seoul 4 nights + Busan 3 nights as current best fit.
- **Status:** Provisional — Founder must confirm.
- **Rationale:** See [ROUTE_DECISION.md](ROUTE_DECISION.md). Beach/nature + pork-soup culture (Busan) vs GOT7/shopping/hanbok/fortune (Seoul).

## 2026-07-20 — Tracking without GitHub Issues API

- **Decision:** Use `docs/BACKLOG.md` + issue templates; do not block on Issues API (integration lacks access).
- **Status:** Confirmed (agent).
