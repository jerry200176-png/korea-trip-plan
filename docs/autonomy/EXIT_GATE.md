# Exit Gate — stop only when READY is evidence-backed

## Product Stop Rule (all required)

- GitHub clean CI green on final head
- main CI green after squash merge
- Pages deploy green
- live site verified (home, guides, today, transport, food, before, photo, review)
- live handbook PDF + Emergency PDF verified
- Overall ≥ 90 (recomputed — never restore old 91 blindly)
- Research ≥ 18 · Personalization ≥ 18 · Visual ≥ 13
- P0 = 0
- independent full-product critics PASS (Visual + Publication restored only after their own PASS)
- reader-facing scans clean (no PDFSEC / jargon / wrong KO phrase / function labels)
- media licenses clear
- no CJK / Korean rendering blockers
- no workflow jargon on reader surfaces
- no stale control / autonomous state
- Final Acceptance Packet current
- product status = `READY FOR JERRY & NIKITA ACCEPTANCE`

## PR #26 intermediate gates

| Gate | Required before next queue item |
|------|----------------------------------|
| repair-pr26-clean-ci | GitHub CI success + artifact upload for final head |
| verify-pr26-final-artifact | Independent critic PASS on that artifact |
| restore-ready-state | Visual + Publication critics PASS; Overall recomputed ≥ 90; packet honest |
| merge-pr26 | Ready for review, mergeable, no blocking reviews, squash merge |
| verify-main-and-pages | main CI + Pages + live SHA match |
| full-product-human-readiness-audit | Website/PDF/content/honesty audit complete |
| final-polish-if-needed | Only high-ROI non-blocking polish, or skip |
| generate-final-human-acceptance-packet | Packet + 10 human questions |
| stop-for-jerry-and-nikita-review | Hard product stop — no further autonomous content |

## Hard Stop (Founder Decision)

Only for: D1 exact dates · payment/booking · PII · equal product forks · unsafe media license · missing GitHub perms · 3 distinct technical approaches fail · research overturns Seoul 4N+Busan 2N · major budget/architecture · no independent reviewer.

Then write `docs/decisions/FOUNDER_DECISION_REQUIRED.md` (blocker, attempts, evidence, A/B, recommendation, cost of no decision) — not a progress essay.
