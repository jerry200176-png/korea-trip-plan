# PDF delivery failure report

**Status:** Failed artifacts — not Couple Preview deliverables  
**Date:** 2026-07-20  
**Affected outputs:** `dist/korea-trip-handbook.pdf`, `dist/emergency-pack.pdf` (legacy PDFKit pipeline)

## Summary

Prior CI treated PDF generation as successful when files existed and exceeded a tiny byte threshold. The resulting documents are **not usable** for Jerry and his partner: Traditional Chinese and Korean text is garbled, typography is Helvetica-only, and content reads like a debug dump of YAML and raw URLs—not a travel handbook.

**Couple Preview Release is stopped** until the new publication pipeline passes `publication-quality-gate`. Legacy PDFs must not be offered as official preview downloads.

## Root cause: renderer architecture

| Issue | Cause |
| --- | --- |
| CJK garbled / tofu | `scripts/generate-pdfs.ts` uses PDFKit default **Helvetica** with **WinAnsiEncoding** — no CJK glyphs |
| No embedded fonts | PDFKit never loads Noto or other embeddable CJK faces |
| Raw URLs & YAML smell | Generator iterates objects and prints field values (`route_option`, `place_id`, `map_url`, status enums) |
| No publication design | No print CSS, no sections, no TOC leaders, no daily spread layout |
| ~25 KB “success” | `verify-pdfs.ts` only checks `%PDF` header and `minBytes` (8 KB / 1.5 KB) |

## Evidence

### Font embedding (`pdffonts`)

Legacy handbook PDFs list only **Helvetica** (or standard 14 fonts) with **no** `emb=yes` CJK faces. Unicode mapping for 繁體中文 / Hangul is absent—viewers substitute missing glyphs or show mojibake.

### Text content

- `success_criterion` and themes are authored in UTF-8 YAML but rendered through WinAnsi → **corrupted Chinese**.
- Korean place names (e.g. `경복궁`, `서울`) never reach the PDF as proper Unicode text.
- Naver map URLs appear as long percent-encoded strings in the body instead of short “地圖” actions.

### Visual / information design

- No cover, magazine rhythm, or section dividers.
- No human-readable status copy (“已決定 / 暫定 / …”).
- Emergency pack is a text list, not a high-contrast offline card.

### Why CI green ≠ PDF usable

`npm run ci` previously ran:

1. `npm run pdf` → PDFKit write
2. `npm run verify:pdf` → file exists + size + `%PDF`

No checks for: embedded fonts, Unicode extraction, CJK sample strings, layout renders, raw URL leakage, or minimum page count for a 7-day handbook.

## Regression artifacts

Rendered screenshots of the **failed** PDFs (for comparison only) may be kept under `artifacts/pdf-failure/` locally or in PR attachments. **Do not commit legacy PDF binaries** to git.

## Replacement

See `docs/research/PUBLICATION_DESIGN_REFERENCE.md` and the publication scripts:

- Astro print routes + `print.css` + **Paged.js** (MIT)
- **Playwright / Chromium** `page.pdf()` with local **Noto Sans TC / Noto Serif TC / Noto Sans KR**
- `scripts/build-publication.ts`, `render-publication.ts`, `verify-publication.ts`
- CI job **`publication-quality-gate`**

## Policy

- Old PDF download links on the public site are **disabled** until the new gate passes.
- Do not re-enable Couple Preview using PDFKit output.
