import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { distDir, root, siteDistDir } from "./lib/root.ts";
import {
  READER_FORBIDDEN_FUNCTION_RE,
  READER_FORBIDDEN_PDFSEC_RE,
  READER_FORBIDDEN_SNAKE_RE,
  READER_FORBIDDEN_STATUS_RE,
} from "./lib/reader-sanitize-extra.ts";

/**
 * Full generated-output gate for Jerry & Nikita reader surfaces.
 * Scans built site/dist HTML, public SVG <text>/<title>/<desc>, and PDF text.
 */

const forbiddenPatterns: Array<{ label: string; re: RegExp }> = [
  { label: "PDFSEC", re: READER_FORBIDDEN_PDFSEC_RE },
  { label: "visual-function label", re: READER_FORBIDDEN_FUNCTION_RE },
  { label: "internal status label", re: READER_FORBIDDEN_STATUS_RE },
  { label: "raw snake_case profile key", re: READER_FORBIDDEN_SNAKE_RE },
  { label: "plc- id", re: /\bplc-[a-z0-9-]+/i },
  { label: "src- id", re: /\bsrc-[a-z0-9-]+/i },
  { label: "med- id", re: /\bmed-[a-z0-9-]+/i },
  { label: "place_id", re: /\bplace_id\b/ },
  { label: "foundation_slice", re: /\bfoundation_slice\b/ },
  { label: "route_option", re: /\broute_option\b/ },
  { label: "Jerry 與女友", re: /Jerry\s*與女友/ },
  { label: "Jerry & 女友", re: /Jerry\s*&\s*女友/ },
  { label: "Founder", re: /\bFounder\b/ },
  { label: "Open Decision", re: /\bOpen Decision\b/i },
  { label: "Assumption enum", re: /\bAssumption\b/ },
  { label: "Provisional enum", re: /\bProvisional\b/ },
  { label: "Confirmed enum", re: /\bConfirmed\b/ },
  { label: "DecisionRequired enum", re: /\bDecisionRequired\b/ },
  { label: "Stale enum", re: /\bStale\b/ },
  { label: "TBD", re: /\bTBD\b/ },
  { label: "REPLACE_ME", re: /\bREPLACE_ME\b/ },
  { label: "data yaml path", re: /\bdata\/[a-z0-9_.-]+\.ya?ml\b/i },
  { label: "checklists path", re: /\bchecklists\//i },
  { label: "update YAML", re: /\bupdate YAML\b/i },
  { label: "bare YAML ops", re: /\bYAML\b/ },
  { label: "AI-generated illustration body leak", re: /AI-generated illustration/ },
  { label: "Cursor GenerateImage body leak", re: /Cursor GenerateImage/ },
];

const textExt = new Set([".html", ".js", ".css", ".json", ".txt", ".xml", ".webmanifest"]);

let failed = false;
const report: string[] = [];

function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

function scan(label: string, content: string) {
  for (const rule of forbiddenPatterns) {
    if (rule.re.test(content)) {
      failed = true;
      const m = content.match(rule.re);
      const msg = `FAIL ${label}: ${rule.label} → ${m?.[0] ?? "?"}`;
      report.push(msg);
      console.error(msg);
    }
  }
}

function stripHtmlNoise(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ");
}

function extractSvgReaderText(svg: string): string {
  const chunks: string[] = [];
  svg.replace(/<(title|desc|text)(\s[^>]*)?>([\s\S]*?)<\/\1>/gi, (_m, _tag, _attrs, body) => {
    chunks.push(
      body
        .replace(/<[^>]+>/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
    );
    return "";
  });
  // aria-label on paths (from text→path conversion) is still reader-facing
  svg.replace(/\baria-label="([^"]*)"/gi, (_m, label) => {
    chunks.push(label);
    return "";
  });
  return chunks.join("\n");
}

console.log("check-reader-facing: scanning site/dist …");
for (const file of walk(siteDistDir)) {
  const ext = path.extname(file);
  if (!textExt.has(ext)) continue;
  const rel = path.relative(root, file);
  let content = fs.readFileSync(file, "utf8");
  if (ext === ".html") content = stripHtmlNoise(content);
  scan(rel, content);
}

console.log("check-reader-facing: scanning public SVG <text>/<title>/<desc>/aria-label …");
const svgRoots = [
  path.join(root, "site/public/media"),
  path.join(root, "media/diagrams"),
];
const svgReport: string[] = [];
for (const dir of svgRoots) {
  for (const file of walk(dir).filter((f) => f.endsWith(".svg"))) {
    const rel = path.relative(root, file);
    const svg = fs.readFileSync(file, "utf8");
    const reader = extractSvgReaderText(svg);
    const before = report.length;
    scan(rel, reader);
    if (report.length > before) {
      svgReport.push(...report.slice(before));
    } else {
      svgReport.push(`OK ${rel}`);
    }
  }
}

console.log("check-reader-facing: scanning PDF text …");
for (const name of ["korea-trip-handbook.pdf", "emergency-pack.pdf"]) {
  const pdf = path.join(distDir, name);
  if (!fs.existsSync(pdf)) {
    failed = true;
    console.error(`FAIL missing PDF ${name}`);
    continue;
  }
  let text = "";
  try {
    text = execSync(`pdftotext -layout "${pdf}" -`, { encoding: "utf8" });
  } catch {
    failed = true;
    console.error(`FAIL pdftotext ${name}`);
    continue;
  }
  scan(name, text);

  if (name === "korea-trip-handbook.pdf") {
    if (!/Jerry\s*&\s*Nikita/.test(text) && !/Jerry\s*與\s*Nikita/.test(text)) {
      failed = true;
      console.error("FAIL handbook PDF missing Jerry & Nikita / Jerry 與 Nikita");
    }
    if (/Jerry\s*與女友/.test(text)) {
      failed = true;
      console.error("FAIL handbook PDF still contains Jerry 與女友");
    }
    if (/plc-jyp-tower/i.test(text)) {
      failed = true;
      console.error("FAIL handbook PDF still contains plc-jyp-tower");
    }
    if (/PDFSEC:/.test(text)) {
      failed = true;
      console.error("FAIL handbook PDF still contains PDFSEC:");
    }
  }
}

const home = path.join(siteDistDir, "index.html");
if (fs.existsSync(home)) {
  const html = fs.readFileSync(home, "utf8");
  if (!/Jerry\s*與\s*Nikita/.test(html) && !/Jerry\s*&\s*Nikita/.test(html)) {
    failed = true;
    console.error("FAIL home missing Jerry 與 Nikita / Jerry & Nikita");
  }
}

const outPath = path.join(root, "docs/design-proof/READER_FACING_SCAN.txt");
const svgOutPath = path.join(root, "docs/design-proof/SVG_READER_FACING_SCAN.txt");
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(
  outPath,
  [`check-reader-facing ${failed ? "FAIL" : "OK"}`, `scanned_at ${new Date().toISOString()}`, ...report].join("\n") +
    "\n"
);
fs.writeFileSync(
  svgOutPath,
  [
    `svg-reader-facing ${failed ? "FAIL" : "OK"}`,
    `scanned_at ${new Date().toISOString()}`,
    `roots: site/public/media + media/diagrams`,
    ...svgReport,
  ].join("\n") + "\n"
);

if (failed) {
  console.error("check-reader-facing: FAILED");
  process.exit(1);
}
console.log("check-reader-facing: OK");
console.log(`  report: ${path.relative(root, outPath)}`);
console.log(`  svg report: ${path.relative(root, svgOutPath)}`);
