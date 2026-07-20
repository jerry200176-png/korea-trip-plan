# Repository Audit

**Audit date:** 2026-07-20  
**Repo:** `jerry200176-png/korea-trip-plan` (private)  
**Branch at audit:** `main` → pivot on `cursor/korea-handbook-foundation-f5a1`

## 1. Existing structure (pre-pivot)

| Path | Role |
|------|------|
| `README.md` | SyncTrip collaboration whiteboard MVP |
| `docs/PRD_v1.md` | SyncTrip PRD (Taipei weekend couple story) |
| `frontend/` | Next.js 16 + Zustand + Leaflet map/timeline MVP |
| `backend/` | Express + Socket.io + Prisma; health endpoint only |
| `.antigravity/skills/` | Agent rules for Supabase schema / Zustand |

No `.github/`, no `data/`, no checklists, no CI, no privacy policy, no travel research.

## 2. Git history (relevant)

1. `d081012` — frontend MVP map + bottom sheet  
2. `1bc11f4` — DnD timeline optimistic UI  
3. `fb19042` — Google Places autocomplete  
4. `e220874` — replace Google Maps with react-leaflet / OSM Nominatim  

## 3. Travel data found

**None.** Mock itinerary was Taipei (台北車站、鼎泰豐、台北 101). No Jerry/girlfriend preferences, no Korea cities, no K-ETA, no bookings.

PRD user story mentioned 女友詠絮 and a Taipei weekend — **not** the Korea trip. Treated as historical SyncTrip context only.

## 4. Known decisions vs undecided

| Item | Status |
|------|--------|
| Product pivot to Korea handbook | **Decided this round** (agent) |
| Tech: Astro + static YAML + GitHub Pages | **Decided this round** |
| Travelers: Jerry + girlfriend, 2 pax | Confirmed (task brief) |
| ~7 days, first overseas trip together | Confirmed (task brief) |
| Preferences (food, GOT7, beach, no alcohol, etc.) | Confirmed (task brief) |
| Exact dates | **Decision Required** |
| Cities / night split | **Decision Required** (Provisional: Seoul 4 + Busan 3) |
| Flights / hotels | **Decision Required** |

## 5. Conflicts

1. **Product mission:** SyncTrip PRD forbids leaving MVP scope; Korea handbook task overrides → SyncTrip archived under `archive/synctrip-mvp/`.  
2. **README vs code:** README listed Google Maps + Supabase; code used Leaflet/OSM and Express/Prisma.  
3. **Dates:** Task says “可能 2027 年 3 月，尚未完全確認” → marked `Assumption`, not Confirmed.

## 6. Missing for “trip-ready”

- Route decision locked by Founder  
- Evidence-backed places/restaurants with recent verification  
- Day-by-day executable itinerary  
- Bookings (flights, hotels, experiences)  
- Offline handbook + PDF verified on phones  
- Final freshness pass (T-30 / T-7)

## 7. ROI backlog

### P0 (this round)

- Audit + trip brief + decision/assumption docs  
- Privacy policy + secret scan  
- YAML schemas + source registry  
- Route decision (Provisional)  
- Astro mobile handbook skeleton  
- PDF + emergency pack generation  
- CI validators  
- High-priority entry/transport/payment research + checklists  

### P1

- Fill provisional day plans with verified places  
- Accommodation area shortlists  
- GOT7 / Alien merch / cosmetics shopping map  
- Hanbok + fortune-telling candidates with booking windows  

### P2

- Polish PWA offline caching  
- Optional SyncTrip archive cleanup  
- Multi-language UI (currently zh-TW first)  

## 8. Distance to trip-ready

**Foundation → Route Decision.** Handbook product skeleton and data pipeline land this round; cannot claim trip-ready until Founder locks dates/cities and bookings exist.
