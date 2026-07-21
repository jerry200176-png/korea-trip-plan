# SHA identity table (PR #26 repair evidence)

Generated: 2026-07-21T06:58:53Z
Working tree tip at scan time: `b4ed52b66ce24b6a7e878207355ffc9502e261bb`
(Do not treat working-tree tip as a hardcoded packet field.)

| Role | Value | Source |
|------|-------|--------|
| product_baseline_sha | `fc7a2ff49f1ed2e32b4a10448daac4a16a13b73c` | PR #25 merge / packet |
| render_source_sha | `b4ed52b66ce24b6a7e878207355ffc9502e261bb` | `docs/design-proof/pdf-section-manifest.json` (PDF generate HEAD) |
| evidence_snapshot_sha | `e15fd89a2ed7734d97c498136b0cc2ee38ae4abf` | First evidence bundle commit on PR #26 |
| ci_verified_head_sha | *(CI metadata only — not hardcoded)* | Workflow artifact when green |
| deployed_pages_sha | unknown until Pages deploy | Populate only after deployment |

Notes:
- `render_source_sha` is the commit that was HEAD when PDFs in this evidence folder were generated.
- Committing this evidence file changes tip; tip must not be written back as a mutable `head_sha`.
- Product status remains `FINAL ACCEPTANCE REPAIR REQUIRED`.
- Visual / Publication / Overall remain `pending_revalidation`.
