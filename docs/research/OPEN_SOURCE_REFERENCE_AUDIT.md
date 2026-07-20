# Open Source Reference Audit

**Audit date:** 2026-07-20  
**Repo:** Korea Trip Handbook (`jerry200176-png/korea-trip-plan`)  
**Method:** README / docs / GitHub API metadata / LICENSE files (no code copied).  
**Scope:** Learn from mature travel products; **do not** fork, rewrite Astro stack, or import AGPL/GPL code.

## Executive summary

| Project | Closest to our need | Recommendation |
|---------|---------------------|----------------|
| **liketrek/TREK** | Full planner + PWA + reservations | **Adapt** ideas only; **Reject** stack (AGPL, NestJS+SQLite, realtime) |
| **itskovacs/trip** | Lightweight POI + trip days | **Adapt** POI/trip separation; **Reject** self-hosted server |
| **KDE Itinerary + kitinerary** | Travel docs / timeline / extractor | **Adapt** reservation *domain*; **Revisit** if we ever parse emails (out of scope) |
| **organicmaps** | Offline maps + KML/GeoJSON import | **Adapt** export workflow; app is separate install |
| **seanmorley15/AdventureLog** | Journal + world map + Django | **Reject** for this trip (GPL, DB, lifelong log) |
| **osmandapp/OsmAnd** | Offline OSM navigation | **Adapt** as consumer of our KML/GeoJSON later |
| **OpenTripPlanner** | Multimodal GTFS routing | **Reject** import; **boundary reference** only |

**This round implementation:** `/today/` **Execution Mode** vertical slice (see [§ Product answers](#product-answers) and Adoption Matrix).

---

## liketrek/TREK

| Field | Evidence-based notes |
|-------|----------------------|
| **Product positioning** | Self-hosted collaborative travel planner with maps, budgets, packing, journal, AI/MCP ([README](https://github.com/liketrek/TREK)). |
| **Target user** | Households / friend groups running their own Docker instance. |
| **Primary user journey** | Create trip → search/import places → drag days → attach reservations → collaborate live → export PDF. |
| **Architecture** | NestJS 11 + SQLite (`travel.db`) + React 19 + WebSocket sync; Docker/Helm ([README](https://github.com/liketrek/TREK)). |
| **Data model** | Server DB (trips, places, days, reservations, costs, documents) — not YAML-first. |
| **Mobile strategy** | Installable PWA; touch layouts; Workbox caching ([README](https://github.com/liketrek/TREK)). |
| **Offline strategy** | SW caches tiles/API/uploads; still server-centric. |
| **Map strategy** | Leaflet or Mapbox GL; OSM or Google Places search; import Google/Naver lists, GPX, KML/KMZ/GeoJSON ([README](https://github.com/liketrek/TREK)). |
| **Itinerary UX** | Drag-and-drop day planner, route optimization, day notes. |
| **Reservation model** | Flights/hotels/restaurants with status, confirmation numbers, files; email/PDF import; cites KDE Itinerary engine ([README](https://github.com/liketrek/TREK)). |
| **Budget / packing / documents** | Splitwise-style costs; packing templates; ≤50 MB attachments per doc. |
| **PDF / export** | Full trip PDF with cover and images ([README](https://github.com/liketrek/TREK)). |
| **Collaboration model** | Real-time WebSocket, invites, roles, chat/polls addons. |
| **AI / automation** | MCP server, 150+ tools ([README](https://github.com/liketrek/TREK)). |
| **License** | **AGPL-3.0** ([GitHub API license](https://github.com/liketrek/TREK), README License section). Network use + modifications → copyleft obligations if we shipped derived backend. |
| **Project activity evidence** | Created 2026-03-19; pushed 2026-07-19; active demo; ~10k stars (metadata only — not a quality score). |
| **適合借鏡的設計** | Place import from map share lists; separation of **planning** vs **documents**; execution-friendly day notes; explicit PDF export. |
| **不適合本 repo** | Entire server, SSO, realtime collab, MCP, SQLite SoT, Mapbox/Google paid search defaults. |
| **採用成本** | **High** if forked; **Low** for UX patterns documented here. |
| **預期旅行體驗改善** | High *if* we copied features — but violates maintenance/privacy goals. |
| **Recommendation** | **Adapt** (patterns) · **Reject** (codebase) |

---

## seanmorley15/AdventureLog

| Field | Evidence-based notes |
|-------|----------------------|
| **Product positioning** | Self-hostable travel tracker + trip planner ([README](https://github.com/seanmorley15/AdventureLog)). |
| **Target user** | Long-horizon travelers logging lifetime visits. |
| **Primary user journey** | Log places on world map → plan multi-day collection → share/collaborate → stats. |
| **Architecture** | SvelteKit + Django + PostGIS + DRF + AllAuth ([README](https://github.com/seanmorley15/AdventureLog)). |
| **Data model** | Relational GIS (countries/regions, locations, itineraries). |
| **Mobile strategy** | Web app; MapLibre map views (screenshots in README). |
| **Offline strategy** | Not positioned as offline-first handbook. |
| **Map strategy** | MapLibre; 3D map view mentioned in README screenshots section. |
| **Itinerary UX** | List + map + calendar views for trips. |
| **Reservation model** | Flight info, notes, checklists in itinerary (README features). |
| **Budget / packing / documents** | Checklists/links; not central in README. |
| **PDF / export** | Not emphasized in README. |
| **Collaboration model** | Share links; collaborators edit collections. |
| **AI / automation** | Not claimed in README. |
| **License** | **GPL-3.0** (README License; `LICENSE` file in repo). |
| **Project activity evidence** | Since 2024-03; pushed 2026-07-19; ~3.4k stars; 222 open issues (activity ≠ fit). |
| **適合借鏡的設計** | Itinerary list/map/calendar **modes** as mental model (we can keep static pages). |
| **不適合本 repo** | PostGIS DB, auth, lifetime travel book, collaborative SaaS patterns. |
| **採用成本** | High. |
| **預期旅行體驗改善** | Low for a single 7-day trip. |
| **Recommendation** | **Reject** (product) · **Revisit later** only if we pivot to lifelong log |

---

## itskovacs/trip

| Field | Evidence-based notes |
|-------|----------------------|
| **Product positioning** | Minimalist self-hosted POI map tracker + trip planner ([README](https://github.com/itskovacs/trip)). |
| **Target user** | Privacy-minded travelers self-hosting Docker. |
| **Primary user journey** | Map POIs → plan multi-day trip → share with companions ([docs](https://itskovacs.github.io/trip/docs/intro)). |
| **Architecture** | Docker (`ghcr.io/itskovacs/trip`); storage volume; optional OIDC ([README](https://github.com/itskovacs/trip)). |
| **Data model** | Server-side POI + trip entities (details in project docs — not duplicated here). |
| **Mobile strategy** | Web UI screenshots; demo on Netlify. |
| **Offline strategy** | Not YAML/PDF offline handbook. |
| **Map strategy** | Interactive maps for POI (README). |
| **Itinerary UX** | Multi-day trip screens (README screenshots). |
| **Reservation model** | Not highlighted in README. |
| **Budget / packing / documents** | Not in README core features. |
| **PDF / export** | Not claimed in README. |
| **Collaboration model** | “Collaborate and share” (README) — server-mediated. |
| **AI / automation** | None in README. |
| **License** | **MIT** ([GitHub API](https://github.com/itskovacs/trip)). MIT allows code reuse with attribution — we still **avoid copying** to keep Astro/YAML ownership clear. |
| **Project activity evidence** | Created 2025-07; pushed 2026-07-14; ~1.7k stars. |
| **適合借鏡的設計** | Thin **POI + trip day** split; minimalist day view. |
| **不適合本 repo** | Another server + storage; duplicates handbook we already built. |
| **採用成本** | Medium if integrated; Low for model ideas. |
| **預期旅行體驗改善** | Medium for map UX only. |
| **Recommendation** | **Adapt** domain shape · **Reject** deployment |

---

## KDE Itinerary & KDE/kitinerary

| Field | Evidence-based notes |
|-------|----------------------|
| **Product positioning** | “Digital travel assistant” privacy-focused; timeline of trips ([KDE README](https://github.com/KDE/itinerary), [apps.kde.org](https://apps.kde.org/itinerary)). |
| **Target user** | KDE/mobile users managing boarding passes and bookings locally. |
| **Primary user journey** | Import travel documents → timeline → offline assistance while traveling ([wiki](https://community.kde.org/KDE_PIM/KDE_Itinerary)). |
| **Architecture** | C++/Qt; **kitinerary** extractor engine ([invent.kde.org/pim/kitinerary](https://invent.kde.org/pim/kitinerary)); kpublictransport, kosmindoormap ([README](https://github.com/KDE/itinerary)). |
| **Data model** | Strongly typed **reservations / tickets / legs** (extracted from PDF/barcode/email). |
| **Mobile strategy** | Android via KDE F-Droid; Flatpak desktop. |
| **Offline strategy** | On-device storage; privacy by design (README tagline). |
| **Map strategy** | Indoor maps via kosmindoormap (README); not a general trip blog. |
| **Itinerary UX** | **Timeline** oriented (screenshot on KDE site). |
| **Reservation model** | Core product — extraction + display. |
| **Budget / packing / documents** | Documents-first; not packing-centric. |
| **PDF / export** | Consumes PDFs/emails; export not our focus. |
| **Collaboration model** | None (personal assistant). |
| **AI / automation** | None claimed. |
| **License** | KDE projects typically **GPL-2.0+ / LGPL** components; GitHub mirror shows `license: other` — treat as **strong copyleft** unless SPDX verified per file. **Do not embed kitinerary.** |
| **Project activity evidence** | Itinerary since 2018; pushed 2026-07-20; small GitHub star count (62) — primary dev on invent.kde.org. |
| **適合借鏡的設計** | **Reservation vs itinerary item** separation; timeline for **execution day**; “import once, read offline”. |
| **不適合本 repo** | C++ engine, PIM stack, barcode parsing in CI. |
| **採用成本** | Very high to embed; Low to mirror schema fields in YAML. |
| **預期旅行體驗改善** | High for **booking phase** only. |
| **Recommendation** | **Adapt** schema ideas · **Revisit later** for optional local import tool (non-git) |

---

## organicmaps/organicmaps

| Field | Evidence-based notes |
|-------|----------------------|
| **Product positioning** | Privacy-first **offline** maps & navigation for travelers/hikers ([README](https://github.com/organicmaps/organicmaps)). |
| **Target user** | Mobile users needing offline OSM maps. |
| **Primary user journey** | Download region → bookmark places → navigate offline. |
| **Architecture** | C++ mobile app; OSM data; separate **DATA_LICENSE** for `.mwm` ([README](https://github.com/organicmaps/organicmaps)). |
| **Data model** | Bookmarks/tracks; import **KML, KMZ, GPX, GeoJSON** ([README](https://github.com/organicmaps/organicmaps)). |
| **Mobile strategy** | Native iOS/Android; store installs. |
| **Offline strategy** | Core value — offline maps and search. |
| **Map strategy** | OSM-based; no Google/Naver dependency in app. |
| **Itinerary UX** | Not a day planner — map-centric. |
| **Reservation model** | None. |
| **Budget / packing / documents** | None. |
| **PDF / export** | Export/import tracks & bookmarks (KML/GPX/GeoJSON). |
| **Collaboration model** | None. |
| **AI / automation** | None. |
| **License** | **Apache-2.0** (source); binary map data under separate license ([README](https://github.com/organicmaps/organicmaps)). Using **our own** GeoJSON/KML does not require forking OM. |
| **Project activity evidence** | Active 2026-07; large community; 14k+ stars. |
| **適合借鏡的設計** | **Offline place pack** as interchange format; deep links to coordinates. |
| **不適合本 repo** | Embedding map engine in Astro. |
| **採用成本** | Low for export script; user installs app separately. |
| **預期旅行體驗改善** | High on-trip navigation without roaming. |
| **Recommendation** | **Adapt** (export + docs) · app **Adopt** as end-user tool |

---

## osmandapp/OsmAnd

| Field | Evidence-based notes |
|-------|----------------------|
| **Product positioning** | OSM map viewer + turn-by-turn navigation (car/bike/pedestrian) ([README](https://github.com/osmandapp/OsmAnd)). |
| **Target user** | Offline navigators worldwide. |
| **Primary user journey** | Download map → route → GPX overlays. |
| **Architecture** | Large Java/Android + iOS codebase; plugins ([README](https://github.com/osmandapp/OsmAnd)). |
| **Data model** | OSM + GPX favorites; not trip handbook. |
| **Mobile strategy** | Primary native apps + store builds. |
| **Offline strategy** | Core feature ([README](https://github.com/osmandapp/OsmAnd)). |
| **Map strategy** | OSM vector tiles; Wikipedia POIs (paid tier notes in README). |
| **Itinerary UX** | Routing-focused, not journaling. |
| **Reservation model** | None. |
| **Budget / packing / documents** | None. |
| **PDF / export** | GPX import/export emphasis ([README](https://github.com/osmandapp/OsmAnd)). |
| **Collaboration model** | None. |
| **AI / automation** | None. |
| **License** | **GPLv3** (standard for OsmAnd — verify `LICENSE` in repo before any code use). |
| **Project activity evidence** | Long-lived; active commits 2026-07. |
| **適合借鏡的設計** | Same as Organic Maps: consume **GPX/KML** we generate. |
| **不適合本 repo** | Bundling OsmAnd. |
| **採用成本** | Low as external app. |
| **預期旅行體驗改善** | High offline routing; Korea pedestrian/KTX still needs our YAML context. |
| **Recommendation** | **Adapt** interchange · **Reject** integration |

---

## OpenTripPlanner (OTP)

| Field | Evidence-based notes |
|-------|----------------------|
| **Product positioning** | Open-source **multimodal trip planner** for scheduled transit + bike/walk ([README](https://github.com/opentripplanner/OpenTripPlanner)). |
| **Target user** | Transit agencies and integrators (GTFS/OSM graphs). |
| **Primary user journey** | Build graph from GTFS → GraphQL plan A→B with realtime updates. |
| **Architecture** | Java server; OTP2 on `dev-2.x`; Docker JAR ([README](https://github.com/opentripplanner/OpenTripPlanner)). |
| **Data model** | Graph vertices/edges — not traveler handbook. |
| **Mobile strategy** | Custom clients; reference JS client for testing only. |
| **Offline strategy** | Server-side routing; not phone offline handbook. |
| **Map strategy** | OSM + GTFS — excellent for **capability ceiling** (e.g. “OTP-class routing needs GTFS feed + JVM”). |
| **Itinerary UX** | N/A (routing API). |
| **Reservation model** | N/A. |
| **Budget / packing / documents** | N/A. |
| **PDF / export** | N/A. |
| **Collaboration model** | N/A. |
| **AI / automation** | N/A. |
| **License** | **LGPL-3.0** (LICENSE file). Linking/copying server components triggers LGPL obligations. |
| **Project activity evidence** | Since 2011; active 2026-07; 2.7k stars. |
| **適合借鏡的設計** | Understand **when** multimodal routing is overkill (our trip: handful of metro/KTX days). |
| **不適合本 repo** | Running OTP for two travelers. |
| **採用成本** | Very high. |
| **預期旅行體驗改善** | Marginal vs Naver/Kakao on-site + pre-written blocks. |
| **Recommendation** | **Reject** import · **boundary reference** only |

---

## Product answers

1. **Planning / Execution / Emergency modes?**  
   **Yes, as separate surfaces** — not separate apps. Planning = Dashboard + `/decisions/` + route docs; **Execution** = `/today/` (this PR); **Emergency** = existing `/emergency/` + PDF. Avoid mode-specific backends.

2. **`/today/` vs Dashboard?**  
   **`/today/` higher value on-trip.** Dashboard stays for readiness, Founder gates, and pre-trip planning. Dashboard growth alone does not answer “what now?” in 10 seconds.

3. **Split Place / Lodging / Transport / Reservation / ItineraryItem?**  
   **Yes in YAML**, but pragmatically: keep `places.yaml`, `itinerary.yaml` blocks; add **`reservations` / `transport_legs`** when D1 nears (normalize before hotel/flight candidates). Lodging **areas** already scored separately (`lodging-area-scores.yaml`). Do not merge reservations into `places`.

4. **SW enough vs GeoJSON/KML?**  
   **SW alone insufficient** for map navigation offline (only caches HTML). **Generate GeoJSON/KML** from `places.yaml` (with explicit `lat`/`lon` + sources) for Organic Maps/OsmAnd — **next ROI**. SW should precache `/today/` + emergency.

5. **Naver/Google share → YAML without paid API?**  
   **Manual + deep links**: store `naver_map_url` / `google_maps_url` (already); founder pastes share URLs; optional maintainer script extracts place id from URL pattern only (no Places API). Coordinates: one-time human/OSM lookup → `lat`/`lon` fields with `checked_at` + `source_ids`. TREK claims list import — we **adapt process**, not code.

6. **Keep bookings out of Git?**  
   `bookings.example.yaml` only in git; **`bookings.local.yaml` gitignored**; `check:privacy`; never commit QR/PNR; PDFs with codes generated **locally** into `dist/` (gitignored). KDE-style: secrets live on device, not repo.

7. **TREK / AdventureLog over-engineering for one trip?**  
   Realtime collab, MCP, split expenses, Atlas world stats, AirTrail sync, SSO, Vacay HR calendar, lifelong AdventureLog map — **reject** for Jerry’s 7-day trip.

8. **What user needs in 10 seconds abroad?**  
   **Today’s one priority**, **next movement block**, **one map open**, **emergency card**, **return-by time**, **rain/low-energy one-liner** — implemented on `/today/day-N/`.

---

## Adoption Matrix (max 5, ROI-sorted)

### 1. Execution Mode `/today/` slice

| | |
|--|--|
| **Problem** | Dashboard is planning-oriented; on-trip cognitive load too high. |
| **Source project** | KDE Itinerary timeline UX; TREK day notes (concept only). |
| **Observed evidence** | KDE emphasizes timeline while traveling; TREK separates planner vs mobile layouts ([KDE README](https://github.com/KDE/itinerary), [TREK README](https://github.com/liketrek/TREK)). |
| **Proposed adaptation** | Static Astro `/today/` + `/today/day-N/` with one_priority, next block, map + emergency CTAs. |
| **User impact** | High on trip days. |
| **Engineering effort** | Low. |
| **Maintenance cost** | Low (same itinerary YAML). |
| **Privacy risk** | Low. |
| **License risk** | None (no third-party code). |
| **Acceptance criteria** | Mobile nav includes 今日; smoke tests pass; no booking secrets. |
| **Decision** | **Adopt now** (this PR) |

### 2. GeoJSON/KML offline place pack

| | |
|--|--|
| **Problem** | SW caches pages, not turn-by-turn or pin navigation in subway. |
| **Source project** | organicmaps; TREK import formats (KML/GeoJSON). |
| **Observed evidence** | Organic Maps documents KML/KMZ/GPX/GeoJSON import ([README](https://github.com/organicmaps/organicmaps)). |
| **Proposed adaptation** | `scripts/export-places-geo.ts` → `site/public/downloads/places.kml` + require `lat`/`lon` in `places.yaml`. |
| **User impact** | High offline navigation. |
| **Engineering effort** | Medium (coords + validation). |
| **Maintenance cost** | Medium per new POI. |
| **Privacy risk** | Low (no PII). |
| **License risk** | Low if we generate files ourselves. |
| **Acceptance criteria** | OM imports file; CI validates coords for Confirmed places. |
| **Decision** | **Later** (next PR) |

### 3. Reservation / transport YAML normalization

| | |
|--|--|
| **Problem** | Flight/hotel/KTX facts scattered in prose. |
| **Source project** | KDE kitinerary domain; TREK reservations. |
| **Observed evidence** | TREK reservations with status + files; KDE extractor pipeline ([TREK README](https://github.com/liketrek/TREK), [KDE README](https://github.com/KDE/itinerary)). |
| **Proposed adaptation** | `data/transport.yaml` + `data/reservations.yaml` (gitignored values) referencing `trip.flight_plan`. |
| **User impact** | Medium until D1 booking. |
| **Engineering effort** | Medium. |
| **Maintenance cost** | Low after schema set. |
| **Privacy risk** | High if mis-gitted — mitigate with example-only + privacy scan. |
| **License risk** | None if schema is ours. |
| **Acceptance criteria** | Schema validates; bookings.local stays ignored. |
| **Decision** | **Later** (after D1) |

### 4. Map share URL → YAML maintainer workflow

| | |
|--|--|
| **Problem** | Slow POI entry. |
| **Source project** | TREK place import (Google/Naver lists). |
| **Observed evidence** | README lists import from shared map lists ([TREK](https://github.com/liketrek/TREK)). |
| **Proposed adaptation** | Documented checklist + optional CLI parsing share URLs into stub YAML rows (no API). |
| **User impact** | Medium for researchers. |
| **Engineering effort** | Low–medium. |
| **Maintenance cost** | Low. |
| **Privacy risk** | Low. |
| **License risk** | Low if no TREK code. |
| **Acceptance criteria** | New place rows without API keys. |
| **Decision** | **Later** |

### 5. Real-time collab / MCP / expense split

| | |
|--|--|
| **Problem** | Two travelers editing plan. |
| **Source project** | TREK WebSocket; AdventureLog sharing. |
| **Observed evidence** | TREK realtime sync; AdventureLog collaborators ([READMEs](https://github.com/liketrek/TREK)). |
| **Proposed adaptation** | Git + iMessage + shared PDF — not a server. |
| **User impact** | Low for couple on one trip. |
| **Engineering effort** | Very high. |
| **Maintenance cost** | Very high. |
| **Privacy risk** | High. |
| **License risk** | AGPL/GPL if copied. |
| **Acceptance criteria** | N/A |
| **Decision** | **Reject** |

---

## License conclusions (handbook repo)

| License | Projects | Implication for this repo |
|---------|----------|---------------------------|
| **AGPL-3.0** | TREK | Do not copy or link AGPL server code into shipped site; ideas/docs only. |
| **GPL-3.0** | AdventureLog, OsmAnd (typical) | No code merge; avoid derivative combined works. |
| **LGPL-3.0** | OpenTripPlanner | No OTP server embedding. |
| **MIT** | itskovacs/trip | Could reuse with attribution; still prefer clean-room implementation. |
| **Apache-2.0** | Organic Maps (source) | Our own export scripts OK; respect OM **data** license if redistributing map binaries (we do not). |
| **KDE (GPL/LGPL family)** | Itinerary/kitinerary | Schema inspiration only. |

**Screenshots / README text:** cite URLs only; do not copy into handbook or site.

---

## Implementation note (this PR)

**Chosen:** Adoption Matrix #1 — `/today/` Execution Mode.  
**Not chosen now:** GeoJSON/KML — blocked on systematic `lat`/`lon` in `places.yaml` (next PR).  
**Not chosen:** Reservation schema — higher privacy surface before D1.

**Files:** `site/src/pages/today/*`, nav + SW precache, `docs/research/OPEN_SOURCE_REFERENCE_AUDIT.md`.

---

## References (visited 2026-07-20)

- https://github.com/liketrek/TREK  
- https://github.com/seanmorley15/AdventureLog  
- https://github.com/itskovacs/trip  
- https://github.com/KDE/itinerary · https://invent.kde.org/pim/kitinerary  
- https://github.com/organicmaps/organicmaps  
- https://github.com/osmandapp/OsmAnd  
- https://github.com/opentripplanner/OpenTripPlanner  
