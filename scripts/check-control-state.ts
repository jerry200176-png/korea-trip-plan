/**
 * Control-state consistency gate for Textbook Edition scorecard / acceptance posture.
 * Fails on stale slice status, Round-1 leftover blockers, P0 drift, premature Final/Ready claims,
 * or malformed next Top 3 gaps. Does not change product scores.
 */
import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { root } from "./lib/root.ts";

type SliceProgress = {
  status?: string;
  merge_sha?: string;
  merged_at?: string;
  [k: string]: unknown;
};

type Scorecard = {
  gates?: {
    round_1_acceptance?: { met?: boolean };
    textbook_final_exit?: { met?: boolean };
  };
  totals?: {
    overall?: { score?: number };
    textbook_final_exit_met?: boolean;
    round_1_acceptance_met?: boolean;
  };
  p0_open?: unknown[];
  p0_closed?: Array<{ id?: string; claim_id?: string }>;
  human_review?: { jerry_nikita_blockers?: string };
  next_top3_roi_gaps?: unknown;
  round_1_top3_roi_gaps?: unknown;
  round_2_progress?: Record<string, SliceProgress>;
  acceptance_status?: string;
};

type ClaimsDoc = {
  claims?: Array<{
    claim_id?: string;
    notes?: string;
  }>;
};

const errors: string[] = [];
function fail(msg: string): void {
  errors.push(msg);
}

function loadYaml<T>(rel: string): T {
  const full = path.join(root, rel);
  return yaml.load(fs.readFileSync(full, "utf8")) as T;
}

const scorecard = loadYaml<Scorecard>("data/textbook-scorecard.yaml");
const claimsDoc = loadYaml<ClaimsDoc>("data/claim-evidence-map.yaml");

const round1Met =
  scorecard.gates?.round_1_acceptance?.met === true || scorecard.totals?.round_1_acceptance_met === true;
const finalMet =
  scorecard.gates?.textbook_final_exit?.met === true || scorecard.totals?.textbook_final_exit_met === true;

// 1) Merged slices must not stay labeled in_pr (in_pr without merge metadata is allowed for open work)
const allowedStatuses = new Set(["merged", "planned", "in_progress", "in_pr", "open", "blocked", "deferred", ""]);
const progress = scorecard.round_2_progress ?? {};
for (const [key, slice] of Object.entries(progress)) {
  const status = String(slice?.status ?? "");
  if (!allowedStatuses.has(status)) {
    fail(`round_2_progress.${key}.status has unexpected value: ${status}`);
  }
  const hasMergeMeta = Boolean(slice.merge_sha || slice.merged_at);
  if (status === "in_pr" && hasMergeMeta) {
    fail(
      `round_2_progress.${key}.status is in_pr but merge_sha/merged_at is set — merged slices must use status: merged`,
    );
  }
  if (status === "merged" && !hasMergeMeta) {
    fail(`round_2_progress.${key} is merged but missing merge_sha and merged_at`);
  }
}

// 2) After Round 1 acceptance, blocker must not say pending_round_1_acceptance
const blockers = scorecard.human_review?.jerry_nikita_blockers ?? "";
if (round1Met && blockers === "pending_round_1_acceptance") {
  fail(
    "human_review.jerry_nikita_blockers is pending_round_1_acceptance after Round 1 Acceptance — use pending_textbook_final_acceptance (or clearer post-R1 state)",
  );
}
if (round1Met && /pending_round_1_acceptance/.test(blockers)) {
  fail(`human_review.jerry_nikita_blockers still references pending_round_1_acceptance: ${blockers}`);
}

// 3) P0 open/closed consistency with scorecard + claims
const p0Open = Array.isArray(scorecard.p0_open) ? scorecard.p0_open : null;
if (p0Open === null) fail("p0_open must be an array");
const p0Closed = Array.isArray(scorecard.p0_closed) ? scorecard.p0_closed : [];
const closedIds = new Set(p0Closed.map((x) => x.id).filter(Boolean) as string[]);
const openIds = new Set(
  (p0Open ?? [])
    .map((x) => (typeof x === "string" ? x : (x as { id?: string })?.id))
    .filter(Boolean) as string[],
);

for (const id of openIds) {
  if (closedIds.has(id)) fail(`P0 ${id} appears in both p0_open and p0_closed`);
}

for (const closed of p0Closed) {
  if (closed.claim_id) {
    const claim = (claimsDoc.claims ?? []).find((c) => c.claim_id === closed.claim_id);
    if (!claim) fail(`p0_closed ${closed.id} references missing claim ${closed.claim_id}`);
  }
}

if (closedIds.has("p0-fortune-shop") && openIds.has("p0-fortune-shop")) {
  fail("p0-fortune-shop cannot be open and closed");
}
if (closedIds.has("p0-fortune-shop")) {
  const fortune = (claimsDoc.claims ?? []).find((c) => c.claim_id === "clm-fortune-shop-missing");
  const notes = fortune?.notes ?? "";
  if (/\bopen P0\b/i.test(notes) && !/P0 product-theme infeasibility closed/i.test(notes)) {
    fail("clm-fortune-shop-missing notes still describe an open P0 while p0-fortune-shop is closed");
  }
}

// 4) Premature Final approved / Booking Ready; READY FOR ACCEPTANCE is allowed as
//    pre-human-review status when floors are met but textbook_final_exit_met is false.
if (!finalMet) {
  const gMet = Boolean(scorecard.gates?.textbook_final_exit?.met);
  const tMet = Boolean(scorecard.totals?.textbook_final_exit_met);
  if (gMet !== tMet) {
    fail(`totals.textbook_final_exit_met (${tMet}) != gates.textbook_final_exit.met (${gMet})`);
  }

  const acceptanceStatus = String(scorecard.acceptance_status ?? scorecard.product_status ?? "");
  if (/\bFinal approved\b/i.test(acceptanceStatus) || /\bBooking Ready\b/i.test(acceptanceStatus)) {
    fail(`scorecard status claims ${acceptanceStatus} while Textbook Final Exit is unmet`);
  }
  if (/Jerry &\s*Nikita accepted/i.test(acceptanceStatus)) {
    fail(`scorecard status claims couple accepted while Textbook Final Exit is unmet`);
  }

  const packet = path.join(root, "docs/final-acceptance/FINAL_ACCEPTANCE_PACKET.md");
  if (fs.existsSync(packet)) {
    const body = fs.readFileSync(packet, "utf8");
    // Forbid present-tense Final / Booking Ready / accepted claims without negation
    if (/\bFinal approved\b/i.test(body) && !/must not|do not|不得|not yet|not claimed|不得標示/i.test(body)) {
      fail("FINAL_ACCEPTANCE_PACKET.md claims Final approved while textbook_final_exit_met is false");
    }
    if (/\bBooking Ready\b/i.test(body) && !/must not|do not|不得|not yet|not claimed|不得標示|false claim/i.test(body)) {
      fail("FINAL_ACCEPTANCE_PACKET.md claims Booking Ready while Textbook Final Exit is unmet");
    }
  }
}

// 5) next_top3_roi_gaps exists, ≤3 items; legacy key must be gone
if (scorecard.round_1_top3_roi_gaps !== undefined) {
  fail("legacy key round_1_top3_roi_gaps must be renamed to next_top3_roi_gaps");
}
const gaps = scorecard.next_top3_roi_gaps;
if (!Array.isArray(gaps)) {
  fail("next_top3_roi_gaps must be an array");
} else {
  if (!finalMet && gaps.length === 0) {
    fail("next_top3_roi_gaps must list at least one gap while Textbook Final Exit is unmet");
  }
  if (gaps.length > 3) fail(`next_top3_roi_gaps has ${gaps.length} items — maximum is 3`);
  for (const g of gaps) {
    if (typeof g !== "string" || !g.trim()) fail("next_top3_roi_gaps entries must be non-empty strings");
  }
}

if (errors.length) {
  console.error("check-control-state FAILED:");
  for (const e of errors) console.error(`- ${e}`);
  process.exit(1);
}

console.log("check-control-state OK");
console.log(`- round_1_acceptance: ${round1Met}`);
console.log(`- textbook_final_exit_met: ${finalMet}`);
console.log(`- p0_open: ${(p0Open ?? []).length}`);
console.log(`- next_top3_roi_gaps: ${Array.isArray(gaps) ? (gaps as string[]).join(" | ") : "(invalid)"}`);
console.log(
  `- round_2_progress merged: ${Object.entries(progress)
    .filter(([, s]) => s.status === "merged")
    .map(([k]) => k)
    .join(", ")}`,
);
