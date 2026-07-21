# Textbook PDF Restructure Decision

**Date:** 2026-07-21  
**Branch:** `cursor/textbook-pdf-restructure-e48c`

## Outcome

Rebuild the handbook as a **Textbook Edition** with clear chapters, TOC + page numbers, and section-aware page budgets. Do not keep appending Media Edition pages.

## Editorial structure (implemented)

1. Cover  
2. TOC (with page numbers via two-pass measure)  
3. How to use  
4. Jerry & Nikita profile  
5. Journey overview  
6. Seoul chapter + Day 1–4  
7. Seoul → Busan transit + Busan + Day 5–7  
8. Food Atlas  
9. Transport Textbook  
10. Shopping and tax refund  
11. Hanbok and palace  
12. Photo and Memory  
13. Before Trip  
14. Emergency short (points to Quick Pack)  
15. Decisions still pending  
16. Sources  
17. Credits  

## Page-count policy

- Media Edition hard ≤20 **replaced** (not deleted) by:
  - overall min 28 / max 72
  - section budgets (`PDFSEC:*` markers)
  - near-blank / orphan detection
  - chapter completeness (required markers)
  - file-size ceiling (15 MB handbook)
- Emergency／Quick Pack remains ≤3 pages

## Two-level output

1. Full Textbook PDF — teaching chapters  
2. Emergency／Quick Pack — short offline card  

## QA

- 200 DPI renders via `capture:visual`  
- TOC / page-number footer  
- CJK extractable · font embedding  
- Publication Critic after CI  
