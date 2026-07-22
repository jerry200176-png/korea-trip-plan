import fs from "node:fs";
import path from "node:path";
import { loadAllTripData } from "./lib/load-data.ts";
import { distDir, root } from "./lib/root.ts";

type Gate = {
  id: string;
  status: "pass" | "fail" | "blocked" | "provisional";
  blocker: string | null;
  evidence: string;
  next_action: string;
  owner: "founder" | "agent" | "both";
  last_checked: string;
};

const checked = process.env.READINESS_DATE ?? "2026-07-20";
const data = loadAllTripData();

function gate(
  id: string,
  status: Gate["status"],
  blocker: string | null,
  evidence: string,
  next_action: string,
  owner: Gate["owner"]
): Gate {
  return { id, status, blocker, evidence, next_action, owner, last_checked: checked };
}

const gates: Gate[] = [];

const ciScripts = fs.existsSync(path.join(root, "package.json")) && fs.existsSync(path.join(root, ".github/workflows/ci.yml"));
gates.push(
  gate(
    "foundation",
    ciScripts ? "pass" : "fail",
    ciScripts ? null : "Missing CI or package manifest",
    "package.json + .github/workflows/ci.yml present",
    ciScripts ? "Keep npm run ci green" : "Add CI workflow",
    "agent"
  )
);

gates.push(
  gate(
    "dates",
    data.trip.start_date && data.trip.end_date ? "pass" : "blocked",
    data.trip.start_date && data.trip.end_date ? null : "D1 not locked — start_date/end_date null",
    `start_date=${data.trip.start_date ?? "null"} end_date=${data.trip.end_date ?? "null"}`,
    data.trip.start_date ? "Proceed to D3 ticket verification + lodging shortlist" : "Founder D1 reply",
    data.trip.start_date ? "both" : "founder"
  )
);

const d2 = data.founderDecisions.decisions.find((d) => d.id === "D2");
const d3 = data.founderDecisions.decisions.find((d) => d.id === "D3");
const routeConfirmed =
  data.trip.route_status === "Confirmed" || d2?.status === "Confirmed";
const flightProvisional =
  d3?.status === "Provisional" || data.trip.flight_plan?.status === "Provisional";
const flightConfirmed =
  d3?.status === "Confirmed" && data.trip.flight_plan?.verified_booking === true;

gates.push(
  gate(
    "route",
    routeConfirmed ? "pass" : "provisional",
    routeConfirmed ? null : "D2 not Confirmed",
    `route_option=${data.trip.route_option} route_status=${data.trip.route_status}`,
    routeConfirmed ? "Maintain alignment with itinerary nights" : "Founder D2 reply",
    routeConfirmed ? "agent" : "founder"
  )
);

gates.push(
  gate(
    "flights",
    flightConfirmed ? "pass" : flightProvisional ? "provisional" : "blocked",
    flightConfirmed
      ? null
      : flightProvisional
        ? "D3 Provisional — ticket verification needed for locked dates"
        : "D3 not set",
    data.trip.flight_plan
      ? `flight_plan=${data.trip.flight_plan.founder_option} verified=${data.trip.flight_plan.verified_booking}`
      : "No flight_plan in trip.yaml",
    flightProvisional
      ? "After D1: compare schedules/fare/baggage/cancel; do not assert future availability"
      : "Founder D3 reply",
    flightProvisional ? "both" : "founder"
  )
);

gates.push(
  gate(
    "lodging",
    "provisional",
    "No hotel candidates booked",
    "data/lodging-area-scores.yaml + docs/LODGING_AREA_SCORING.md",
    "Refine scores after D1/D3; area shortlist next — no hotel names yet",
    "agent"
  )
);

gates.push(
  gate(
    "transport",
    "provisional",
    "KTX/flight times not booked",
    "Day5 skeleton + handbook/city-transport.md",
    "After D3: lock airports; after dates: lock KTX slot",
    "agent"
  )
);

gates.push(
  gate(
    "itinerary",
    "provisional",
    "Places/restaurants mostly candidates",
    `${data.itinerary.days.length} day skeleton + 3 foundation_slice days`,
    "Verify Naver hours at T-30",
    "agent"
  )
);

gates.push(
  gate(
    "bookings",
    "blocked",
    "No real bookings in repo",
    "bookings.example.yaml placeholders only",
    "Founder books offline",
    "founder"
  )
);

gates.push(
  gate(
    "entry_requirements",
    "provisional",
    "K-ETA exemption list must be re-read for travel year",
    "handbook/entry-and-rules.md + src-keta",
    "Re-check k-eta.go.kr before apply",
    "both"
  )
);

gates.push(
  gate(
    "budget",
    data.budget.status === "Confirmed" ? "pass" : "provisional",
    null,
    "budget.yaml placeholders",
    "Update after quotes",
    "both"
  )
);

gates.push(
  gate(
    "packing",
    "provisional",
    null,
    "checklists/packing.md",
    "Finalize at T-14",
    "both"
  )
);

gates.push(
  gate(
    "emergency",
    "provisional",
    "Lodging KO addresses still REPLACE_ME",
    "emergency-public.yaml + emergency-pack.pdf",
    "Fill offline at booking",
    "founder"
  )
);

const stalePath = path.join(distDir, "stale-report.json");
let staleCount = 0;
if (fs.existsSync(stalePath)) {
  staleCount = JSON.parse(fs.readFileSync(stalePath, "utf8")).warnings ?? 0;
}
gates.push(
  gate(
    "data_freshness",
    staleCount === 0 ? "pass" : "provisional",
    staleCount ? `${staleCount} stale warnings` : null,
    "dist/stale-report.json",
    "Re-run sources before T-30",
    "agent"
  )
);

gates.push(
  gate(
    "offline_readiness",
    "provisional",
    "Service worker caches subset only; not full offline verified on device",
    "site/public/sw.js + static build",
    "Save PDFs + key pages to phone at T-7",
    "both"
  )
);

const blocked = gates.filter((g) => g.status === "blocked").length;
const fail = gates.filter((g) => g.status === "fail").length;
const pass = gates.filter((g) => g.status === "pass").length;

const overall =
  fail > 0 ? "fail" : blocked > 0 ? "blocked" : pass === gates.length ? "pass" : "provisional";

const report = {
  generated_at: checked,
  overall,
  summary: { pass, provisional: gates.filter((g) => g.status === "provisional").length, blocked, fail },
  top_risks: gates
    .filter((g) => g.status === "blocked" || g.status === "fail")
    .slice(0, 3)
    .map((g) => ({ id: g.id, blocker: g.blocker })),
  next_founder: "D1",
  next_agent: "Lodging area scoring model (regions only; no hotels)",
  stale_sources: staleCount,
  ci_status: "run npm run ci locally / GitHub Actions",
  gates,
};

fs.mkdirSync(distDir, { recursive: true });
fs.writeFileSync(path.join(distDir, "readiness-report.json"), JSON.stringify(report, null, 2));

const md = `# Trip Readiness

Generated: ${checked} (machine report: dist/readiness-report.json)

**Overall:** ${overall} — not Trip Ready until D3 ticket-verified and bookings exist offline.

| Gate | Status | Blocker |
|------|--------|---------|
${gates.map((g) => `| ${g.id} | ${g.status} | ${g.blocker ?? "—"} |`).join("\n")}

Do not treat documentation completeness as travel readiness.
`;

fs.writeFileSync(path.join(root, "docs/TRIP_READINESS.md"), md);
console.log(`readiness: overall=${overall} gates=${gates.length}`);
