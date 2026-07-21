# Textbook Correction Loop

**Updated:** 2026-07-20 (Research Quality Correction)  
**Scorecard:** [`data/textbook-scorecard.yaml`](../data/textbook-scorecard.yaml)  
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
11. Jerry & Nikita review  
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

### Round 1 Acceptance

Research-governance gate for the foundation PR:

- Required docs exist  
- Source counts recomputable (`scripts/recount-research-sources.py`)  
- No primary-category padding (benchmarks ≠ travel depth)  
- Freshness semantics correct (no HTTP-200 ⇒ `current`)  
- Top 3 gaps have claim-level evidence map  
- Scope not expanded into itinerary/site/PDF/media  
- Independent review has no research-governance blocker  

Round 1 Acceptance **does not** require Overall ≥ 90.

### Round 2 Slice Exit

Each Round 2 PR closes on **slice** criteria, not Textbook Final Exit:

1. ~~Day 4 Feasibility Decision~~ (merged)
2. ~~Nikita Shopping Teaching Slice~~ (Round 2B in progress)  
3. Busan Food & Coastal Rhythm  

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

## Posture

- Do not inflate scores  
- Do not treat CI success as research completion  
- Do not self-merge Textbook Edition PRs  
- Do not start Round 2 implementation until Jerry accepts Round 1
