/**
 * Research registry integrity + recount gate.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  loadYamlFile,
  PRIMARY,
  TIERS,
  validateRegistry,
  type ClaimsDoc,
  type RegistryDoc,
} from "./lib/research-registry.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function main(): void {
  const data = loadYamlFile(fs.readFileSync(path.join(root, "data/research-sources.yaml"), "utf8")) as RegistryDoc;
  const claimDoc = loadYamlFile(
    fs.readFileSync(path.join(root, "data/claim-evidence-map.yaml"), "utf8"),
  ) as ClaimsDoc;
  const result = validateRegistry(data, claimDoc);
  if (!result.ok) {
    for (const e of result.errors) console.error(`ERROR: ${e}`);
    process.exit(1);
  }

  const r = result.recount as {
    usable: number;
    blocked: number;
    claims: number;
    primaryCounts: Record<string, number>;
    tierCounts: Record<string, number>;
    opCounts: Record<string, number>;
    contentCounts: Record<string, number>;
    cityCounts: Record<string, number>;
    basisTypeCounts: Record<string, number>;
  };
  const cMeta = (data.meta?.tier_c_diversity ?? {}) as Record<string, unknown>;
  const blocked = data.blocked_sources ?? [];

  console.log("## Research registry recount");
  console.log(`total_sources_with_primary: ${r.usable}`);
  console.log("### primary_category");
  for (const k of PRIMARY) console.log(`- ${k}: ${r.primaryCounts[k] ?? 0}`);
  console.log(`- blocked_sources: ${r.blocked}`);
  console.log("### evidence_tier");
  for (const k of TIERS) console.log(`- ${k}: ${r.tierCounts[k] ?? 0}`);
  console.log("### operational_freshness");
  for (const k of Object.keys(r.opCounts).sort()) console.log(`- ${k}: ${r.opCounts[k]}`);
  console.log("### content_last_updated");
  for (const k of Object.keys(r.contentCounts).sort()) console.log(`- ${k}: ${r.contentCounts[k]}`);
  console.log("### freshness_basis_type");
  for (const k of Object.keys(r.basisTypeCounts).sort()) console.log(`- ${k}: ${r.basisTypeCounts[k]}`);
  console.log("### city");
  for (const [k, v] of Object.entries(r.cityCounts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))) {
    console.log(`- ${k}: ${v}`);
  }
  console.log("### tier_c_diversity");
  console.log(`- direct_youtube_sources_readable: ${cMeta.direct_youtube_sources_readable ?? 0}`);
  console.log(`- direct_instagram_sources_readable: ${cMeta.direct_instagram_sources_readable ?? 0}`);
  console.log(`- blog_sources_readable: ${cMeta.blog_sources_readable ?? 0}`);
  console.log(
    `- blocked_creator_sources: ${
      cMeta.blocked_creator_sources ?? blocked.filter((b) => b.blocked_class === "creator").length
    }`,
  );
  console.log(`### claims: ${r.claims}`);
  console.log("check-research-registry OK");
}

main();
