/**
 * Formal negative/positive fixtures for research freshness + claim role gates.
 * Exit non-zero if any expected-fail case passes or any expected-pass case fails.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import { validateRegistry, type ClaimsDoc, type RegistryDoc, type Source } from "./lib/research-registry.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fixtureRoot = path.join(root, "scripts/fixtures/research-registry");

function deepClone<T>(v: T): T {
  return structuredClone(v);
}

function baseSource(overrides: Partial<Source> = {}): Source {
  return {
    source_id: "rs-fixture-001",
    source_type: "government",
    title: "Fixture official notice",
    publisher_or_creator: "Fixture Authority",
    url: "https://example.test/notice",
    publish_date: "2026-07-01",
    accessed_at: "2026-07-20",
    language: "en",
    city: "National",
    topic: ["fixture"],
    summary: "Fixture source for freshness gate tests.",
    findings: ["Synthetic fixture only."],
    sponsorship_bias_risk: "low",
    copyright_usage_rule: "facts_ok_no_copy",
    evidence_tier: "A1",
    primary_category: "travel_factual_evidence",
    category_tags: ["travel_factual_evidence"],
    jerry_relevance: "Fixture",
    nikita_relevance: "Fixture",
    claims_requiring_official_verification: [],
    corroborating_source_ids: [],
    accessibility_status: "accessible",
    content_last_updated: "2026-07-15",
    operational_freshness: "needs_recheck",
    checked_at: "2026-07-20",
    revalidate_by: "2026-10-18",
    freshness_basis: "Reviewed page; update date confirmed on notice header.",
    freshness_basis_type: "dated_official_notice",
    ...overrides,
  };
}

function baseRegistry(sourceOverrides: Partial<Source> = {}): RegistryDoc {
  return {
    meta: { purpose: "fixture" },
    sources: [baseSource(sourceOverrides)],
    blocked_sources: [
      {
        source_id: "rs-blocked-fixture-001",
        url: "https://example.test/blocked",
        reason: "Fixture blocked source",
        attempted_at: "2026-07-20",
        accessibility_status: "blocked",
        blocked_class: "other",
        content_last_updated: "unknown",
        operational_freshness: "unknown",
        checked_at: "2026-07-20",
        freshness_basis: "blocked fixture",
      },
    ],
  };
}

function baseClaims(overrides: Partial<ClaimsDoc["claims"] extends (infer C)[] | undefined ? C : never> = {}): ClaimsDoc {
  return {
    claims: [
      {
        claim_id: "clm-fixture-1",
        claim: "Fixture claim",
        supporting_source_ids: ["rs-fixture-001"],
        discovery_source_ids: [],
        blocked_source_ids: [],
        contradicting_source_ids: [],
        missing_evidence_requirements: [],
        confidence: "Medium",
        checked_at: "2026-07-20",
        requires_revalidation: true,
        affected_day: "Day 0",
        jerry_relevance: "Fixture",
        nikita_relevance: "Fixture",
        ...overrides,
      },
    ],
  };
}

type Case = {
  id: string;
  expect: "fail" | "pass";
  build: () => { registry: RegistryDoc; claims: ClaimsDoc };
};

const cases: Case[] = [
  {
    id: "neg-current-http-200",
    expect: "fail",
    build: () => ({
      registry: baseRegistry({
        operational_freshness: "current",
        freshness_basis_type: "dated_official_notice",
        freshness_basis: "HTTP 200 response observed",
        content_last_updated: "2026-07-15",
      }),
      claims: baseClaims(),
    }),
  },
  {
    id: "neg-current-http-200-ok",
    expect: "fail",
    build: () => ({
      registry: baseRegistry({
        operational_freshness: "current",
        freshness_basis_type: "dated_official_notice",
        freshness_basis: "Got HTTP 200 OK from curl",
        content_last_updated: "2026-07-15",
      }),
      claims: baseClaims(),
    }),
  },
  {
    id: "neg-current-page-reachable",
    expect: "fail",
    build: () => ({
      registry: baseRegistry({
        operational_freshness: "current",
        freshness_basis_type: "dated_official_notice",
        freshness_basis: "page reachable on 2026-07-20",
        content_last_updated: "2026-07-15",
      }),
      claims: baseClaims(),
    }),
  },
  {
    id: "neg-current-title-present",
    expect: "fail",
    build: () => ({
      registry: baseRegistry({
        operational_freshness: "current",
        freshness_basis_type: "dated_official_notice",
        freshness_basis: "title present in HTML head",
        content_last_updated: "2026-07-15",
      }),
      claims: baseClaims(),
    }),
  },
  {
    id: "neg-current-content-unknown",
    expect: "fail",
    build: () => ({
      registry: baseRegistry({
        operational_freshness: "current",
        freshness_basis_type: "dated_official_notice",
        freshness_basis: "Official notice reviewed; date confirmed on page.",
        content_last_updated: "unknown",
      }),
      claims: baseClaims(),
    }),
  },
  {
    id: "neg-current-invalid-date",
    expect: "fail",
    build: () => ({
      registry: baseRegistry({
        operational_freshness: "current",
        freshness_basis_type: "dated_official_notice",
        freshness_basis: "Official notice reviewed; date confirmed on page.",
        content_last_updated: "2026-13-40",
      }),
      claims: baseClaims(),
    }),
  },
  {
    id: "neg-current-revalidate-before-checked",
    expect: "fail",
    build: () => ({
      registry: baseRegistry({
        operational_freshness: "current",
        freshness_basis_type: "dated_official_notice",
        freshness_basis: "Official notice reviewed; date confirmed on page.",
        content_last_updated: "2026-07-15",
        checked_at: "2026-07-20",
        revalidate_by: "2026-07-10",
      }),
      claims: baseClaims(),
    }),
  },
  {
    id: "neg-current-http-reachability-type",
    expect: "fail",
    build: () => ({
      registry: baseRegistry({
        operational_freshness: "current",
        freshness_basis_type: "http_reachability_only",
        freshness_basis: "Official notice reviewed; date confirmed on page.",
        content_last_updated: "2026-07-15",
      }),
      claims: baseClaims(),
    }),
  },
  {
    id: "neg-blocked-in-supporting",
    expect: "fail",
    build: () => ({
      registry: baseRegistry(),
      claims: baseClaims({
        supporting_source_ids: ["rs-blocked-fixture-001"],
        confidence: "Low",
      }),
    }),
  },
  {
    id: "neg-legacy-source-ids",
    expect: "fail",
    build: () => ({
      registry: baseRegistry(),
      claims: {
        claims: [
          {
            claim_id: "clm-fixture-legacy",
            claim: "Legacy field must fail",
            source_ids: ["rs-fixture-001"],
            supporting_source_ids: ["rs-fixture-001"],
            discovery_source_ids: [],
            blocked_source_ids: [],
            contradicting_source_ids: [],
            missing_evidence_requirements: [],
            confidence: "Medium",
            checked_at: "2026-07-20",
            requires_revalidation: true,
            affected_day: "Day 0",
            jerry_relevance: "Fixture",
            nikita_relevance: "Fixture",
          },
        ],
      },
    }),
  },
  {
    id: "pos-dated-official-notice",
    expect: "pass",
    build: () => ({
      registry: baseRegistry({
        operational_freshness: "current",
        freshness_basis_type: "dated_official_notice",
        freshness_basis: "Dated official notice header confirms update on 2026-07-15.",
        content_last_updated: "2026-07-15",
        checked_at: "2026-07-20",
        revalidate_by: "2026-10-18",
        accessibility_status: "accessible",
      }),
      claims: baseClaims(),
    }),
  },
  {
    id: "pos-operator-live-data",
    expect: "pass",
    build: () => ({
      registry: baseRegistry({
        source_id: "rs-fixture-002",
        source_type: "venue_official",
        operational_freshness: "current",
        freshness_basis_type: "operator_live_data",
        freshness_basis: "Operator schedule board shows live hours for 2026-07-20.",
        content_last_updated: "2026-07-20",
        checked_at: "2026-07-20",
        revalidate_by: "2026-08-19",
        accessibility_status: "accessible",
      }),
      claims: baseClaims({ supporting_source_ids: ["rs-fixture-002"] }),
    }),
  },
  {
    id: "pos-direct-provider-confirmation",
    expect: "pass",
    build: () => ({
      registry: baseRegistry({
        source_id: "rs-fixture-003",
        source_type: "venue_official",
        operational_freshness: "current",
        freshness_basis_type: "direct_provider_confirmation",
        freshness_basis: "Provider booking page confirms slot rules updated 2026-07-18.",
        content_last_updated: "2026-07-18",
        checked_at: "2026-07-20",
        revalidate_by: "2026-08-19",
        accessibility_status: "accessible",
      }),
      claims: baseClaims({ supporting_source_ids: ["rs-fixture-003"] }),
    }),
  },
];

function writeFixture(caseId: string, registry: RegistryDoc, claims: ClaimsDoc): void {
  const dir = path.join(fixtureRoot, caseId);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "research-sources.yaml"), yaml.dump(registry, { lineWidth: 120 }));
  fs.writeFileSync(path.join(dir, "claim-evidence-map.yaml"), yaml.dump(claims, { lineWidth: 120 }));
}

function main(): void {
  fs.mkdirSync(fixtureRoot, { recursive: true });
  let failures = 0;

  for (const c of cases) {
    const built = c.build();
    const registry = deepClone(built.registry);
    const claims = deepClone(built.claims);
    writeFixture(c.id, registry, claims);
    const result = validateRegistry(registry, claims);
    const passed = result.ok;
    const ok = c.expect === "pass" ? passed : !passed;
    if (!ok) {
      failures += 1;
      console.error(
        `FAIL ${c.id}: expected ${c.expect}, got ${passed ? "pass" : "fail"}` +
          (result.errors.length ? `\n  errors: ${result.errors.join(" | ")}` : ""),
      );
    } else {
      console.log(`OK ${c.id}: ${c.expect}`);
    }
  }

  // Also validate live registry still passes under the same semantics.
  const liveRegistry = yaml.load(
    fs.readFileSync(path.join(root, "data/research-sources.yaml"), "utf8"),
  ) as RegistryDoc;
  const liveClaims = yaml.load(
    fs.readFileSync(path.join(root, "data/claim-evidence-map.yaml"), "utf8"),
  ) as ClaimsDoc;
  const live = validateRegistry(liveRegistry, liveClaims);
  if (!live.ok) {
    failures += 1;
    console.error(`FAIL live-registry: ${live.errors.join(" | ")}`);
  } else {
    console.log("OK live-registry: pass");
  }

  if (failures) {
    console.error(`test-research-registry-freshness: ${failures} failure(s)`);
    process.exit(1);
  }
  console.log(`test-research-registry-freshness OK (${cases.length} fixtures + live)`);
}

// Keep tmp dir reference unused-clean for lint environments
void os.tmpdir;
main();
