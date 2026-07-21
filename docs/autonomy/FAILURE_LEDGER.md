# Failure Ledger

Signatures use: `<command>:<error-class>:<affected-file-or-stage>`

## Active / recent

### FL-2026-07-21-02

| Field | Value |
|-------|-------|
| signature | `upload-artifact:sha-mismatch:github.sha-vs-pr-head` |
| github_run | [29810163269](https://github.com/jerry200176-png/korea-trip-plan/actions/runs/29810163269) |
| head_sha_at_failure | `557f89ed03e3d10f2c445e4eb55246a9b42a379d` |
| first_failing_command | _(workflow green)_ harness identity gate — artifact named with merge `github.sha` `8e04433…` ≠ PR head |
| classification | control-state / evidence identity inconsistency |
| attempt | 1 |
| hypothesis | `actions/upload-artifact` used `github.sha`, which on `pull_request` is the merge commit, not `pull_request.head.sha`. |
| fix | Resolve `artifact_sha` from PR head on pull_request; emit `dist/ci-verified-head.json`; name artifact `handbook-dist-${artifact_sha}`. |
| why_different | Fixes identity contract (`artifact head SHA == final PR head`), not a lint flake. |
| status | fixing |

## Closed

### FL-2026-07-21-01

| Field | Value |
|-------|-------|
| signature | `lint:md:MD032-blanks-around-lists:docs/design-proof/SHA_IDENTITY_TABLE.md` |
| github_run | [29808819023](https://github.com/jerry200176-png/korea-trip-plan/actions/runs/29808819023) |
| resolution | Blank line before Notes list; GitHub CI later green on `557f89e` (run 29810163269) before artifact naming issue found |
| status | closed |
