#!/usr/bin/env python3
"""Recompute research source counts from data/research-sources.yaml (primary_category unique)."""
from __future__ import annotations

import sys
from collections import Counter
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[1]
PATH = ROOT / "data" / "research-sources.yaml"

PRIMARY = [
    "travel_factual_evidence",
    "independent_experience_evidence",
    "creator_discovery",
    "map_validation_endpoint",
    "design_publication_benchmark",
]


def main() -> int:
    data = yaml.safe_load(PATH.read_text())
    sources = data.get("sources") or []
    blocked = data.get("blocked_sources") or []
    primary = Counter(s.get("primary_category") for s in sources)
    tiers = Counter(s.get("evidence_tier") for s in sources)
    op = Counter(s.get("operational_freshness") for s in sources)
    content = Counter(s.get("content_last_updated") for s in sources)
    cities = Counter(s.get("city") for s in sources)

    if sum(primary.values()) != len(sources):
        print("ERROR: primary_category count mismatch", file=sys.stderr)
        return 1
    missing = [s["source_id"] for s in sources if s.get("primary_category") not in PRIMARY]
    if missing:
        print("ERROR: invalid primary_category on", missing, file=sys.stderr)
        return 1
    bad_fresh = [s["source_id"] for s in sources if s.get("operational_freshness") == "current" and "HTTP" in (s.get("freshness_basis") or "") and "alone" in (s.get("freshness_basis") or "").lower()]
    # Hard rule: no source may use legacy freshness:current from HTTP alone
    legacy = [s["source_id"] for s in sources if s.get("freshness") == "current"]
    if legacy:
        print("ERROR: legacy freshness:current still present", legacy, file=sys.stderr)
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
    print(f"- blocked_creator_sources: {c_meta.get('blocked_creator_sources', sum(1 for b in blocked if b.get('blocked_class')=='creator'))}")
    print("OK")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
