import fs from "node:fs";
import path from "node:path";
import { distDir, root } from "./lib/root.ts";

const pub = path.join(root, "site/public/downloads");
fs.mkdirSync(pub, { recursive: true });

for (const name of ["korea-trip-handbook.pdf", "emergency-pack.pdf"]) {
  const src = path.join(distDir, name);
  if (!fs.existsSync(src)) {
    console.error(`prepare-public-artifacts: missing ${src} — run npm run pdf first`);
    process.exit(1);
  }
  fs.copyFileSync(src, path.join(pub, name));
}

const readiness = path.join(distDir, "readiness-report.json");
if (fs.existsSync(readiness)) {
  fs.copyFileSync(readiness, path.join(pub, "readiness-report.json"));
}

console.log("prepare-public-artifacts: copied PDFs (+ readiness if present) to site/public/downloads/");
