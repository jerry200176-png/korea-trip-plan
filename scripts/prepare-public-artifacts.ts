import fs from "node:fs";
import path from "node:path";
import { distDir, root } from "./lib/root.ts";

const pub = path.join(root, "site/public/downloads");
fs.mkdirSync(pub, { recursive: true });

const files = [
  { src: "korea-trip-handbook-a5.pdf", dest: "korea-trip-handbook-a5.pdf" },
  { src: "emergency-pack.pdf", dest: "emergency-pack.pdf" },
];

for (const f of files) {
  const src = path.join(distDir, f.src);
  if (!fs.existsSync(src)) {
    console.error(`prepare-public-artifacts: missing ${src} — run npm run publication:build`);
    process.exit(1);
  }
  fs.copyFileSync(src, path.join(pub, f.dest));
}

// Remove legacy failed artifacts if present
for (const legacy of ["korea-trip-handbook.pdf"]) {
  const legacyPath = path.join(pub, legacy);
  if (fs.existsSync(legacyPath)) {
    fs.unlinkSync(legacyPath);
    console.log(`Removed legacy download ${legacy}`);
  }
}

console.log("prepare-public-artifacts: copied publication PDFs to site/public/downloads/");
