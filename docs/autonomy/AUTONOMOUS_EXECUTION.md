# Autonomous Execution Harness — Korea Trip Textbook

**Purpose:** Continuous delivery loop from repair → verify → merge → deploy → audit → READY, without stopping after each PR unless a Hard Stop fires.

**Product status authority:** `data/autonomous-run-state.yaml` + `data/textbook-scorecard.yaml` + `docs/final-acceptance/FINAL_ACCEPTANCE_PACKET.md`. All three must stay honest.

## Forbidden claims (until Exit Gate evidence exists)

- READY FOR JERRY & NIKITA ACCEPTANCE (premature)
- Final approved
- Booking Ready
- Jerry & Nikita accepted
- Complete / Finished (as product claims)

## Loop (every cycle)

1. **Observe** — PR state, head, mergeability, CI (first failing command), artifacts, main SHA, Pages SHA, scorecard, queue. GitHub + artifacts + renders are source of truth; prior agent prose is not.
2. **Select** — highest-priority unblocked queue item. One coherent outcome per PR. No mega-PRs.
3. **Implement** — minimal complete root-cause fix. No report-only “passes”.
4. **Local verify** — clean `npm ci` + full `npm run ci`.
5. **GitHub verify** — wait for clean runner success, artifact upload, SHA match.
6. **Artifact inspect** — download artifact for *that* head only.
7. **Independent critic** — fresh context; cite artifact ID, head SHA, pages, screenshots.
8. **Decide** — PASS advances queue; FAIL stays on same PR, updates Failure Ledger, retries with signature rules.

## Failure signature

`<command>:<error-class>:<affected-file-or-stage>`

Retry caps: 1 = root fix · 2 = re-check env/order/cache · 3 = must change approach or Hard Stop. Never infinite same-line tweaks.

## Dynamic SHA policy

Do **not** hardcode mutable tip SHAs into files that change the tip.

| Role | Where it lives |
|------|----------------|
| product_baseline_sha | stable (e.g. PR #25 merge) |
| render_source_sha | pdf-section-manifest at generate time |
| evidence_snapshot_sha | named evidence commit role |
| ci_verified_head_sha | CI metadata / artifact name only |
| deployed_pages_sha | after Pages deploy only |
| current_head_sha | runtime / CI; `null` or `unknown_until_ci` in committed state |

## Active controls

- Queue: `data/autonomous-work-queue.yaml`
- Run state: `data/autonomous-run-state.yaml`
- Gate script: `scripts/check-autonomous-state.ts` (wired into `npm run ci`)
- Exit criteria: `docs/autonomy/EXIT_GATE.md`
- Failures: `docs/autonomy/FAILURE_LEDGER.md`
