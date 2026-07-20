#!/usr/bin/env python3
"""Research registry recount + integrity gate (Python twin of check-research-registry.ts)."""
from __future__ import annotations

import sys
from collections import Counter
from pathlib import Path

try:
    import yaml
except ImportError:  # pragma: no cover
    print("ERROR: PyYAML required, or run: npm run check:research-registry", file=sys.stderr)
    raise SystemExit(1)

ROOT = Path(__file__).resolve().parents[1]
SOURCES_PATH = ROOT / "data" / "research-sources.yaml"
CLAIMS_PATH = ROOT / "data" / "claim-evidence-map.yaml"

PRIMARY = [
    "travel_factual_evidence",
    "independent_experience_evidence",
    "creator_discovery",
    "map_validation_endpoint",
    "design_publication_benchmark",
]
TIERS = {"A1", "A2", "B", "C"}
OPS = {"needs_recheck", "unknown", "current"}
REQUIRED = [
    "source_id",
    "evidence_tier",
    "primary_category",
    "accessibility_status",
    "content_last_updated",
    "operational_freshness",
    "checked_at",
    "revalidate_by",
    "freshness_basis",
]


def main() -> int:
    errors: list[str] = []
    data = yaml.safe_load(SOURCES_PATH.read_text())
    claim_doc = yaml.safe_load(CLAIMS_PATH.read_text())
    sources = data.get("sources") or []
    blocked = data.get("blocked_sources") or []
    claims = claim_doc.get("claims") or []

    usable_ids = [s.get("source_id") for s in sources]
    blocked_ids = [b.get("source_id") for b in blocked]

    if len(usable_ids) != len(set(usable_ids)):
        errors.append(f"duplicate usable source_id: {[x for x in usable_ids if usable_ids.count(x) > 1]}")
    if len(blocked_ids) != len(set(blocked_ids)):
        errors.append(f"duplicate blocked source_id: {[x for x in blocked_ids if blocked_ids.count(x) > 1]}")
    overlap = set(usable_ids) & set(blocked_ids)
    if overlap:
        errors.append(f"source_id in both usable and blocked: {sorted(overlap)}")

    primary = Counter()
    tiers = Counter()
    op = Counter()
    content = Counter()
    cities = Counter()

    for s in sources:
        sid = s.get("source_id")
        for field in REQUIRED:
            if s.get(field) in (None, ""):
                errors.append(f"{sid}: missing required field {field}")
        tier = s.get("evidence_tier")
        if tier not in TIERS:
            errors.append(f"{sid}: evidence_tier must be A1|A2|B|C, got {tier}")
        else:
            tiers[tier] += 1
        p = s.get("primary_category")
        if p not in PRIMARY:
            errors.append(f"{sid}: invalid primary_category {p}")
        else:
            primary[p] += 1
        ops = s.get("operational_freshness")
        if ops not in OPS:
            errors.append(f"{sid}: invalid operational_freshness {ops}")
        op[ops] += 1
        content[s.get("content_last_updated")] += 1
        cities[s.get("city")] += 1

        if s.get("freshness") == "current":
            errors.append(f"{sid}: legacy freshness:current is forbidden")

        basis = s.get("freshness_basis") or ""
        if ops == "current":
            http_alone = ("HTTP" in basis) and (
                "alone" in basis.lower() or "title" in basis.lower() or "reachability only" in basis.lower()
            )
            if http_alone or not str(basis).strip():
                errors.append(
                    f"{sid}: operational_freshness:current forbidden when freshness_basis empty or HTTP/title alone"
                )

    if sum(primary.values()) != len(sources):
        errors.append(f"primary_category sum {sum(primary.values())} != usable total {len(sources)}")
    if sum(tiers.values()) != len(sources):
        errors.append(f"evidence_tier sum {sum(tiers.values())} != usable total {len(sources)}")

    usable_set = set(usable_ids)
    blocked_set = set(blocked_ids)

    for c in claims:
        cid = c.get("claim_id") or "<missing-claim_id>"
        if "source_ids" in c:
            errors.append(f"{cid}: legacy source_ids is forbidden; use role-split fields")
        for key in (
            "supporting_source_ids",
            "discovery_source_ids",
            "blocked_source_ids",
            "contradicting_source_ids",
            "missing_evidence_requirements",
        ):
            if not isinstance(c.get(key), list):
                errors.append(f"{cid}: {key} must be an array")

        supporting = c.get("supporting_source_ids") or []
        discovery = c.get("discovery_source_ids") or []
        blocked_refs = c.get("blocked_source_ids") or []
        contradicting = c.get("contradicting_source_ids") or []
        missing = c.get("missing_evidence_requirements") or []

        for sid in supporting:
            if sid not in usable_set:
                errors.append(f"{cid}: supporting_source_ids contains non-usable id {sid}")
            if sid in blocked_set:
                errors.append(f"{cid}: supporting_source_ids must not include blocked id {sid}")
        for sid in discovery:
            if sid not in usable_set:
                errors.append(f"{cid}: discovery_source_ids contains unknown usable id {sid}")
        for sid in contradicting:
            if sid not in usable_set:
                errors.append(f"{cid}: contradicting_source_ids contains unknown usable id {sid}")
        for sid in blocked_refs:
            if sid not in blocked_set:
                errors.append(f"{cid}: blocked_source_ids not in blocked registry: {sid}")

        confidence = c.get("confidence")
        if confidence in ("Medium", "High") and not supporting:
            errors.append(f"{cid}: confidence {confidence} requires supporting_source_ids")
        if confidence in ("Medium", "High") and blocked_refs and not supporting:
            errors.append(f"{cid}: blocked sources must not elevate confidence without supporting usable sources")
        if "missing" in str(c.get("claim_id", "")) and not missing:
            errors.append(f"{cid}: gap-oriented claim must declare missing_evidence_requirements")

    if errors:
        for e in errors:
            print(f"ERROR: {e}", file=sys.stderr)
        return 1

    c_meta = (data.get("meta") or {}).get("tier_c_diversity") or {}
    print("## Recount")
    print(f"total_sources_with_primary: {len(sources)}")
    print("### primary_category")
    for k in PRIMARY:
        print(f"- {k}: {primary.get(k, 0)}")
    print(f"- blocked_sources: {len(blocked)}")
    print("### evidence_tier")
    for k in ("A1", "A2", "B", "C"):
        print(f"- {k}: {tiers.get(k, 0)}")
    print("### operational_freshness")
    for k in sorted(op):
        print(f"- {k}: {op[k]}")
    print("### content_last_updated")
    for k in sorted(content):
        print(f"- {k}: {content[k]}")
    print("### city")
    for k, v in sorted(cities.items(), key=lambda kv: (-kv[1], str(kv[0]))):
        print(f"- {k}: {v}")
    print("### tier_c_diversity")
    print(f"- direct_youtube_sources_readable: {c_meta.get('direct_youtube_sources_readable', 0)}")
    print(f"- direct_instagram_sources_readable: {c_meta.get('direct_instagram_sources_readable', 0)}")
    print(f"- blog_sources_readable: {c_meta.get('blog_sources_readable', 0)}")
    print(
        f"- blocked_creator_sources: {c_meta.get('blocked_creator_sources', sum(1 for b in blocked if b.get('blocked_class') == 'creator'))}"
    )
    print(f"### claims: {len(claims)}")
    print("OK")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
