# Font embedding report — Textbook PDF repair

**Date:** 2026-07-21  
**Handbook:** `dist/korea-trip-handbook.pdf` / `docs/design-proof/korea-trip-handbook.pdf`  
**Emergency:** `dist/emergency-pack.pdf` / `docs/design-proof/emergency-pack.pdf`

## pdffonts (handbook)

See full capture: [`pdffonts-handbook.txt`](./pdffonts-handbook.txt)

Expectation after repair:

- Noto / CID / Identity fonts present for body CJK  
- ToUnicode maps present (`npm run verify:pdf` gate)  
- Footer brand is **outlined SVG**, not a missing system font  
- Diagram faces are **path geometry**, not unembedded SVG `<text>`

## Diagram font strategy

| Surface | Mechanism |
|---------|-----------|
| PDF/HTML body | Google Fonts Noto TC/KR embedded by Chromium into PDF |
| PDF footer brand | Pre-outlined SVG paths (Noto Sans CJK TC) |
| PDF footer page # | Extractable Latin text |
| Functional SVG (web + PDF `<img>`) | Text→path with Noto Sans CJK TC Regular/Bold |

## Source fonts used for path conversion (not shipped in repo)

Local build-only under `.fonts/` (gitignored):

- `NotoSansCJKtc-Regular.otf`  
- `NotoSansCJKtc-Bold.otf`  

Script: `scripts/prepare-diagram-svgs.ts` (re-run only when diagram source text changes).
