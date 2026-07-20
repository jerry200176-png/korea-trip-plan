/**
 * Research registry integrity + recount gate.
 * Fails CI when source/claim registries are structurally or semantically invalid.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourcesPath = path.join(root, "data/research-sources.yaml");
const claimsPath = path.join(root, "data/claim-evidence-map.yaml");

const PRIMARY = [
  "travel_factual_evidence",
  "independent_experience_evidence",
  "creator_discovery",
  "map_validation_endpoint",
  "design_publication_benchmark",
] as const;

const TIERS = ["A1", "A2", "B", "C"] as const;
const OPS_FRESH = ["needs_recheck", "unknown", "current"] as const;

const REQUIRED_SOURCE_FIELDS = [
  "source_id",
  "evidence_tier",
  "primary_category",
  "accessibility_status",
  "content_last_updated",
  "operational_freshness",
  "checked_at",
  "revalidate_by",
  "freshness_basis",
] as const;

type Source = Record<string, unknown> & { source_id: string };
type Claim = Record<string, unknown> & { claim_id: string };

function asList(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === "string");
}

function fail(errors: string[]): never {
  for (const e of errors) console.error(`ERROR: ${e}`);
  process.exit(1);
}

function main(): void {
  const errors: string[] = [];
  const data = yaml.load(fs.readFileSync(sourcesPath, "utf8")) as {
    sources?: Source[];
    blocked_sources?: Source[];
    meta?: Record<string, unknown>;
  };
  const claimDoc = yaml.load(fs.readFileSync(claimsPath, "utf8")) as {
    claims?: Claim[];
  };

  const sources = data.sources ?? [];
  const blocked = data.blocked_sources ?? [];
  const claims = claimDoc.claims ?? [];

  const usableIds = sources.map((s) => s.source_id);
  const blockedIds = blocked.map((s) => s.source_id);

  // Unique usable IDs
  const usableDupes = usableIds.filter((id, i) => usableIds.indexOf(id) !== i);
  if (usableDupes.length) errors.push(`duplicate usable source_id: ${[...new Set(usableDupes)].join(", ")}`);

  // Unique blocked IDs
  const blockedDupes = blockedIds.filter((id, i) => blockedIds.indexOf(id) !== i);
  if (blockedDupes.length) errors.push(`duplicate blocked source_id: ${[...new Set(blockedDupes)].join(", ")}`);

  // No overlap
  const overlap = usableIds.filter((id) => blockedIds.includes(id));
  if (overlap.length) errors.push(`source_id appears in both usable and blocked: ${[...new Set(overlap)].join(", ")}`);

  const primaryCounts: Record<string, number> = Object.fromEntries(PRIMARY.map((k) => [k, 0]));
  const tierCounts: Record<string, number> = Object.fromEntries(TIERS.map((k) => [k, 0]));
  const opCounts: Record<string, number> = {};
  const contentCounts: Record<string, number> = {};
  const cityCounts: Record<string, number> = {};

  for (const s of sources) {
    const id = s.source_id;
    for (const field of REQUIRED_SOURCE_FIELDS) {
      if (s[field] === undefined || s[field] === null || s[field] === "") {
        errors.push(`${id}: missing required field ${field}`);
      }
    }

    const tier = String(s.evidence_tier ?? "");
    if (!TIERS.includes(tier as (typeof TIERS)[number])) {
      errors.push(`${id}: evidence_tier must be A1|A2|B|C, got ${tier}`);
    } else {
      tierCounts[tier] += 1;
    }

    const primary = String(s.primary_category ?? "");
    if (!PRIMARY.includes(primary as (typeof PRIMARY)[number])) {
      errors.push(`${id}: invalid primary_category ${primary}`);
    } else {
      primaryCounts[primary] += 1;
    }

    const op = String(s.operational_freshness ?? "");
    if (!OPS_FRESH.includes(op as (typeof OPS_FRESH)[number])) {
      errors.push(`${id}: invalid operational_freshness ${op}`);
    }
    opCounts[op] = (opCounts[op] ?? 0) + 1;

    const content = String(s.content_last_updated ?? "");
    contentCounts[content] = (contentCounts[content] ?? 0) + 1;

    const city = String(s.city ?? "unknown");
    cityCounts[city] = (cityCounts[city] ?? 0) + 1;

    // Legacy field forbidden
    if (s.freshness === "current") {
      errors.push(`${id}: legacy freshness:current is forbidden`);
    }

    // HTTP-alone current is forbidden
    const basis = String(s.freshness_basis ?? "");
    if (op === "current") {
      const httpAlone =
        /HTTP/i.test(basis) &&
        (/alone/i.test(basis) || /title/i.test(basis) || /reachability only/i.test(basis));
      if (httpAlone || basis.trim() === "") {
        errors.push(
          `${id}: operational_freshness:current is not allowed when freshness_basis is empty or HTTP/title reachability alone`,
        );
      }
    }
  }

  const primarySum = Object.values(primaryCounts).reduce((a, b) => a + b, 0);
  if (primarySum !== sources.length) {
    errors.push(`primary_category sum ${primarySum} != usable total ${sources.length}`);
  }

  const tierSum = Object.values(tierCounts).reduce((a, b) => a + b, 0);
  if (tierSum !== sources.length) {
    errors.push(`evidence_tier sum ${tierSum} != usable total ${sources.length}`);
  }

  const usableSet = new Set(usableIds);
  const blockedSet = new Set(blockedIds);

  for (const c of claims) {
    const cid = c.claim_id;
    if (!cid) {
      errors.push("claim missing claim_id");
      continue;
    }

    // Legacy mixed list forbidden
    if (c.source_ids !== undefined) {
      errors.push(`${cid}: legacy source_ids is forbidden; use role-split fields`);
    }

    const supporting = asList(c.supporting_source_ids);
    const discovery = asList(c.discovery_source_ids);
    const blockedRefs = asList(c.blocked_source_ids);
    const contradicting = asList(c.contradicting_source_ids);
    const missing = asList(c.missing_evidence_requirements);

    if (!Array.isArray(c.supporting_source_ids)) errors.push(`${cid}: supporting_source_ids must be an array`);
    if (!Array.isArray(c.discovery_source_ids)) errors.push(`${cid}: discovery_source_ids must be an array`);
    if (!Array.isArray(c.blocked_source_ids)) errors.push(`${cid}: blocked_source_ids must be an array`);
    if (!Array.isArray(c.contradicting_source_ids)) errors.push(`${cid}: contradicting_source_ids must be an array`);
    if (!Array.isArray(c.missing_evidence_requirements)) {
      errors.push(`${cid}: missing_evidence_requirements must be an array`);
    }

    for (const id of supporting) {
      if (!usableSet.has(id)) errors.push(`${cid}: supporting_source_ids contains non-usable id ${id}`);
      if (blockedSet.has(id)) errors.push(`${cid}: supporting_source_ids must not include blocked id ${id}`);
    }
    for (const id of discovery) {
      if (!usableSet.has(id)) errors.push(`${cid}: discovery_source_ids contains unknown usable id ${id}`);
    }
    for (const id of contradicting) {
      if (!usableSet.has(id)) errors.push(`${cid}: contradicting_source_ids contains unknown usable id ${id}`);
    }
    for (const id of blockedRefs) {
      if (!blockedSet.has(id)) errors.push(`${cid}: blocked_source_ids contains id not in blocked registry: ${id}`);
    }

    // Blocked sources must not inflate confidence
    const confidence = String(c.confidence ?? "");
    if ((confidence === "Medium" || confidence === "High") && supporting.length === 0) {
      errors.push(`${cid}: confidence ${confidence} requires at least one supporting_source_ids entry`);
    }
    if ((confidence === "Medium" || confidence === "High") && blockedRefs.length > 0 && supporting.length === 0) {
      errors.push(`${cid}: blocked sources must not elevate confidence without supporting usable sources`);
    }
    if (missing.length === 0 && String(c.claim_id).includes("missing")) {
      // soft: gap-named claims should declare missing requirements
      errors.push(`${cid}: gap-oriented claim must declare missing_evidence_requirements`);
    }

    void discovery;
  }

  if (errors.length) fail(errors);

  const cMeta = (data.meta?.tier_c_diversity ?? {}) as Record<string, unknown>;
  console.log("## Research registry recount");
  console.log(`total_sources_with_primary: ${sources.length}`);
  console.log("### primary_category");
  for (const k of PRIMARY) console.log(`- ${k}: ${primaryCounts[k]}`);
  console.log(`- blocked_sources: ${blocked.length}`);
  console.log("### evidence_tier");
  for (const k of TIERS) console.log(`- ${k}: ${tierCounts[k]}`);
  console.log("### operational_freshness");
  for (const k of Object.keys(opCounts).sort()) console.log(`- ${k}: ${opCounts[k]}`);
  console.log("### content_last_updated");
  for (const k of Object.keys(contentCounts).sort()) console.log(`- ${k}: ${contentCounts[k]}`);
  console.log("### city");
  for (const [k, v] of Object.entries(cityCounts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))) {
    console.log(`- ${k}: ${v}`);
  }
  console.log("### tier_c_diversity");
  console.log(`- direct_youtube_sources_readable: ${cMeta.direct_youtube_sources_readable ?? 0}`);
  console.log(`- direct_instagram_sources_readable: ${cMeta.direct_instagram_sources_readable ?? 0}`);
  console.log(`- blog_sources_readable: ${cMeta.blog_sources_readable ?? 0}`);
  console.log(
    `- blocked_creator_sources: ${
      cMeta.blocked_creator_sources ??
      blocked.filter((b) => b.blocked_class === "creator").length
    }`,
  );
  console.log(`### claims: ${claims.length}`);
  console.log("check-research-registry OK");
}

main();
