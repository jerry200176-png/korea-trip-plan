# FINAL ACCEPTANCE PACKET — Jerry & Nikita

**Product status:** `FINAL ACCEPTANCE REPAIR REQUIRED`  
**Do not claim / 不得標示:** READY FOR JERRY & NIKITA ACCEPTANCE · Final approved · Booking Ready · Jerry & Nikita accepted  

**Date:** 2026-07-21  

## SHA identity (stable roles — do not self-reference tip into a file that changes tip)

| Role | SHA / value | Notes |
|------|-------------|-------|
| **product_baseline_sha** | `fc7a2ff49f1ed2e32b4a10448daac4a16a13b73c` | `main` after PR **#25** merge. Unchanged by this repair series. |
| **render_source_sha** | *(see `pdf-section-manifest.json` after each PDF generate)* | Git HEAD used when PDFs/renders were produced. |
| **evidence_snapshot_sha** | `e15fd89a2ed7734d97c498136b0cc2ee38ae4abf` | First committed evidence bundle on PR #26; **not** “PR head”. |
| **ci_verified_head_sha** | *(CI artifact / workflow metadata only — not hardcoded here)* | Recorded by CI when green; updating this packet must not invent a tip. |
| **deployed_pages_sha** | unknown until Pages rebuild after merge | Populate only after deployment. |

**PR #25 merge SHA (product baseline):** `fc7a2ff49f1ed2e32b4a10448daac4a16a13b73c`  
**PR #26:** open for independent re-verification — do not self-merge.  
**Live URL:** https://jerry200176-png.github.io/korea-trip-plan/  
**PDF URL:** https://jerry200176-png.github.io/korea-trip-plan/downloads/korea-trip-handbook.pdf  
**Emergency PDF:** https://jerry200176-png.github.io/korea-trip-plan/downloads/emergency-pack.pdf  

---

## Why READY remains revoked

Independent re-verification of PR #26 found remaining blockers after the first rendering pass:

1. Incorrect Korean crustacean phrase (`갑각류 해산은…`)  
2. Reader-facing workflow jargon (`harden` / `Hard Stop` / `Optional` / `Core` / `shortlist`)  
3. Inconsistent SHA role labeling  

**Do not restore** `READY FOR JERRY & NIKITA ACCEPTANCE` until an independent reviewer clears these on regenerated renders.

---

## Scorecard (repair posture — not inflated)

| Dimension | Score | Max | Notes |
|-----------|------:|----:|-------|
| Research depth | 18 | 20 | unchanged |
| Factual trust | 11 | 15 | unchanged |
| Personalization | 19 | 20 | unchanged |
| Itinerary logic | 14 | 15 | unchanged |
| Visual teaching | **pending_revalidation** | 15 | prior 15 invalidated |
| Website UX | 9 | 10 | unchanged |
| Publication | **pending_revalidation** | 5 | prior 5 invalidated |
| **Overall** | **pending_revalidation** | **100** | prior 91 invalidated |
| P0 open | **0** | — | PASS |
| Textbook Final Exit met | **false** | — | awaits human review after READY |

Itinerary decisions, destinations, and research scope were **not** changed in this repair.

---

## Repair evidence index

| Artifact | Path |
|----------|------|
| Full Textbook PDF | `docs/design-proof/korea-trip-handbook.pdf` |
| Emergency Pack PDF | `docs/design-proof/emergency-pack.pdf` |
| Section manifest | `docs/design-proof/pdf-section-manifest.json` |
| PDF text / reader scan | `docs/design-proof/READER_FACING_SCAN.txt` |
| Public-text / jargon scan | `docs/design-proof/PUBLIC_TEXT_SCAN.txt` |
| Korean phrase search | `docs/design-proof/KO_CRUSTACEAN_PHRASE_SCAN.txt` |
| SVG reader-facing scan | `docs/design-proof/SVG_READER_FACING_SCAN.txt` |
| Font embedding report | `docs/design-proof/FONT_EMBEDDING_REPORT.md` |
| PDF CJK evidence | `docs/design-proof/PDF_CJK_EVIDENCE.md` |
| 200 DPI page renders | `docs/design-proof/pdf-renders/` |
| Contact sheet (35 pages) | `docs/design-proof/pdf-contact-sheet.png` |
| PAGE_REVIEW | `docs/design-proof/PAGE_REVIEW.md` |
| Publication critic | `docs/research/critics/final-audit/PUBLICATION_CRITIC.md` |
| Visual critic | `docs/research/critics/final-audit/VISUAL_EDITOR_CRITIC.md` |

---

## Remaining D1 dependencies (honest)

1. Exact travel dates (D1)  
2. Time-sensitive facts coverage still **partial**  
3. KTO image rights not confirmed for download  
4. Lodging addresses remain placeholders until booked  

---

## 10 human acceptance questions

Deferred until product status returns to READY FOR JERRY & NIKITA ACCEPTANCE.

1. 第一眼打開網站，你們會想繼續看嗎？  
2. 「今日」模式是否清楚告訴你們現在該做什麼？  
3. 交通／食物／出發前／拍照教材好不好找（手機兩次點擊內）？  
4. Day 2 韓服與 Day 6 海岸的拍照計畫是否實用？  
5. 甲殼類／蝦醬提醒是否夠清楚、沒有過度保證？  
6. 退稅與明洞購物路徑是否看得懂？  
7. Textbook PDF 目錄與章節是否像一本旅行書？  
8. 緊急卡是否短小、可離線帶走？  
9. 哪些「還要一起決定」最急？  
10. 有沒有任何一頁聽起來像工程報告或假的「已訂好」？  

---

## Aggregate verdict

**Current:** `FINAL ACCEPTANCE REPAIR REQUIRED`  
**Not authorized:** READY FOR JERRY & NIKITA ACCEPTANCE · Final approved · Booking Ready · accepted  

Independent re-verification must inspect **rendered pages** (200 DPI), not only code or CI logs.
