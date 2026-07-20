# Publication design reference

Research notes for the Korea Trip Handbook print pipeline. **No code or visual assets were copied** from these projects.

## 1. Paged.js

| | |
| --- | --- |
| **License** | MIT (`pagedjs` npm package) |
| **Borrow** | CSS Paged Media (`@page`, `size`, margins); running headers/footers via `@page` margin boxes; `break-inside: avoid` on day cards; `counter(page)` for real page numbers; TOC leader dots via flex + dotted borders |
| **Do not borrow** | Entire theme packs or demo HTML wholesale |
| **Adaptation** | Astro print routes emit semantic HTML; `site/src/styles/print.css` + local Paged.js polyfill; Playwright waits for `pagedjs:rendered` before PDF export |
| **Forbidden** | Copying Paged.js demo magazine HTML/CSS verbatim |

## 2. Vivliostyle

| | |
| --- | --- |
| **License** | AGPL-3.0 (viewer/cli) — we do **not** ship Vivliostyle |
| **Borrow** | Concept: cover + spine rhythm, documentation-style TOC, single HTML → multiple `@page` sizes |
| **Do not borrow** | Vivliostyle CLI in CI, theme CSS files, or viewer bundle |
| **Adaptation** | Same YAML → Astro as web; separate print layout and `@page` rules for A5 handbook vs emergency sheet |
| **Forbidden** | AGPL theme CSS paste; Vivliostyle-specific markup |

## 3. Noto CJK (Sans TC, Serif TC, Sans KR)

| | |
| --- | --- |
| **License** | SIL Open Font License 1.1 — see `docs/FONT_ATTRIBUTION.md` |
| **Borrow** | Full Traditional Chinese + Hangul coverage; embed via `@font-face` from **local** `@fontsource/*` files |
| **Do not borrow** | Google Fonts CDN links at build or render time |
| **Adaptation** | Body: Noto Sans TC; display headings: Noto Serif TC; Korean lines: Noto Sans KR fallback in stack |
| **Forbidden** | Helvetica fallback for CJK; rasterized text screenshots instead of selectable PDF text |

## 4. KDE Itinerary / TREK

| | |
| --- | --- |
| **License** | GPL (Itinerary) — **reference only**, no code import |
| **Borrow** | Execution-mode priority: one priority, next action, map entry, emergency—above metadata |
| **Do not borrow** | UI layout, icons, map tiles, or data models |
| **Adaptation** | Daily spread fields mirror `/today/` priorities; Emergency Pack first screen = 10-second essentials |
| **Forbidden** | Copying Itinerary QML/UI strings or assets |

## Dependency record

| Package | Version pin | License | Purpose |
| --- | --- | --- | --- |
| `pagedjs` | root `package.json` | MIT | Paged Media polyfill in print HTML |
| `playwright` | root `package.json` | Apache-2.0 | Chromium PDF + visual renders |
| `@fontsource/noto-sans-tc` | site `package.json` | OFL-1.1 | Body CJK |
| `@fontsource/noto-serif-tc` | site `package.json` | OFL-1.1 | Cover / chapter titles |
| `@fontsource/noto-sans-kr` | site `package.json` | OFL-1.1 | Hangul |
