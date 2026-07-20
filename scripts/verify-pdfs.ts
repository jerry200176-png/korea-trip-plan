import fs from "node:fs";
import path from "node:path";
import { distDir } from "./lib/root.ts";

const files = [
  { name: "korea-trip-handbook.pdf", minBytes: 8000 },
  { name: "emergency-pack.pdf", minBytes: 1500 },
];

let failed = false;
for (const f of files) {
  const p = path.join(distDir, f.name);
  if (!fs.existsSync(p)) {
    failed = true;
    console.error(`Missing PDF: ${p}`);
    continue;
  }
  const stat = fs.statSync(p);
  if (stat.size < f.minBytes) {
    failed = true;
    console.error(`${f.name} too small: ${stat.size} bytes`);
  }
  const head = fs.readFileSync(p).subarray(0, 5).toString("ascii");
  if (!head.startsWith("%PDF")) {
    failed = true;
    console.error(`${f.name} missing %PDF header`);
  }
  console.log(`OK PDF ${f.name} (${stat.size} bytes)`);
}

if (failed) process.exit(1);
console.log("verify-pdfs: OK");
