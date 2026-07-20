import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { distDir } from "./lib/root.ts";

const files = [
  { name: "korea-trip-handbook.pdf", minBytes: 80000, minPages: 12 },
  { name: "emergency-pack.pdf", minBytes: 8000, minPages: 1 },
];

let failed = false;

function hasBin(name: string): boolean {
  try {
    execSync(`command -v ${name}`, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

const hasPdfInfo = hasBin("pdfinfo");
const hasPdfToText = hasBin("pdftotext");

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

  // Page count via /Type /Page markers when pdfinfo unavailable
  const pageMarkers = (latin.match(/\/Type\s*\/Page[^s]/g) || []).length;
  if (hasPdfInfo) {
    try {
      const info = execSync(`pdfinfo "${p}"`, { encoding: "utf8" });
      const pages = Number((info.match(/Pages:\s+(\d+)/) || [])[1] || 0);
      console.log(`  pages: ${pages}`);
      if (pages < f.minPages) {
        failed = true;
        console.error(`${f.name}: expected >= ${f.minPages} pages, got ${pages}`);
      }
    } catch {
      console.warn(`  pdfinfo failed for ${f.name}`);
    }
  } else {
    console.log(`  page markers ≈ ${pageMarkers} (pdfinfo not installed)`);
    if (pageMarkers < f.minPages) {
      failed = true;
      console.error(`${f.name}: expected >= ${f.minPages} page markers, got ${pageMarkers}`);
    }
  }

  if (f.name === "emergency-pack.pdf") {
    let text = "";
    if (hasPdfToText) {
      try {
        text = execSync(`pdftotext -layout "${p}" -`, { encoding: "utf8" });
      } catch {
        text = "";
      }
    }
    // Also scan latin1 for ASCII placeholders
    const hay = `${text}\n${latin}`;
    for (const bad of ["REPLACE_ME", "YAML generator"]) {
      if (hay.includes(bad)) {
        failed = true;
        console.error(`${f.name}: forbidden engineering text "${bad}"`);
      }
    }
  }

  console.log(`OK PDF ${f.name} (${buf.length} bytes)`);
}

if (failed) process.exit(1);
console.log("verify-pdfs: OK");
