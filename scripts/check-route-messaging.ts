import fs from "node:fs";
import path from "node:path";
import { root } from "./lib/root.ts";

const TARGETS = ["README.md", "data/trip.yaml", "data/destinations.yaml", "site/src/pages/decisions.astro"];
const BAD = [
  /首爾\s*4\s*[Nn]\s*\+\s*釜山\s*3\s*[Nn](?!.*8\s*calendar|8\s*日|Option B′|7N|7 hotel)/,
  /seoul-4n-busan-3n/,
  /4N\+3N.*6\s*[Nn](?!.*8)/i,
];

let failed = false;
for (const rel of TARGETS) {
  const text = fs.readFileSync(path.join(root, rel), "utf8");
  for (const re of BAD) {
    if (re.test(text)) {
      failed = true;
      console.error(`Route messaging: ${rel} matches forbidden pattern ${re}`);
    }
  }
}

// ROUTE_DECISION may mention 4N+3N only with 8-day qualifier
const route = fs.readFileSync(path.join(root, "docs/ROUTE_DECISION.md"), "utf8");
if (/Provisional pick.*4N \+ Busan 3N/i.test(route)) {
  failed = true;
  console.error("docs/ROUTE_DECISION.md still recommends 4N+3N as provisional pick");
}

if (failed) process.exit(1);
console.log("check:route-messaging OK");
