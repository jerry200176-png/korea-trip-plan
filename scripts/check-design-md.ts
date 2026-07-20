import fs from "node:fs";
import path from "node:path";
import { root } from "./lib/root.ts";

const designPath = path.join(root, "DESIGN.md");
const requiredHeadings = [
  "## 1. Product context",
  "## 2. Emotional goal",
  "## 4. Color palette and semantic roles",
  "## 5. Typography hierarchy",
  "## 22. Agent implementation guide",
];

let failed = false;

if (!fs.existsSync(designPath)) {
  console.error("DESIGN.md missing at repository root");
  process.exit(1);
}

const md = fs.readFileSync(designPath, "utf8");
for (const h of requiredHeadings) {
  if (!md.includes(h)) {
    failed = true;
    console.error(`DESIGN.md missing heading: ${h}`);
  }
}

if (md.includes("@google/design.md") || md.includes("design:lint")) {
  failed = true;
  console.error("DESIGN.md must not reference external DESIGN.md CLI tooling");
}

if (failed) process.exit(1);
console.log("check-design-md: OK");
