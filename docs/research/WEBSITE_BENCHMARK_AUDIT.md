# Website Benchmark Audit

**Round:** 1 · 2026-07-20  
**Scope:** Learn patterns for Jerry & Nikita’s Korea trip product. **Do not copy brands.**  
**Round 1 rule:** Propose IA only — **no new public pages implemented.**

Sources include entries tagged `website_benchmark` in [`data/research-sources.yaml`](../../data/research-sources.yaml) plus prior [`OPEN_SOURCE_REFERENCE_AUDIT.md`](./OPEN_SOURCE_REFERENCE_AUDIT.md).

---

## Benchmarks (≥10)

### 1. Wanderlog — trip homepage / itinerary

| Field | Notes |
|-------|-------|
| Page purpose | Collaborative trip board |
| First-screen hierarchy | Map + day list dominate |
| Image density | Medium; user photos |
| Navigation | Trip → days → places |
| Map usage | Central |
| Itinerary presentation | Cards on timeline |
| Responsive | Strong mobile editor |
| Strong pattern | Day list always one tap away |
| Unsuitable | Social collab chrome; generic planner feel |
| Brand boundary | No UI clone |
| Recommendation | Keep our editorial voice; borrow “today’s next step” density |

### 2. TripIt — execution timeline

| Field | Notes |
|-------|-------|
| Purpose | Confirmation-centric timeline |
| Hierarchy | Next event first |
| Images | Minimal |
| Nav | Timeline / documents |
| Strong pattern | Time-ordered execution |
| Unsuitable | Assumes booked inventory we lack |
| Recommendation | Strengthen `/today/` next-action language |

### 3. KDE Itinerary — travel documents

| Field | Notes |
|-------|-------|
| Purpose | Pass/boarding/reservation extraction |
| Strong pattern | Reservation domain clarity |
| Unsuitable | Desktop suite; email parsing out of scope |
| Recommendation | Later booking objects — not Round 1 |

### 4. AdventureLog — map journal

| Field | Notes |
|-------|-------|
| Purpose | Lifetime place log |
| Strong pattern | World/region map storytelling |
| Unsuitable | GPL stack; lifelong DB |
| Recommendation | Remember function via light memory prompts, not a journal product |

### 5. VisitKorea / VisitSeoul — destination guide

| Field | Notes |
|-------|-------|
| Purpose | Official attraction pages |
| Hierarchy | Hero → facts → transport |
| Image density | High |
| Strong pattern | Hours/fees modules |
| Unsuitable | National portal breadth |
| Recommendation | Per-stop fact modules citing Tier A |

### 6. VisitBusan — city tourism

| Field | Notes |
|-------|-------|
| Purpose | Beach/food/area promotion |
| Strong pattern | Area pages + seasonal notes |
| Unsuitable | Promo tone vs couple handbook |
| Recommendation | Borrow area comparison framing for Haeundae/Gwangalli |

### 7. Lonely Planet–style city guide

| Field | Notes |
|-------|-------|
| Purpose | Editorial neighborhood teaching |
| Hierarchy | Area → why go → how |
| Strong pattern | “Why this neighborhood” prose |
| Unsuitable | Encyclopedia sprawl |
| Recommendation | Short “why this day exists for Jerry & Nikita” blocks |

### 8. Michelin Guide restaurant pages — food guide

| Field | Notes |
|-------|-------|
| Purpose | Trust-marked food picks |
| Strong pattern | One dish identity + neighborhood |
| Unsuitable | Not a full itinerary UX |
| Recommendation | Pork soup Identify cards + source citations |

### 9. Museum field guide (pattern)

| Field | Notes |
|-------|-------|
| Purpose | On-site teaching |
| Strong pattern | Object → meaning → next object |
| Recommendation | Apply to palace / beach / food Identify sequences |

### 10. Travel guidebook PDF (pattern)

| Field | Notes |
|-------|-------|
| Purpose | Portable narrative + reference |
| Strong pattern | Chapter dividers + credits honesty |
| Recommendation | Textbook PDF later; keep Media Edition pagination lessons |

### 11. TREK / open-source planners (from prior audit)

| Field | Notes |
|-------|-------|
| Strong pattern | Planning vs documents separation; PDF export |
| Unsuitable | AGPL servers, realtime collab |
| Recommendation | Already partially applied via `/today/` |

### 12. awesome-design-md warm editorial (prior audit)

| Field | Notes |
|-------|-------|
| Strong pattern | Warm publication typography |
| Unsuitable | Generic purple/cream AI defaults |
| Recommendation | Preserve couple-book tone; avoid dashboard chrome |

---

## Cross-cutting lessons

| Need | Borrow | Avoid |
|------|--------|-------|
| First screen | One journey promise + one CTA | Stat strips, pill clusters |
| Day pages | Time + place + why-for-us | Engineering status dumps |
| Food | Identify the dish | Mood-only stock food |
| Maps | Simple orient diagrams | Full collaborative map apps |
| Today mode | Next action only | Full replanning UI |
| PDF | Textbook chapters later | Rebuilding PDF in Round 1 |

---

## Korea Trip website IA draft (not implemented)

```text
/                       旅程首頁（Jerry & Nikita · 成功標準）
/review/                兩人驗收（保留）
/days/                  七天總覽（why each day）
/days/day-n/            當日敘事 + 選擇理由 + 備案
/today/day-n/           執行模式（下一步）
/areas/seoul/           區域比較（未來）
/areas/busan/           區域比較（未來）
/food/                  食物辨識與限制（強化，非重建）
/shopping/              化妝品／衣服路徑（強化）
/before/                出發前（讀者向，非 YAML 教學）
/emergency/             緊急
/credits/               出處
/downloads/*.pdf        旅行書
```

Maintainer / research surfaces stay **non-navigated** from the couple product.

**Round 1:** document only — no new blank reader pages.

---

## Implementation status (2026-07-21)

Website IA Discovery slice implements the couple-facing dock **Home · Journey · Today · Guides · Review**, `/guides/` hub, Home discovery strip, and Day↔Guide cross-links. See [`WEBSITE_IA_DECISION.md`](./WEBSITE_IA_DECISION.md) and [`SITEMAP_BEFORE_AFTER.md`](./SITEMAP_BEFORE_AFTER.md). `/areas/*` remain future; no blank hubs shipped.
