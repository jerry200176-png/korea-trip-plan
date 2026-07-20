import fs from "node:fs";
import path from "node:path";
import { distDir } from "./lib/root.ts";

const files = [
  { name: "korea-trip-handbook.pdf", minBytes: 15000 },
  { name: "emergency-pack.pdf", minBytes: 8000 },
];

let failed = false;

function extractText(buf: Buffer): string {
  const chunks: string[] = [];
  const re = /\(([^()\\]*(?:\\.[^()\\]*)*)\)/g;
  const s = buf.toString("latin1");
  let m: RegExpExecArray | null;
  while ((m = re.exec(s))) {
    const t = m[1];
    if (t.length > 2 && !/^[\x00-\x1f]*$/.test(t)) chunks.push(t);
  }
  return chunks.join(" ");
}

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

  console.log(`OK PDF ${f.name} (${buf.length} bytes)`);
}

if (failed) process.exit(1);
console.log("verify-pdfs: OK");
