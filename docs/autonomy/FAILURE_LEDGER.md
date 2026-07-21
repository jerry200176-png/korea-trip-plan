# Failure Ledger

Signatures use: `<command>:<error-class>:<affected-file-or-stage>`

## Active / recent

### FL-2026-07-21-01

| Field | Value |
|-------|-------|
| signature | `lint:md:MD032-blanks-around-lists:docs/design-proof/SHA_IDENTITY_TABLE.md` |
| github_run | [29808819023](https://github.com/jerry200176-png/korea-trip-plan/actions/runs/29808819023) |
| head_sha_at_failure | `9c23b8b2a9fd8559a4b9694d545fe674a9b559a4` |
| first_failing_command | `npm run lint:md` (`markdownlint-cli2`) |
| classification | formatting / markdown lint |
| local_vs_github | Local `npm run ci` previously green *before* this evidence file was committed; GitHub clean CI failed on the evidence commit that introduced MD032. |
| attempt | 1 |
| hypothesis | Notes list under `SHA_IDENTITY_TABLE.md` lacked blank line after `Notes:` heading (MD032). |
| fix | Insert blank line before the list. |
| why_different | Root cause is lint rule, not reader/PDF logic; clean CI will re-run full `npm run ci`. |
| status | fixing |

## Closed

None yet in this harness era.
