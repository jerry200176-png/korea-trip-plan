# Couple Acceptance Test — Warm Editorial Journey

Visual review performed against `docs/design-proof/*` screenshots (agent inspected images, not file existence only). Date: 2026-07-20.

## Answers

| Question | Pass? | Evidence |
|----------|-------|----------|
| 10 秒內理解是兩人的旅行？ | **Yes** | Home hero: 「Jerry 與女友韓國旅行」+ 「第一次一起出國」 |
| 首爾四晚、釜山兩晚？ | **Yes** | Home stats「4 晚 / 2 晚」; PDF cover「首爾四晚 · 釜山兩晚」 |
| 區分已決定與暫定？ | **Yes** | 已確認 (綠) / 暫定 (金) / 待決策 (紅) text badges |
| 三次點擊內找海景、韓服、購物、GOT7、豬肉湯飯？ | **Yes** | Home「快速找到」chips → 1 click each |
| Today Mode 10 秒找下一站、地圖、Plan B、回住宿？ | **Yes** | today-mobile: 下一動、Naver Map、Plan B、回住宿 in first viewport |
| 仍像工程 Dashboard？ | **No (good)** | Warm rice canvas, serif titles, no readiness gates on Home |
| PDF 仍像 YAML dump？ | **No (good)** | Cover/TOC/day spreads with editorial hierarchy |
| 中文與韓文正確？ | **Yes** | 繁中 UI; place names `lang=ko` (경복궁 etc.) |
| 網站與 PDF 同一產品？ | **Yes** | Shared cream/ink/green/warm tokens & serif+sans |

## Accessibility notes

- Status always includes Chinese text labels (not color-only).
- Tap targets ≥ 48px on primary buttons and bottom dock.
- Emergency numbers large; contrast on danger border card.
- `lang="zh-Hant"` document; Korean snippets marked.

## Mobile usability

- Bottom dock: 首頁 / 今日 / 行程 / 決策 / 緊急.
- Design Lab excluded from couple nav.
- No horizontal overflow detected in capture script for proof pages.

## Verdict

**Couple Preview Ready** for visual design of Home, Day 2, Day 5, Today, Decisions, Emergency + PDF cover/TOC/days/emergency — pending Founder date lock (Trip Ready remains blocked by data gates).
