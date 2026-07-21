# Website IA Decision — Jerry & Nikita Textbook

**Date:** 2026-07-21  
**Branch:** `cursor/textbook-website-ia-e48c`  
**Benchmark basis:** [`WEBSITE_BENCHMARK_AUDIT.md`](./WEBSITE_BENCHMARK_AUDIT.md), [`OPEN_SOURCE_REFERENCE_AUDIT.md`](./OPEN_SOURCE_REFERENCE_AUDIT.md)

## Outcome

Let Jerry and Nikita find completed high-value teaching on mobile in ≤2 primary taps. Transport / Food / Before must not live only in a vague More menu.

## Adopted patterns

| Pattern | Source lesson | Our application |
|---------|---------------|-----------------|
| Day list one tap away | Wanderlog | Bottom dock **行程** → `/days/` |
| Execution next-action | TripIt / open-source Today | **今日** → `/today/` picker; Today first screen stays priority / next move / map / rescue |
| Editorial guide hub | Lonely Planet / VisitKorea area teaching | New **教材** → `/guides/` listing Transport, Food, Before, Shopping, Hanbok, Emergency, Phrases |
| Couple acceptance surface | Prior product Review | Dock **驗收** → `/review/` |
| Mobile bottom dock (5) | awesome-design-md / prior handbook | Home · Journey · Today · Guides · Review |
| Contextual cross-links | Museum field-guide “next object” | Day → related guides; Guide → related days |
| Home discovery strip | First-screen hierarchy lessons | Compact “先找這些” list in first two mobile viewports — not a card wall |

## Rejected patterns

| Pattern | Why rejected for Jerry & Nikita |
|---------|----------------------------------|
| Social collab chrome / map-first planner | Not a collaborative editor; editorial couple textbook |
| Decisions / Emergency in primary dock | High-value teaching was buried; Decisions stays reachable from Home/Review; Emergency stays in Guides + footer + Today |
| Generic More overflow as primary discovery | Orphaned `current="more"` left guides without dock state |
| Card-wall home of every chapter | Violates DESIGN.md and discovery clarity |
| Blank `/areas/*` hubs | No empty hubs; only completed teaching |
| Copying Wanderlog / VisitKorea / Michelin UI | Brand boundary — patterns only |

## Jerry & Nikita-specific rationale

- First overseas trip together: need **fast find** for airport arrival, tax refund, allergen language, packing, Day 6 low-energy, missed KTX, offline emergency, acceptance.
- Jerry low-energy preference: Today must stay execution-first — no editorial nav noise on the first screen.
- Nikita shopping / food / hanbok interests: Guides hub surfaces Shopping, Food, Hanbok without hunting.
- Base path `/korea-trip-plan/` and offline core (Home, Today, Days, Emergency, Guides hub) preserved.

## Primary IA (implemented)

```text
/                 首頁 + discovery strip
/days/            行程（Journey）
/today/           今日（execution picker）
/guides/          教材 hub
/review/          驗收
/transport/ …     teaching surfaces linked from hub + days
/emergency/       via Guides / Today / footer (not primary dock)
/decisions/       via Home / Review (not primary dock)
/more/            redirect notice → /guides/
```

## Non-goals this slice

- Full visual redesign
- Photo & Memory teaching (next ROI)
- Full Textbook PDF restructuring
- Score inflation without click-path / critic evidence
