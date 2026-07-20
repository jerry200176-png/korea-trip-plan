import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const targets = ["docs", "handbook", "checklists", "site/src", "README.md"];

const linkRe = /\[[^\]]*\]\(([^)]+)\)/g;
let failed = false;
let checked = 0;

function checkFile(file: string) {
  const text = fs.readFileSync(file, "utf8");
  const dir = path.dirname(file);
  for (const match of text.matchAll(linkRe)) {
    const url = match[1].split("#")[0].split(" ")[0];
    if (!url || url.startsWith("http") || url.startsWith("mailto:")) continue;
    checked += 1;
    const resolved = path.resolve(dir, url);
    if (!fs.existsSync(resolved)) {
      failed = true;
      console.error(`Broken link in ${path.relative(root, file)} -> ${url}`);
    }
  }
}

function walk(dir: string) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(md|mdx|astro|tsx?)$/.test(entry.name)) checkFile(full);
  }
}

for (const t of targets) {
  const full = path.join(root, t);
  if (fs.statSync(full).isDirectory()) walk(full);
  else checkFile(full);
}

if (failed) {
  process.exit(1);
}
console.log(`check-links: OK (${checked} internal links)`);
