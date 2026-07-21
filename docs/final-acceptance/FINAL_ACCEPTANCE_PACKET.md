# FINAL ACCEPTANCE PACKET — Jerry & Nikita

**Product status:** `FINAL ACCEPTANCE REPAIR REQUIRED`  
**Do not claim / 不得標示:** READY FOR JERRY & NIKITA ACCEPTANCE · Final approved · Booking Ready · Jerry & Nikita accepted  

**Date:** 2026-07-21  

## SHA identity (avoid self-referential “main SHA”)

| Role | SHA | Notes |
|------|-----|-------|
| **Product baseline SHA** | `fc7a2ff49f1ed2e32b4a10448daac4a16a13b73c` | `main` tip after PR **#25** merge (acceptance packet). Recorded as `round_2_progress.final_audit.merge_sha`. |
| **Packet PR / head SHA** | `e15fd89a2ed7734d97c498136b0cc2ee38ae4abf` | Branch `cursor/final-textbook-rendering-f752`. Not claimed as `main`. |
| **Deployed Pages SHA** | unknown until Pages rebuild after merge | Live URL may lag; do not equate Pages deploy with packet head. |

**PR #25 merge SHA (correct):** `fc7a2ff49f1ed2e32b4a10448daac4a16a13b73c`  
**Live URL:** https://jerry200176-png.github.io/korea-trip-plan/  
**PDF URL:** https://jerry200176-png.github.io/korea-trip-plan/downloads/korea-trip-handbook.pdf  
**Emergency PDF:** https://jerry200176-png.github.io/korea-trip-plan/downloads/emergency-pack.pdf  

---

## Why READY was reverted

Independent final-product review found rendering / evidence blockers:

1. Visible `PDFSEC:*` in reader PDF text  
2. Broken CJK in PDF footers and functional SVGs (system-font `<img>` SVGs)  
3. Internal visual-function labels in reader output (Orient / Explain / Warn / Rescue / Compare / Identify / Remember)  
4. Emergency Pack near-blank second page  
5. Stale evidence (`final_audit: in_pr`, packet “main SHA” drift)

**Do not restore** `READY FOR JERRY & NIKITA ACCEPTANCE` until an independent reviewer inspects rendered pages and clears blockers.

---

## Scorecard (repair posture — not inflated)

| Dimension | Score | Max | Notes |
|-----------|------:|----:|-------|
| Research depth | 18 | 20 | unchanged |
| Factual trust | 11 | 15 | unchanged |
| Personalization | 19 | 20 | unchanged |
| Itinerary logic | 14 | 15 | unchanged |
| Visual teaching | **pending_revalidation** | 15 | prior 15/15 **invalidated** until diagram/footer CJK + label scrub re-verified |
| Website UX | 9 | 10 | unchanged |
| Publication | **pending_revalidation** | 5 | prior 5/5 **invalidated** until PDFSEC-free PDF + Emergency Pack + evidence repair re-verified |
| **Overall** | **pending_revalidation** | **100** | prior 91 invalidated with Visual/Publication |
| P0 open | **0** | — | PASS |
| Textbook Final Exit met | **false** | — | awaits human review after READY |

Itinerary decisions, destinations, and research scope were **not** changed in this repair.

---

## Repair evidence index

| Artifact | Path |
|----------|------|
| Full Textbook PDF | `docs/design-proof/korea-trip-handbook.pdf` |
| Emergency Pack PDF | `docs/design-proof/emergency-pack.pdf` |
| Section manifest (machine-only) | `docs/design-proof/pdf-section-manifest.json` |
| PDF text / reader scan | `docs/design-proof/READER_FACING_SCAN.txt` |
| SVG reader-facing scan | `docs/design-proof/SVG_READER_FACING_SCAN.txt` |
| Font embedding report | `docs/design-proof/FONT_EMBEDDING_REPORT.md` |
| PDF CJK evidence | `docs/design-proof/PDF_CJK_EVIDENCE.md` |
| 200 DPI page renders | `docs/design-proof/pdf-renders/` |
| Contact sheet (35 pages) | `docs/design-proof/pdf-contact-sheet.png` |
| PAGE_REVIEW | `docs/design-proof/PAGE_REVIEW.md` |
| Publication critic (page cites) | `docs/research/critics/final-audit/PUBLICATION_CRITIC.md` |
| Visual critic (page cites) | `docs/research/critics/final-audit/VISUAL_EDITOR_CRITIC.md` |

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
