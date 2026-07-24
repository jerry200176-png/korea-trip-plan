# Our First Korea — Warm Editorial Journey

Design contract for coding agents and visual implementers. This document is **product-specific Markdown** — not a copy of any entry in VoltAgent/awesome-design-md. Borrowed ideas are transformed into Jerry 與女友的第一次韓國旅行書.

---

## 1. Product context

A private, mobile-first digital travel handbook for two people taking their first international trip together to Korea (Seoul four nights, Busan two nights, seven calendar days). It supports anticipation and joint decisions before departure, fast execution during the trip (Today Mode, maps, Plan B), and a printable PDF worth keeping afterward. Single source of truth: `data/*.yaml`.

## 2. Emotional goal

Feel like opening a **well-edited travel journal** someone made for the two of you — warm, calm, confident. Not a startup dashboard, not a booking site, not internal ops tooling. Moments of delight come from typography and whitespace, not from card walls or neon accents.

## 3. Visual theme and atmosphere

- **Warm editorial journey** on a rice-paper canvas with a faint fixed grain overlay.
- Light mode only for couple preview (no dark “dev console” default).
- Airy vertical rhythm; content flows in **sections**, not dense grids.
- Travel vocabulary: thin route lines, day timelines, soft city washes, chapter breaks.
- Home hero may be edge-to-edge within the reading shell; elsewhere photography stays restrained — never marketplace tile walls.
- Agent design skills: taste-skill (`.agents/skills/`), Impeccable (`.cursor/skills/impeccable/`), UI/UX Pro Max (`.cursor/skills/ui-ux-pro-max/`). See `PRODUCT.md` and `design-system/our-first-korea/MASTER.md`.

## 4. Color palette and semantic roles

All UI colors MUST come from CSS variables in `site/src/styles/tokens.css`. Do not introduce raw hex in components except documented allowlist exceptions.

| Token | Role |
|-------|------|
| `--color-canvas` | Page background (warm rice) |
| `--color-surface` | Raised panels, cards |
| `--color-surface-muted` | Secondary panels, timeline track |
| `--color-ink` | Primary text |
| `--color-ink-muted` | Secondary text, captions |
| `--color-ink-faint` | Tertiary, legal |
| `--color-border` | Hairlines, rules |
| `--color-border-strong` | Emphasis rules |
| `--color-primary` | Primary actions, links emphasis, route line |
| `--color-primary-soft` | Primary tinted backgrounds |
| `--color-on-primary` | Text on primary buttons |
| `--color-accent-warm` | Sparse highlights (countdown, “one thing today”) |
| `--color-accent-warm-soft` | Warm tint blocks |
| `--color-seoul` | Seoul section accent (restrained blue-gray) |
| `--color-busan` | Busan section accent (restrained sea-teal) |
| `--color-status-confirmed` | Confirmed decisions |
| `--color-status-provisional` | Provisional / assumption |
| `--color-status-decision` | Decision required |
| `--color-status-danger` | Emergency, critical |
| `--color-status-ok` | Positive completion |

Regional accents appear as **thin left hairlines, soft washes, or small labels** — never thick side-tab bars or full backgrounds.

## 5. Typography hierarchy

- **Display / headings:** `var(--font-serif)` — Noto Serif TC, Iowan Old Style, Georgia. Used for trip title, day titles, chapter heads.
- **UI / body:** `var(--font-sans)` — Noto Sans TC, Noto Sans KR, system UI. Used for body, buttons, nav, metadata.
- **Korean place names:** same sans stack with `lang="ko"` where appropriate.

| Level | Size | Weight | Use |
|-------|------|--------|-----|
| display | clamp(2.1rem, 8vw, 2.85rem) | 600 | Home hero brand |
| h1 | clamp(1.65rem, 5vw, 2.15rem) | 600 | Page title |
| h2 | 1.15rem | 600 | Section |
| h3 | 1rem | 600 | Block title |
| body | 1.0625rem (17px) | 400–500 | Reading |
| small | 0.8125rem | 400 | Meta, badges |
| label | 0.7rem | 600 | Uppercase eyebrows (DAY, CITY) |

Line-height: 1.55 body, 1.18 headings. Prefer weight, tracking, and spacing over size jumps. Use `text-wrap: balance` on headings.

## 6. Layout principles

- **Reading column:** `max-width: 42rem` (~672px) centered; comfortable for Traditional Chinese.
- **Mobile-first:** single column default; avoid multi-column except PDF spreads.
- **Section hierarchy:** eyebrow → title → lede → content; avoid nested card stacks.
- **One primary action** per viewport when possible (Today Mode).
- **Couple framing** above the fold on Home: who, where, how many nights per city.

## 7. Spacing system

4px base. Use CSS variables:

- `--space-1` 4px, `--space-2` 8px, `--space-3` 12px, `--space-4` 16px, `--space-5` 24px, `--space-6` 32px, `--space-7` 48px, `--space-8` 64px

Section gaps: `--space-6` mobile, `--space-7` desktop. Panel padding: `--space-4` to `--space-5`.

## 8. Shape and radius rules

- Buttons: `--radius-button` (10px) — soft, not full pill (contrast with marketplace clones).
- Cards/surfaces: `--radius-card` (12px).
- Badges: `--radius-pill` (999px) with **text label inside**.
- Timeline nodes: circle 10px on a 2px route line.

## 9. Depth and elevation

Prefer **borders and surface tints** over shadows. At most one subtle shadow tier for fixed bottom nav:

`0 -4px 24px color-mix(in srgb, var(--color-ink) 8%, transparent)`

No glassmorphism stacks, no heavy drop shadows on content cards.

## 10. Component styling

- **`.surface`** — default panel: surface bg, hairline border, card radius, padding.
- **`.surface-quiet`** — no border, muted bg for timeline track.
- **`.btn` / `.btn-primary` / `.btn-ghost`** — min-height `--tap` (48px).
- **`.status`** — pill with border + text (已確認 / 暫定 / 待決策 / 假設).
- **`.route-line`** — vertical timeline with nodes for day blocks.
- **`.city-ribbon`** — seoul or busan left accent bar.
- **`.decision-card`** — options with impact chips, not SaaS tables.
- **`.emergency-card`** — high contrast border, large tap targets for numbers.

## 11. Navigation

- **Bottom dock** (fixed): 首頁 · 今日 · 行程 · 決策 · 緊急 — five items, 48px min touch.
- **No** “Dashboard”, “Readiness gates”, or engineer jargon in couple-facing labels.
- Design Lab is **not** part of the public Jerry & Nikita travel product.
- Deep links: Home quick-find chips for 海景、韓服、購物、GOT7、豬肉湯飯.

## 12. Itinerary timeline

- Day page: vertical **route-line** connecting blocks chronologically.
- Each node: time (tabular nums), title, kind, optional place line (中文 + 한국어).
- Transit blocks: dashed segment; activity: solid.
- Footer section: rain / low energy / closure as **editorial notes**, not alert banners.

## 13. Today execution interface

- Top: Day N + theme + status text.
- Hero block: **今天只做這一件事** (one priority) in accent-warm soft panel.
- Next block: **下一動** with time range.
- Action row: 緊急 · Naver Map · 完整行程 — primary green for map when available.
- Plan B: rain + low energy in quiet surface.
- Target: critical info within **10 seconds** without scrolling on common phones.

## 14. Decision interface

- Founder decisions as **decision-cards** per D1–D3.
- Status always visible as Chinese text + color border (not color alone).
- Options listed with concise impact lines; recommendation when present.
- Link from Home “一起決定” — not “Founder Decisions” as primary H1.

## 15. Emergency interface

- Phone numbers at display size, serif optional for numerals emphasis.
- Korean phrases in `lang="ko"`.
- Lodging placeholders clearly labeled 占位.
- Download emergency PDF — same visual language as site.

## 16. Print/PDF behavior

- Generated from **HTML + print CSS** shared tokens (not PDFKit raw text dump).
- A4, embedded Noto Sans CJK for 中文/한국어.
- Cover: display title, couple names line, route summary, month.
- TOC: chapter list with page numbers.
- Day spread: day title, one priority, timeline blocks, status labels.
- Emergency first page: numbers + mission + phrases.
- Bleed-safe margins; avoid splitting a day block across pages when possible.

## 17. Responsive behavior

- Breakpoints: 520px (single-column stats), 768px (wider padding).
- Typography uses `clamp` for display.
- Dock always visible; content padding-bottom clears dock + safe-area.
- Long URLs: `overflow-wrap: anywhere`.

## 18. Accessibility

- Status: never color-only — always Chinese label (已確認/暫定/待決策/假設).
- Contrast: ink on canvas ≥ WCAG AA for body; primary green on white for buttons checked.
- Focus visible outlines on links and buttons.
- `lang="zh-Hant"` on html; Korean snippets `lang="ko"`.
- Tap targets ≥ 48px.

## 19. Motion

- Subtle only: button press `scale(0.98)` with `--ease-out` (~160–280ms).
- Home hero may use a short fade/rise; below-fold sections may use `.reveal` scroll entry.
- No parallax, no magnetic cursors, no continuous looping motion. Respect `prefers-reduced-motion`.

## 20. Icons and imagery

- Emoji-free in couple UI unless data explicitly contains symbols.
- Simple SVG favicon; no third-party brand logos.
- Map actions open Naver/Google in new tab — text label on button.

## 21. Do’s and Don’ts

### Do

- Lead with brand **我們的韓國**, couple line, and Seoul 4N / Busan 2N in the Home hero.
- Use serif for emotional headlines, sans for execution UI.
- Keep whitespace; one idea per surface block; prefer rules and quiet surfaces over card walls.
- Mirror site tokens in PDF print stylesheet.

### Don't

- Don’t say Dashboard, Readiness gates, Foundation slice in hero copy.
- Don’t clone coral marketplace, purple workspace, or WIRED black masthead.
- Don’t add raw hex in Astro/CSS outside tokens.
- Don’t show audited brand names in production UI or Design Lab titles.

## 22. Agent implementation guide

1. Read this file before changing `site/src/styles/*` or layouts.
2. Add components as CSS classes in `global.css`; variables only in `tokens.css`.
3. Pages: `Handbook.astro` layout; data from `site/src/lib/data.ts`.
4. Couple preview pages: Home, Day 2, Day 5, Today, Decisions, Emergency.
5. PDF: run `npm run pdf` after `npm run build:site` — HTML render pipeline in `scripts/`.
6. Verify: `npm run ci` includes design checks and mobile smoke.
7. Visual proof: screenshots under `docs/design-proof/` from `npm run capture:visual`.
8. When unsure, favor **reading flow** over **card count**.
