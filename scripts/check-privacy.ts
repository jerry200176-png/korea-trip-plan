import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");

const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "archive",
  ".astro",
  "site/dist",
  "pdf-renders",
]);

const SKIP_EXT = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".gif",
  ".pdf",
  ".woff",
  ".woff2",
  ".ico",
]);

/** High-confidence secret patterns only (avoid date / ID false positives). */
const patterns: { name: string; re: RegExp }[] = [
  {
    name: "private-key-block",
    re: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  },
  {
    name: "aws-access-key",
    re: /\bAKIA[0-9A-Z]{16}\b/,
  },
  {
    name: "credit-card-spaced",
    re: /\b(?:4\d{3}|5[1-5]\d{2}|3[47]\d{2})[ -]?\d{4}[ -]?\d{4}[ -]?\d{1,4}\b/,
  },
  {
    name: "assigned-confirmation",
    re: /\b(?:confirmation_code|PNR)\s*[:=]\s*['"](?!REPLACE_ME)[A-Z0-9]{6,}['"]/i,
  },
];

function walk(dir: string, out: string[] = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    const rel = path.relative(root, full);
    if (rel.startsWith("archive")) continue;
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(md|ya?ml|ts|tsx|js|mjs|json|astro|txt|html)$/i.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

let failed = false;
for (const file of walk(root)) {
  if (file.endsWith("check-privacy.ts")) continue;
  if (file.includes(`${path.sep}bookings.example.yaml`)) continue;
  const rel = path.relative(root, file);
  const text = fs.readFileSync(file, "utf8");
  for (const { name, re } of patterns) {
    const matches = text.match(re);
    if (!matches) continue;
    for (const m of matches) {
      if (/REPLACE_ME/i.test(m)) continue;
      failed = true;
      console.error(`Privacy hit (${name}) in ${rel}: ${m.slice(0, 80)}`);
    }
  }
}

if (failed) {
  console.error("check-privacy: FAILED");
  process.exit(1);
}
console.log("check-privacy: OK");
