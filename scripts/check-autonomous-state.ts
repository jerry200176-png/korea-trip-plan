/**
 * Autonomous harness consistency gate.
 * Ensures run-state + work-queue stay honest and do not tip-hardcode mutable SHAs.
 * Does not restore READY or inflate scores.
 */
import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { root } from "./lib/root.ts";

type QueueItem = {
  id?: string;
  outcome?: string;
  priority?: number;
  status?: string;
  attempts?: number;
  last_failure_signature?: string | null;
  exit_gate?: string;
  next_if_pass?: string | null;
  next_if_fail?: string | null;
  evidence_required?: unknown;
  dependencies?: string[];
  scope_allowed?: string[];
  scope_forbidden?: string[];
  expected_user_value?: string;
};

type QueueDoc = {
  items?: QueueItem[];
};

type RunState = {
  current_phase?: string;
  current_outcome?: string;
  current_pr?: number | string;
  current_branch?: string;
  current_head_sha?: string | null;
  last_verified_main_sha?: string | null;
  last_green_ci_run?: string | number | null;
  last_artifact_id?: string | null;
  deployed_pages_sha?: string | null;
  product_status?: string;
  active_blockers?: unknown[];
  retry_count?: number;
  last_failure_signature?: string | null;
  next_action?: string;
  hard_stop_required?: boolean;
  updated_at?: string;
  sha_roles?: Record<string, string | null | undefined>;
};

type Scorecard = {
  product_status?: string;
  acceptance_status?: string;
  gates?: { textbook_final_exit?: { met?: boolean } };
  totals?: { textbook_final_exit_met?: boolean; overall?: { score?: number | string } };
};

const errors: string[] = [];
function fail(msg: string): void {
  errors.push(msg);
}

function loadYaml<T>(rel: string): T {
  return yaml.load(fs.readFileSync(path.join(root, rel), "utf8")) as T;
}

const REQUIRED_QUEUE_IDS = [
  "repair-pr26-clean-ci",
  "verify-pr26-final-artifact",
  "restore-ready-state",
  "merge-pr26",
  "verify-main-and-pages",
  "full-product-human-readiness-audit",
  "final-polish-if-needed",
  "generate-final-human-acceptance-packet",
  "stop-for-jerry-and-nikita-review",
] as const;

const REQUIRED_RUN_FIELDS = [
  "current_phase",
  "current_outcome",
  "current_pr",
  "current_branch",
  "current_head_sha",
  "last_verified_main_sha",
  "last_green_ci_run",
  "last_artifact_id",
  "deployed_pages_sha",
  "product_status",
  "active_blockers",
  "retry_count",
  "last_failure_signature",
  "next_action",
  "hard_stop_required",
  "updated_at",
] as const;

const ALLOWED_STATUSES = new Set([
  "pending",
  "in_progress",
  "blocked",
  "passed",
  "failed",
  "skipped",
]);

const READY = "READY FOR JERRY & NIKITA ACCEPTANCE";
const REPAIR = "FINAL ACCEPTANCE REPAIR REQUIRED";

const queueDoc = loadYaml<QueueDoc>("data/autonomous-work-queue.yaml");
const run = loadYaml<RunState>("data/autonomous-run-state.yaml");
const scorecard = loadYaml<Scorecard>("data/textbook-scorecard.yaml");

const docs = [
  "docs/autonomy/AUTONOMOUS_EXECUTION.md",
  "docs/autonomy/EXIT_GATE.md",
  "docs/autonomy/FAILURE_LEDGER.md",
];
for (const rel of docs) {
  if (!fs.existsSync(path.join(root, rel))) fail(`missing required harness doc: ${rel}`);
}

for (const field of REQUIRED_RUN_FIELDS) {
  if (!(field in run)) fail(`autonomous-run-state missing field: ${field}`);
}

const items = queueDoc.items ?? [];
if (!items.length) fail("autonomous-work-queue.items is empty");

const byId = new Map<string, QueueItem>();
for (const item of items) {
  const id = String(item.id ?? "");
  if (!id) {
    fail("queue item missing id");
    continue;
  }
  if (byId.has(id)) fail(`duplicate queue id: ${id}`);
  byId.set(id, item);

  for (const key of [
    "outcome",
    "priority",
    "expected_user_value",
    "evidence_required",
    "dependencies",
    "scope_allowed",
    "scope_forbidden",
    "status",
    "attempts",
    "exit_gate",
    "next_if_pass",
    "next_if_fail",
  ] as const) {
    if (!(key in item)) fail(`queue ${id} missing field: ${key}`);
  }
  if (!ALLOWED_STATUSES.has(String(item.status))) {
    fail(`queue ${id} has invalid status: ${item.status}`);
  }
  if (typeof item.attempts !== "number" || item.attempts < 0) {
    fail(`queue ${id} attempts must be >= 0`);
  }
}

for (const id of REQUIRED_QUEUE_IDS) {
  if (!byId.has(id)) fail(`required queue item missing: ${id}`);
}

const phase = String(run.current_phase ?? "");
if (!byId.has(phase)) fail(`current_phase not in queue: ${phase}`);

const active = [...byId.values()].filter((i) => i.status === "in_progress");
if (active.length !== 1) {
  fail(`exactly one queue item must be in_progress (found ${active.length})`);
} else if (active[0]?.id !== phase) {
  fail(`in_progress item ${active[0]?.id} != current_phase ${phase}`);
}

const productStatus = String(run.product_status ?? "");
const scoreStatus = String(scorecard.product_status ?? scorecard.acceptance_status ?? "");
if (productStatus !== scoreStatus) {
  fail(`product_status drift: run-state=${productStatus} scorecard=${scoreStatus}`);
}

const finalMet =
  scorecard.gates?.textbook_final_exit?.met === true ||
  scorecard.totals?.textbook_final_exit_met === true;

if (productStatus === READY) {
  if (!finalMet) fail("READY claimed but textbook_final_exit.met is not true");
  if (run.hard_stop_required === true) fail("READY claimed while hard_stop_required is true");
}

if (productStatus !== READY && productStatus !== REPAIR) {
  fail(`unexpected product_status: ${productStatus}`);
}

// Tip-hardcode guard: committed current_head_sha must be null / unknown sentinel, not a 40-char tip.
const head = run.current_head_sha;
if (typeof head === "string" && /^[0-9a-f]{40}$/i.test(head)) {
  fail(
    "current_head_sha must not be a committed 40-char tip SHA (use null / unknown_until_ci; CI metadata owns the tip)",
  );
}
if (head !== null && head !== undefined && head !== "unknown_until_ci" && head !== "") {
  // allow only nullish / sentinel
  if (typeof head === "string" && !["unknown_until_ci", "runtime", "from_ci"].includes(head)) {
    fail(`current_head_sha has unsupported committed value: ${head}`);
  }
}

for (const key of ["last_green_ci_run", "last_artifact_id", "deployed_pages_sha"] as const) {
  const v = run[key];
  if (typeof v === "string" && /^[0-9a-f]{40}$/i.test(v) && key !== "deployed_pages_sha") {
    // artifact ids are not SHAs; ignore. last_green_ci_run should be run id numeric/string, not sha.
  }
}

if (typeof run.retry_count !== "number" || run.retry_count < 0) {
  fail("retry_count must be >= 0");
}
if (run.retry_count > 3 && run.hard_stop_required !== true) {
  // soft warn as fail to force decision
  const sig = String(run.last_failure_signature ?? "");
  const item = byId.get(phase);
  if (item && Number(item.attempts ?? 0) > 3 && run.hard_stop_required !== true) {
    fail(
      `phase ${phase} exceeded 3 attempts without hard_stop_required or architecture change marker`,
    );
  }
}

if (!fs.existsSync(path.join(root, "docs/autonomy/FAILURE_LEDGER.md"))) {
  fail("FAILURE_LEDGER.md missing");
}

if (errors.length) {
  console.error("check-autonomous-state FAILED:");
  for (const e of errors) console.error(` - ${e}`);
  process.exit(1);
}

console.log("check-autonomous-state OK");
console.log(` - phase: ${phase}`);
console.log(` - product_status: ${productStatus}`);
console.log(` - hard_stop_required: ${run.hard_stop_required}`);
console.log(` - retry_count: ${run.retry_count}`);
console.log(` - last_failure_signature: ${run.last_failure_signature ?? "(none)"}`);
