# Textbook Correction Loop

**Updated:** 2026-07-21 (Website IA in progress)  
**Scorecard:** [`data/textbook-scorecard.yaml`](../data/textbook-scorecard.yaml) — Overall **88 / 100**  
**Epic:** [#11](https://github.com/jerry200176-png/korea-trip-plan/issues/11)

## Fixed cycle (every round / slice)

1. Audit current product  
2. Identify Top 3 highest-ROI gaps  
3. Define research questions  
4. Gather and grade evidence  
5. Update couple-fit rationale  
6. Update itinerary or visual candidates  
7. Implement a small slice  
8. Generate site and PDF (when the slice touches product surfaces)  
9. Independent critic review  
10. Fix blockers  
11. Jerry & Nikita review (at Final Acceptance Packet — not every slice)  
12. Decide next Top 3 gaps  

## Gates (do not conflate)

### Textbook Final Exit

Whole-product success bar (not CI green):

- Overall ≥ 90 / 100  
- Research depth ≥ 18 / 20  
- Personalization ≥ 18 / 20  
- Visual teaching value ≥ 13 / 15  
- No product P0  
- No unclear-license images in public outputs  
- Time-sensitive facts have `checked_at`  
- Jerry & Nikita human review has no blockers  

**Current:** `textbook_final_exit_met: false` — do **not** emit READY / Final approved.

### Round 1 Acceptance

Research-governance gate for the foundation PR — **met: true** (2026-07-21).

- Required docs exist  
- Source counts recomputable (`scripts/recount-research-sources.py`)  
- No primary-category padding (benchmarks ≠ travel depth)  
- Freshness semantics correct (no HTTP-200 ⇒ `current`)  
- Top 3 gaps have claim-level evidence map  
- Scope not expanded into itinerary/site/PDF/media  
- Independent review has no research-governance blocker  

Round 1 Acceptance **does not** require Overall ≥ 90.  
Human blockers after R1: `pending_textbook_final_acceptance` (not `pending_round_1_acceptance`).

### Round 2 Slice Exit

Each Round 2 PR closed on **slice** criteria, not Textbook Final Exit:

1. ~~Day 4 Feasibility Decision~~ — **merged** (PR #13)  
2. ~~Nikita Shopping Teaching Slice~~ — **merged** (PR #14)  
3. ~~Busan Food & Coastal Rhythm~~ — **merged** (PR #15)  
4. ~~Day 2 Hanbok & Palace Teaching~~ — **merged** (PR #16 @ `702c911`)  

Every slice PR must include: research evidence · personalized rationale · ≥1 functional diagram · independent critic · no self-merge.

## Scoring dimensions (100)

| Dimension | Max |
|-----------|-----|
| Research depth | 20 |
| Factual trust | 15 |
| Jerry & Nikita personalization | 20 |
| Itinerary logic | 15 |
| Visual teaching value | 15 |
| Website UX | 10 |
| Publication quality | 5 |

## Next Top 3 ROI gaps

1. Photo & Memory Slice  
2. Full Textbook PDF restructuring  
3. Full-product Final Audit  

Website IA Discovery is in progress on `cursor/textbook-website-ia-e48c`. Before-Trip merged (PR #20). Phase 4 re-score sync merged (PR #21 @ `861ed98`). Overall **88 / 100** after IA evidence. Textbook Final Exit unmet.

## Posture

- Do not inflate scores  
- Do not treat CI success as research completion  
- Do not self-merge Textbook Edition PRs  
- Round 1 Acceptance is closed; continue autonomous slices until Textbook Final Exit + acceptance packet  
- Control-state consistency enforced by `npm run check:control-state`  
