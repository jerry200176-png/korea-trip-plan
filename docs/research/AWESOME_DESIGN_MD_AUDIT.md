# Awesome DESIGN.md Audit

<!-- markdownlint-disable MD022 MD024 MD032 -->

**Source repository:** [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md) (MIT License, audited 2026-07-20).

**Method:** Read collection README, LICENSE, per-candidate `DESIGN.md`, and candidate README stubs. The upstream collection does **not** ship `preview.html` or `preview-dark.html` in-repo; READMEs point to external preview on getdesign.md. Analysis below is from full `DESIGN.md` prose and token sections, not one-line README summaries.

**Product lens:** Jerry 與女友的第一次韓國數位旅行書 — warm editorial journey, mobile execution, PDF keepsake. Not SaaS, not marketplace clone.

**Copyright boundary:** This audit borrows **patterns and principles** only. No trademarks, brand names in product UI, proprietary fonts, images, or verbatim DESIGN.md copies in our `DESIGN.md`.

---

## Reference Matrix (decision)

| Role | Candidate | Verdict |
|------|-----------|---------|
| **Primary** | Workspace-minimal reference (audit code: **N**) | **Adapt** |
| **Secondary** | Travel-marketplace reference (audit code: **A**) | **Adapt** (selective) |
| **Secondary** | Tech-magazine editorial reference (audit code: **W**) | **Adapt** (selective) |
| Supplementary | Warm-cream AI editorial (**C**), payments editorial cream (**M**), café retail green (**S**) | **Adapt** (color/atmosphere only) |
| Rejected | Photography-first consumer hardware gallery (**P**) | **Reject** |

Audit codes map to VoltAgent folders: N=notion, A=airbnb, W=wired, C=claude, M=mastercard, S=starbucks, P=apple.

**Why this combination:** Primary N supplies warm neutrals, hairline borders, reading rhythm, and quiet hierarchy without purple SaaS hero bands. Secondary A supplies travel affordance, bottom-weight navigation, and CTA clarity. Secondary W supplies serif display + paper canvas for chapter/day spreads. C/M/S reinforce cream canvas and restrained green/warm accent without adding a fourth layout system.

---

## Candidate 1 — Workspace-minimal (Notion folder)

### Visual theme
Confident B2B workspace marketing: deep navy hero bands, pastel feature tints, illustration-heavy. Product mockups embedded in hero. Our product needs the **inverse emphasis**: cream canvas, no kanban mockups.

### Color strategy
Large token set: purple primary CTA, navy heroes, pastel card tints (peach, rose, mint, lavender, sky, yellow), warm charcoal body (`#37352f`), surface `#f6f5f4`. Strong semantic success/warning/error.

### Typography
Single sans (Notion Sans / Inter-like) at all levels; display up to 80px with tight tracking. No serif in their system — we will add serif for **our** headings while borrowing scale discipline (generous body leading 1.55).

### Layout rhythm
4px base grid; section gaps 64–96px marketing; 1280px max-width. Centered hero vs our narrow **reading column** (~720px).

### Cards and surfaces
12px radius cards, hairline borders, subtle shadows only on mockups. Pastel tint cards — **unsuitable** as default (too SaaS-feature-grid).

### Navigation
Sticky top marketing bar + hamburger &lt;1024px. We prefer **bottom dock** for thumb reach (borrow from A, not N).

### Editorial qualities
Good documentation density and status chips; undermined by pricing tables and workspace chrome.

### Mobile behavior
Documented breakpoints; hero type scales 80→36px; pricing stacks. Touch targets 44px on inputs.

### Suitable for couple travel handbook
- Warm surface + hairline dividers  
- Muted secondary text hierarchy  
- Rectangular buttons (8px) vs pill overload  
- Status badges with text labels  
- Generous vertical rhythm between sections  

### Unsuitable
- Navy hero + purple CTA brand lane  
- Workspace / database UI mockups  
- 4-tier pricing patterns  
- Pastel feature-card wall  
- Sticky-note marketing illustrations  

### Accessibility concerns
Purple on white CTA generally OK; navy hero needs careful on-dark contrast for muted text. Heavy reliance on color in pastel tags — we must keep **text status words**.

### Conclusion
**Adapt** as **primary pattern source** for surfaces, spacing, hairlines, reading-first body — **not** for brand colors, heroes, or editor UI.

---

## Candidate 2 — Travel marketplace (Airbnb folder)

### Visual theme
Warm white marketplace; photography carries hierarchy; friendly rounded geometry; single coral voltage on CTAs.

### Color strategy
Rausch coral primary on white; ink `#222`; muted grays; luxe/plus purples for sub-brands (ignore). Minimal shadow tier.

### Typography
Cereal VF sans; modest display sizes (22–28px); **rating display** 64px is loudest moment — not relevant to us.

### Layout rhythm
Open hero then **denser** card grid (16px gutters). Listing 2-column with sticky rail — marketplace-specific.

### Cards and surfaces
Property cards photo-first, ~14px radius, hover shadow. Search pill signature — **reject** search-bar chrome.

### Navigation
80px top nav with product tabs; mobile collapses. **Borrow** bottom thumb patterns conceptually via our dock, not top tab marketplace.

### Editorial qualities
Weak long-form; optimized for conversion scans.

### Mobile behavior
Full-width cards; sticky booking rail becomes sheet — good **one-handed CTA** reference.

### Suitable for couple travel handbook
- Travel emotional warmth without cold dashboard  
- Clear primary buttons and map/deeplink affordance  
- Soft card corners (moderate, not 32px pills everywhere)  
- Status as text + icon in meta lines  

### Unsuitable
- Photo grid as primary layout  
- Coral brand copy  
- Marketplace search orb  
- Guest-favorite badges / pricing rails  

### Accessibility concerns
Coral on white passes for large buttons; small text on photos needs scrims — we use few photos.

### Conclusion
**Adapt** as **secondary** for mobile CTA placement, card tactility, travel tone — strip marketplace skeleton.

---

## Candidate 3 — Tech magazine editorial (WIRED folder)

### Visual theme
Strict black wordmark on white; magazine port; minimal chrome; serif display + serif body + sans metadata.

### Color strategy
Essentially monochrome + link blue `#057dbc`; canvas `#fff`, soft `#f5f5f5`; hairline `#e0e0e0`.

### Typography
WiredDisplay serif heroes (64px / 400); BreveText body serif; Apercu sans for labels. **Square corners** on buttons — too harsh for our warm journey; we soften radius slightly.

### Layout rhythm
Story rows with hairline dividers; cover hero band; low marketing noise.

### Cards and surfaces
Story cards without shadows; elevation = typography + rules.

### Navigation
Centered masthead; hamburger left; subscribe right. Footer black band.

### Editorial qualities
**Strong fit** for day chapters, TOC, cover, pull quotes, route as editorial line.

### Mobile behavior
Single column story stack; display scales down; touch nav compact.

### Suitable for couple travel handbook
- Chapter/day headline hierarchy  
- Paper-like canvas  
- Hairline story rows → **timeline** grammar  
- Category eyebrows → day/city labels  

### Unsuitable
- Full monochrome press identity  
- Zero-radius buttons (too print-hard for touch UI)  
- News homepage density  
- Black footer brand band  

### Accessibility concerns
Gray body `#757575` on white — check contrast for small captions; we use darker muted for UI metadata.

### Conclusion
**Adapt** as **secondary** for editorial structure and serif display — not for wire-black brand.

---

## Candidate 4 — Warm AI editorial (Claude folder)

### Visual theme
Cream canvas `#faf9f5`, coral primary CTA, dark product panels for code — humanist AI brand.

### Color strategy
Cream/surface-card tans; ink `#141413`; coral `#cc785c` primary; teal/amber accents.

### Typography
Serif display (Copernicus-like) + sans body — **aligns with our pairing**.

### Layout rhythm
Section spacing up to 96px; rounded md buttons 8px.

### Cards and surfaces
Soft cream cards; dark showcase blocks — skip dark dev panels.

### Navigation
Standard marketing top nav.

### Editorial qualities
Good **emotional warmth** reference for couple narrative.

### Mobile behavior
Standard responsive marketing collapse.

### Suitable
Cream temperature, serif+sans pairing, warm accent discipline (coral → our warm orange, sparingly).

### Unsuitable
AI product dark surfaces, coral as primary (we use green primary).

### Accessibility
Coral buttons need size; cream on cream borders need visible hairlines.

### Conclusion
**Supplementary** color/atmosphere only — not a layout reference.

---

## Candidate 5 — Payments editorial cream (Mastercard folder)

### Visual theme
Putty cream `#F3F0EE`, pill/stadium radii, orbital circle motifs, institutional magazine.

### Color strategy
Ink black CTAs; signal orange accents; logo red/yellow **UI-forbidden** in our product.

### Typography
Proprietary MarkForMC — use open substitutes only; weight 450 body noted.

### Layout rhythm
Extreme radius (40px heroes) — too corporate/playful for our handbook.

### Cards and surfaces
Circular portraits + satellite CTAs — **reject** orbit motif.

### Navigation
Floating pill nav — interesting but too branded.

### Suitable
Warm cream canvas proof point; eyebrow label pattern (dot + uppercase) sparingly for **DAY** labels.

### Unsuitable
Pill stadium geometry, orbital illustrations, payments footer grids.

### Conclusion
**Reject** as structural reference; **supplementary** cream warmth only.

---

## Candidate 6 — Café retail green (Starbucks folder)

### Visual theme
Retail flagship; multi-tier greens; gold for rewards only; ceramic creams.

### Color strategy
`#006241` / `#00754A` greens — validates **green as calm action** if desaturated for us.

### Typography
SoDoSans proprietary; Rewards serif moments — parallels our TC/KR needs.

### Layout rhythm
Color-block bands cream → white → dark green footer.

### Suitable
Green primary interaction philosophy (we tune to forest green, not retail neon); warm neutral canvas `#f2f0eb`.

### Unsuitable
Full-pill buttons everywhere, Frap floating CTA, gift-card photography grids, rewards gold system.

### Conclusion
**Reject** structurally; **supplementary** green + cream calibration.

---

## Candidate 7 — Photography gallery (Apple folder)

### Visual theme
Museum product tiles; SF Pro; action blue links; alternating light/dark tiles; photography-first.

### Color strategy
`#f5f5f7` parchment, ink `#1d1d1f`, blue `#0066cc` interactions.

### Typography
SF Pro Display/Text — system stack OK as fallback only.

### Layout rhythm
Full-bleed tiles; minimal shadows on chrome.

### Suitable
Parchment secondary surface, disciplined link color (we use green not blue).

### Unsuitable
Product tile alternation, hardware gallery rhythm, chip translucency nav — wrong genre.

### Conclusion
**Reject** — handbook is editorial journey not product catalog.

---

## Cross-cutting notes

- **preview.html:** Not present in awesome-design-md clone; external previews only. Visual audit here is DESIGN.md-driven.
- **License:** MIT on collection; analyzed brands remain third-party — our implementation is original **Our First Korea — Warm Editorial Journey**.
- **Agent use:** Our root `DESIGN.md` is plain Markdown for Cursor/agents — no CLI parser required.

---

## Final selection summary

| Candidate | Verdict | Rationale |
|-----------|---------|-----------|
| N (primary) | Adapt | Warm minimal surfaces, hairlines, reading hierarchy, quiet badges |
| A (secondary) | Adapt | Travel warmth, mobile CTA, tactile cards |
| W (secondary) | Adapt | Serif chapter rhythm, TOC/spread character |
| C | Supplementary | Cream + serif/sans emotional pairing |
| M | Reject / tint only | Cream reference only |
| S | Reject / green tint only | Calm green inspiration only |
| P | Reject | Product gallery not journey book |
