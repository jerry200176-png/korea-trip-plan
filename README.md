# Korea Trip Handbook — Jerry & 女友 韓國旅行作戰系統

> 出發前交付：**可信、可維護、手機優先、可離線**的韓國旅遊手冊。  
> 不是普通旅遊筆記，也不是即時協作白板。

## Mission

幫兩人第一次一起出國留下最美好的回憶：事先規劃清楚、控制步行與排隊、吃得好、拍得到合照，並把法規／交通／緊急資訊做成能帶出國用的產品。

## Quick start

```bash
npm ci
npm ci --prefix site
npm run ci          # Foundation Exit Gate
npm run dev         # http://localhost:4321
```

Node **22** (see `.nvmrc`).

## Source of truth

| Path | Role |
|------|------|
| `data/*.yaml` | Trip, places, restaurants, itinerary, budget, sources |
| `schemas/` | JSON Schema validation |
| `docs/` | Audit, brief, decisions, research method, privacy |
| `handbook/` | Long-form researched chapters (Markdown) |
| `checklists/` | Pre-departure / packing / emergency |
| `site/` | Astro mobile handbook |
| `scripts/` | Validate, privacy scan, stale check, PDF generation |
| `dist/` | Built site + PDFs (generated; do not hand-edit) |

## Status labels

Every important fact is tagged: `Confirmed` | `Provisional` | `Assumption` | `DecisionRequired` | `Stale`.

## Open Founder decisions

See [`docs/OPEN_DECISIONS.md`](docs/OPEN_DECISIONS.md) — dates, cities, airports only.

## Privacy

Never commit passports, full DOB, cards, booking codes, phones, or ticket QR.  
Policy: [`docs/PRIVACY_AND_DATA_POLICY.md`](docs/PRIVACY_AND_DATA_POLICY.md).

## Provisional route

**Seoul 4 nights + Busan 2 nights** — Provisional (7 days / 6 nights). Details: [`docs/ROUTE_DECISION.md`](docs/ROUTE_DECISION.md).

## Archive

Previous SyncTrip collaboration MVP lives in [`archive/synctrip-mvp/`](archive/synctrip-mvp/) for history only. It is not the product.

## Agent design skills

Installed from [taste-skill](https://github.com/Leonxlnx/taste-skill) under `.agents/skills/`:

- `design-taste-frontend` — anti-slop layout / type / motion
- `redesign-existing-projects` — audit-first UI upgrades
- `high-end-visual-design` — soft editorial polish

Reinstall:

```bash
npx skills add https://github.com/Leonxlnx/taste-skill --skill "design-taste-frontend" --skill "redesign-existing-projects" --skill "high-end-visual-design" -y
```

Also installed [Impeccable](https://github.com/pbakaus/impeccable) under `.cursor/skills/impeccable/` with product truth in `PRODUCT.md`.

```bash
npx impeccable install --providers=cursor --scope=project -y
npx impeccable detect site/src
```
