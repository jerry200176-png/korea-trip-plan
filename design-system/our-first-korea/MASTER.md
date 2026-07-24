# Design System — Our First Korea

Generated with [UI/UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill), then **overridden** to preserve the incumbent Warm Editorial Journey.

## Authority order

1. `DESIGN.md` + `site/src/styles/tokens.css` (binding visual contract)
2. `PRODUCT.md` (audience, jobs, voice)
3. This file (UX Pro Max recommendations adapted to the contract)

Do **not** replace CJK fonts (Noto Sans/Serif TC/KR) or introduce indigo/purple accents, Caveat/Quicksand, or glassmorphism as the page language.

## Recommended alignment (from Pro Max search)

| Dial | Value | Meaning here |
|------|-------|----------------|
| Variance | 5 | Balanced editorial, not chaos |
| Motion | 3 | Subtle micro-interactions only |
| Density | 3 | Spacious reading column |

| Pro Max suggestion | Project decision |
|--------------------|------------------|
| Storytelling-Driven pattern | Keep chapter / day narrative flow |
| Soft UI / couple warm palette | Keep rice canvas + forest primary + warm accent |
| Glassmorphism | Only on fixed dock blur (already), not content cards |
| E-Ink / Paper style cues | Paper grain + high-contrast ink already |
| Handwritten fonts | Rejected — CJK + editorial serif required |

## UX checklist (enforced in CSS)

- [x] `cursor: pointer` on interactive controls
- [x] Visible `:focus-visible` rings
- [x] Touch targets ≥ 48px (`--tap`)
- [x] ≥ 8–12px gaps between adjacent tap targets
- [x] `touch-action: manipulation` (reduce mobile tap delay)
- [x] `prefers-reduced-motion` respected
- [x] Body / muted / faint text contrast ≥ AA on canvas
- [x] Sticky bottom dock with content padding clearance

## Operate surfaces

- **Today:** one priority → next move → one-tap map/emergency
- **Emergency:** large `tel:` dial targets
- **Decisions:** status label + hairline accent (no thick AI side-tabs)

## Page overrides

Add files under `design-system/our-first-korea/pages/` only when a page must deviate from this master.
