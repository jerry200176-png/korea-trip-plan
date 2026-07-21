/**
 * Shared research-registry validation semantics for CI gate + mutation tests.
 * Freshness for `current` is governed by freshness_basis_type + dates, not keyword guessing alone.
 */
import yaml from "js-yaml";

export const PRIMARY = [
  "travel_factual_evidence",
  "independent_experience_evidence",
  "creator_discovery",
  "map_validation_endpoint",
  "design_publication_benchmark",
] as const;

export const TIERS = ["A1", "A2", "B", "C"] as const;
export const OPS_FRESH = ["needs_recheck", "unknown", "current"] as const;
export const BASIS_TYPES = [
  "http_reachability_only",
  "page_review_no_update_date",
  "dated_official_notice",
  "operator_live_data",
  "direct_provider_confirmation",
  "unknown",
] as const;

export const CURRENT_ALLOWED_BASIS_TYPES = [
  "dated_official_notice",
  "operator_live_data",
  "direct_provider_confirmation",
] as const;

/** Phrases that must never justify operational_freshness:current */
export const FORBIDDEN_CURRENT_BASIS_PHRASES = [
  "HTTP 200",
  "HTTP 200 OK",
  "curl success",
  "page reachable",
  "title present",
  "search result exists",
  "URL works",
  "content accessible but update date unknown",
] as const;

export const REQUIRED_SOURCE_FIELDS = [
  "source_id",
  "evidence_tier",
  "primary_category",
  "accessibility_status",
  "content_last_updated",
  "operational_freshness",
  "checked_at",
  "revalidate_by",
  "freshness_basis",
  "freshness_basis_type",
] as const;

export type Source = Record<string, unknown> & { source_id: string };
export type Claim = Record<string, unknown> & { claim_id: string };

export type RegistryDoc = {
  sources?: Source[];
  blocked_sources?: Source[];
  meta?: Record<string, unknown>;
};

export type ClaimsDoc = {
  claims?: Claim[];
};

export type ValidateResult = {
  ok: boolean;
  errors: string[];
  recount?: Record<string, unknown>;
};

function asList(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === "string");
}

function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

function containsForbiddenCurrentPhrase(basis: string): string | null {
  const lower = basis.toLowerCase();
  for (const phrase of FORBIDDEN_CURRENT_BASIS_PHRASES) {
    if (lower.includes(phrase.toLowerCase())) return phrase;
  }
  return null;
}

export function validateRegistry(data: RegistryDoc, claimDoc: ClaimsDoc): ValidateResult {
  const errors: string[] = [];
  const sources = data.sources ?? [];
  const blocked = data.blocked_sources ?? [];
  const claims = claimDoc.claims ?? [];

  const usableIds = sources.map((s) => s.source_id);
  const blockedIds = blocked.map((s) => s.source_id);

  const usableDupes = usableIds.filter((id, i) => usableIds.indexOf(id) !== i);
  if (usableDupes.length) errors.push(`duplicate usable source_id: ${[...new Set(usableDupes)].join(", ")}`);

  const blockedDupes = blockedIds.filter((id, i) => blockedIds.indexOf(id) !== i);
  if (blockedDupes.length) errors.push(`duplicate blocked source_id: ${[...new Set(blockedDupes)].join(", ")}`);

  const overlap = usableIds.filter((id) => blockedIds.includes(id));
  if (overlap.length) {
    errors.push(`source_id appears in both usable and blocked: ${[...new Set(overlap)].join(", ")}`);
  }

  const primaryCounts: Record<string, number> = Object.fromEntries(PRIMARY.map((k) => [k, 0]));
  const tierCounts: Record<string, number> = Object.fromEntries(TIERS.map((k) => [k, 0]));
  const opCounts: Record<string, number> = {};
  const contentCounts: Record<string, number> = {};
  const cityCounts: Record<string, number> = {};
  const basisTypeCounts: Record<string, number> = {};

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

    const basisType = String(s.freshness_basis_type ?? "");
    if (!BASIS_TYPES.includes(basisType as (typeof BASIS_TYPES)[number])) {
      errors.push(`${id}: invalid freshness_basis_type ${basisType}`);
    }
    basisTypeCounts[basisType] = (basisTypeCounts[basisType] ?? 0) + 1;

    const content = String(s.content_last_updated ?? "");
    contentCounts[content] = (contentCounts[content] ?? 0) + 1;

    const city = String(s.city ?? "unknown");
    cityCounts[city] = (cityCounts[city] ?? 0) + 1;

    if (s.freshness === "current") {
      errors.push(`${id}: legacy freshness:current is forbidden`);
    }

    const basis = String(s.freshness_basis ?? "");
    const access = String(s.accessibility_status ?? "");
    const checkedAt = String(s.checked_at ?? "");
    const revalidateBy = String(s.revalidate_by ?? "");

    if (op === "current") {
      if (!CURRENT_ALLOWED_BASIS_TYPES.includes(basisType as (typeof CURRENT_ALLOWED_BASIS_TYPES)[number])) {
        errors.push(
          `${id}: operational_freshness:current requires freshness_basis_type in ${CURRENT_ALLOWED_BASIS_TYPES.join("|")}, got ${basisType}`,
        );
      }
      if (content === "unknown" || !isIsoDate(content)) {
        errors.push(`${id}: operational_freshness:current requires content_last_updated as a valid ISO date, got ${content}`);
      }
      if (!isIsoDate(checkedAt)) {
        errors.push(`${id}: operational_freshness:current requires checked_at as a valid ISO date`);
      }
      if (!isIsoDate(revalidateBy)) {
        errors.push(`${id}: operational_freshness:current requires revalidate_by as a valid ISO date`);
      }
      if (isIsoDate(checkedAt) && isIsoDate(revalidateBy) && revalidateBy < checkedAt) {
        errors.push(`${id}: revalidate_by must be >= checked_at`);
      }
      if (!basis.trim()) {
        errors.push(`${id}: operational_freshness:current requires non-empty freshness_basis`);
      }
      if (access !== "accessible") {
        errors.push(`${id}: operational_freshness:current requires accessibility_status: accessible (fully readable)`);
      }
      const forbidden = containsForbiddenCurrentPhrase(basis);
      if (forbidden) {
        errors.push(`${id}: freshness_basis contains phrase that cannot support current: "${forbidden}"`);
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
    if (c.source_ids !== undefined) {
      errors.push(`${cid}: legacy source_ids is forbidden; use role-split fields`);
    }
    for (const key of [
      "supporting_source_ids",
      "discovery_source_ids",
      "blocked_source_ids",
      "contradicting_source_ids",
      "missing_evidence_requirements",
    ] as const) {
      if (!Array.isArray(c[key])) errors.push(`${cid}: ${key} must be an array`);
    }

    const supporting = asList(c.supporting_source_ids);
    const discovery = asList(c.discovery_source_ids);
    const blockedRefs = asList(c.blocked_source_ids);
    const contradicting = asList(c.contradicting_source_ids);
    const missing = asList(c.missing_evidence_requirements);

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

    const confidence = String(c.confidence ?? "");
    if ((confidence === "Medium" || confidence === "High") && supporting.length === 0) {
      errors.push(`${cid}: confidence ${confidence} requires at least one supporting_source_ids entry`);
    }
    if ((confidence === "Medium" || confidence === "High") && blockedRefs.length > 0 && supporting.length === 0) {
      errors.push(`${cid}: blocked sources must not elevate confidence without supporting usable sources`);
    }
    if (missing.length === 0 && String(c.claim_id).includes("missing")) {
      errors.push(`${cid}: gap-oriented claim must declare missing_evidence_requirements`);
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    recount: {
      usable: sources.length,
      blocked: blocked.length,
      claims: claims.length,
      primaryCounts,
      tierCounts,
      opCounts,
      contentCounts,
      cityCounts,
      basisTypeCounts,
    },
  };
}

export function loadYamlFile(text: string): unknown {
  return yaml.load(text);
}
