# Photo & Memory — Independent Critic

**PR branch:** `cursor/textbook-photo-memory-e48c`  
**PR:** #23  
**Critic context:** fresh-context review (not PR author)  
**Reviewed head:** `045d378` (feat `1a3502f` + prior critic stub)  
**Evidence read:** `PHOTO_MEMORY_TEXTBOOK.md`, `data/photo-memory.yaml`, `data/couple-profile.yaml`, `data/media.yaml` (six photo assets), `data/textbook-scorecard.yaml`, `site/src/pages/photo.astro`, `days/[day].astro`, `today/[day].astro`, `phrases.astro`, `review/index.astro`, `guide-links.ts`, `scripts/generate-pdfs.ts`, six `media/diagrams/photo-*.svg`  
**Verdict:** **PASS**

## Acceptance matrix

| # | Criterion | Verdict | Evidence |
|---|-----------|---------|----------|
| 1 | Couple / polaroid primary; memory secondary | **PASS** | `couple_photo_ratio_target: 0.8`; `/photo/` opens with device + framing/handoff/polaroid before memory cards; day plans lead with `primary_moment`; ≤2 natural `memory_prompts` per day |
| 2 | No fictional romance; no appearance comparison | **PASS** | Explicit bans in yaml header, `photo.astro`, PDF chapter, SVG captions (`不比較外貌／身材`, `不虛構對話／浪漫台詞`). Prompts are practical (留下什麼／最好吃／意外／不完美照片), not romantic scripts |
| 3 | Day 1–7 plans complete; seasonal light only | **PASS** | All seven days have primary, rain backup, device, orientation, composition, light/crowd, ask_stranger, etiquette, worth_if_tired, prompts. Light notes are March principles (`三月室內燈` / `不假造日落時刻`); no invented exact sunset times |
| 4 | Devices: Jerry iPhone 14 / Nikita iPhone 17 Pro / polaroid | **PASS** | `photo-memory.yaml` meta + `couple-profile.recording.devices_confirmed` + hub copy + PDF + mobile-smoke needles |
| 5 | Six functional visuals (Orient/Explain/Identify/Warn/Remember) | **PASS** | `photo-couple-framing-guide`, `photo-phone-handoff-timer`, `photo-instant-budget-card`, `photo-rainy-day-guide`, `photo-memory-card-system`, `photo-privacy-etiquette-warn` — each labels required functions; shape diagrams only |
| 6 | Surfaces: `/photo/` + days + Review + PDF | **PASS** | Hub page; day photo section; Review chip; PDF Photo & Memory chapter with all six diagrams. Also Guides hub, Phrases 請人拍照, packing link (support) |
| 7 | Today first screen not emotionalized | **PASS** | `today/[day].astro` first `h2` remains `今天只做這件事`; no memory prompts or photo teaching on Today. Photo/memory lives on `/photo/` and Day pages only |
| 8 | Scores personalization 19 · visual 15 · overall 90; Final Exit unmet | **PASS** | Dimension sum 90; `gates.textbook_final_exit.met: false`; `totals.textbook_final_exit_met: false`; delta 88→90 documented; human review / publication / time-sensitive / D1 still open |
| 9 | No Booking Ready / Final approved | **PASS** | Scorecard notes forbid claims; loop still says do not emit READY; `check:control-state` OK |
| 10 | Media license OK for original SVGs | **PASS** | All six: `license: Original work for this project`, `generation_tool: null`, `status: Approved`; `media/diagrams` ↔ `site/public/media` byte-identical; no external image embeds |

## Blockers

**None.**

## Soft residuals (non-blocking)

- Compact PDF Photo chapter only — full Textbook PDF restructuring remains next Top-3 ROI gap.
- Overall 90 does **not** meet Textbook Final Exit (publication floor, human review, time-sensitive coverage, D1 dates).
- Day pages place photo/memory after rain/low-energy blocks (correct teaching surface); not on Today.

## Squash-merge

**Allowed after CI green.** Photo & Memory Founder criteria for this slice are met; do not treat as Final Exit or Booking Ready.
