import fs from "node:fs";
import path from "node:path";
import { distDir } from "./lib/root.ts";
import { execSync } from "node:child_process";

const files = [
  { name: "korea-trip-handbook.pdf", minBytes: 80000, minPages: 12 },
  { name: "emergency-pack.pdf", minBytes: 8000, minPages: 1 },
];

let failed = false;

for (const f of files) {
  const p = path.join(distDir, f.name);
  if (!fs.existsSync(p)) {
    failed = true;
    console.error(`Missing PDF: ${p}`);
    continue;
  }
  const buf = fs.readFileSync(p);
  if (buf.subarray(0, 5).toString("ascii") !== "%PDF-") {
    failed = true;
    console.error(`${f.name} invalid header`);
    continue;
  }
  if (buf.length < f.minBytes) {
    failed = true;
    console.error(`${f.name} too small: ${buf.length}`);
  }

  const latin = buf.toString("latin1");
  if (!/\/Font|\/Type\/Font/.test(latin)) {
    failed = true;
    console.error(`${f.name}: no embedded font markers found`);
  }
  if (!latin.includes("ToUnicode")) {
    failed = true;
    console.error(`${f.name}: missing ToUnicode maps (CJK extractability)`);
  } else {
    console.log(`  ToUnicode maps: ${latin.split("ToUnicode").length - 1}`);
  }

  try {
    const info = execSync(`pdfinfo "${p}"`, { encoding: "utf8" });
    const pages = Number((info.match(/Pages:\s+(\d+)/) || [])[1] || 0);
    console.log(`  pages: ${pages}`);
    if (pages < f.minPages) {
      failed = true;
      console.error(`${f.name}: expected >= ${f.minPages} pages, got ${pages}`);
    }
  } catch (e) {
    console.warn(`  pdfinfo unavailable for ${f.name}`);
  }

  // Ban engineering placeholders in emergency pack
  if (f.name === "emergency-pack.pdf") {
    const text = execSync(`pdftotext -layout "${p}" -`, { encoding: "utf8" });
    for (const bad of ["REPLACE_ME", "YAML generator", "GitHub", "CI ", "schema"]) {
      if (text.includes(bad)) {
        failed = true;
        console.error(`${f.name}: forbidden engineering text "${bad}"`);
      }
    }
  }

  console.log(`OK PDF ${f.name} (${buf.length} bytes)`);
}

if (failed) process.exit(1);
console.log("verify-pdfs: OK");
