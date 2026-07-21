# PDF CJK / font evidence

**Date:** 2026-07-21  
**Status:** Rendering repair — pending independent visual re-verification  

## Body text (Playwright HTML → PDF)

Handbook / Emergency HTML uses Google Fonts:

- Noto Serif TC  
- Noto Sans TC  
- Noto Sans KR  

`document.fonts.ready` awaited before `page.pdf()`.

Binary checks (`npm run verify:pdf`):

- `%PDF` header  
- `/Font` markers present  
- `ToUnicode` cmap entries present (handbook ≫ 100; emergency ≫ 24)  
- `pdffonts` captured → `docs/design-proof/pdffonts-handbook.txt`

## Footer CJK

Playwright `footerTemplate` is a separate document and must not depend on unembedded system fonts for Chinese.

- Brand line **我們的韓國 · Textbook** is a **path SVG** (`docs/design-proof/footer-brand.svg`) embedded as a data-URI `<img>` in the footer.  
- Page numbers remain **extractable text** (`N / 35`) via Arial/sans in the footer template.

## Functional SVG diagrams

All 35 diagrams in `media/diagrams/` (+ byte-identical `site/public/media/`):

1. Reader-facing Orient/Explain/Warn/Rescue/Compare/Identify/Remember labels scrubbed from `<text>`, `<title>`, `<desc>`.  
2. Remaining glyph text converted to **paths** with Noto Sans CJK TC (Regular/Bold) via `scripts/prepare-diagram-svgs.ts`.  
3. Marked `data-cjk-paths="1"`.  

PDF embeds these SVGs as `<img>` data-URIs — path outlines render at 200 DPI without system font fallback.

## Visual checks required of the independent reviewer

Inspect `docs/design-proof/pdf-renders/page-*.png` (200 DPI), especially:

- Pages **1, 2, 20, 27**  
- Emergency Pack page 1  
- Full contact sheet `pdf-contact-sheet.png`  
- Every diagram page (not only representatives)
