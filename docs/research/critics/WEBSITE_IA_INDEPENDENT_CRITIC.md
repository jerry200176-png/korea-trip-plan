# Website IA — Independent Information Architecture Critic

**PR branch:** `cursor/textbook-website-ia-e48c`  
**Critic context:** fresh-context review (not PR author self-grade)  
**Verdict:** **PASS** (pending full CI green)

## Checks

| Check | Verdict |
|-------|---------|
| Primary dock = 首頁 · 行程 · 今日 · 教材 · 驗收 | PASS |
| `/guides/` hub lists Transport, Food, Before, Shopping, Hanbok, Emergency, Phrases | PASS |
| Transport / Food / Before not More-only | PASS |
| Home discovery in first strip: journey, today, transport, food, before, review | PASS |
| Day pages expose related guides; guides link related days | PASS |
| Today first screen remains execution-first | PASS (`今天只做這件事`) |
| No blank hub pages | PASS |
| No engineering IDs / raw source IDs in nav | PASS |
| Base path `/korea-trip-plan/` preserved | PASS |
| Benchmark adopted/rejected documented | PASS (`WEBSITE_IA_DECISION.md`) |
| website_ux 8→9 with click-path evidence only (+1 overall → 88) | PASS |
| Final Exit still unmet; no READY / Booking Ready claims | PASS |

## Blockers

None for IA content. Merge when CI + mobile critic PASS.
