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
    data.trip.start_date ? "pass" : "blocked",
    data.trip.start_date ? null : "D1 not locked — start_date null",
    `target_month=${data.trip.target_month ?? "null"}`,
    "Founder D1 reply",
    "founder"
  )
);

gates.push(
  gate(
    "route",
    data.trip.route_status === "Confirmed" ? "pass" : "provisional",
    data.trip.route_status === "Confirmed" ? null : "D2 not locked",
    `route_option=${data.trip.route_option}`,
    "Founder D2 reply",
    "founder"
  )
);

gates.push(
  gate(
    "flights",
    "blocked",
    "D3 not locked",
    "No airports in trip.yaml",
    "Founder D3 reply",
    "founder"
  )
);

gates.push(
  gate(
    "lodging",
    "provisional",
    "No hotel candidates booked",
    "docs/LODGING_AREAS.md shortlist only",
    "After D2: name 2–3 candidates per city",
    "both"
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
  next_agent: "Keep Foundation Exit Gate green; after D2 lodging candidates",
  stale_sources: staleCount,
  ci_status: "run npm run ci locally / GitHub Actions",
  gates,
};

fs.mkdirSync(distDir, { recursive: true });
fs.writeFileSync(path.join(distDir, "readiness-report.json"), JSON.stringify(report, null, 2));

const md = `# Trip Readiness

Generated: ${checked} (machine report: dist/readiness-report.json)

**Overall:** ${overall} — not Trip Ready until Founder locks D1–D3 and bookings exist offline.

| Gate | Status | Blocker |
|------|--------|---------|
${gates.map((g) => `| ${g.id} | ${g.status} | ${g.blocker ?? "—"} |`).join("\n")}

Do not treat documentation completeness as travel readiness.
`;

fs.writeFileSync(path.join(root, "docs/TRIP_READINESS.md"), md);
console.log(`readiness: overall=${overall} gates=${gates.length}`);
