# Sitemap — Before / After Website IA

**Date:** 2026-07-21  
**Live base:** `https://jerry200176-png.github.io/korea-trip-plan/`

## Before (main @ `861ed98`)

### Primary dock

`首頁 · 今日(Day2硬編碼) · 行程 · 決策 · 緊急`

### Discovery problem

| Surface | Reachability |
|---------|----------------|
| `/transport/` | Orphaned via `more` / deep links; not in dock |
| `/food/` | Missing even from `/more/` list |
| `/before/`, `/shopping/`, `/phrases/` | Buried under unused More |
| `/review/` | CTA on home only; dock marked `home` |
| Day pages | No related-guide exits |

### Reader tree (simplified)

```text
/ ─ home hero + day list + decisions
├─ /today/day-2/ (dock)
├─ /days/day-n/
├─ /decisions/ (dock)
├─ /emergency/ (dock)
└─ /more/ (not docked) → overview, before, transport, … (no food)
```

## After (this PR)

### Primary dock

`首頁 · 行程 · 今日 · 教材 · 驗收`

### Reader tree (simplified)

```text
/ ─ hero + discovery strip（七天／今日／交通／食物／出發前／驗收）
├─ /days/ ─────────────── Journey hub
│   └─ /days/day-n/ ───── + related guides
├─ /today/ ────────────── picker → /today/day-n/ (execution-first)
├─ /guides/ ───────────── Transport · Food · Before · Shopping · Hanbok · Emergency · Phrases
│   ├─ /transport/ ←→ Day 1/5/7
│   ├─ /food/ ←→ Day 5/6
│   ├─ /before/ · /packing/
│   ├─ /shopping/ ←→ Day 3/4
│   ├─ /phrases/
│   └─ /emergency/
├─ /review/
├─ /decisions/ (secondary)
└─ /more/ → points to /guides/
```

### Unchanged constraints

- Astro `base: /korea-trip-plan`
- Offline precache includes `/`, `/today/`, `/days/`, `/emergency/`, `/guides/`
- No blank hub pages
- No engineering IDs in reader UI
