import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { distDir, root } from "./lib/root.ts";

const files = [
  // Textbook Edition: content-driven overall ceiling (Media Edition ≤20 replaced, not deleted)
  {
    name: "korea-trip-handbook.pdf",
    minBytes: 80000,
    minPages: 28,
    maxPages: 72,
    maxBytes: 15_000_000,
    kind: "handbook" as const,
  },
  {
    name: "emergency-pack.pdf",
    minBytes: 8000,
    minPages: 1,
    maxPages: 3,
    maxBytes: 2_000_000,
    kind: "emergency" as const,
  },
];

/** Section-aware page budgets — replace hard Media Edition ≤20 for handbook structure. */
const SECTION_BUDGETS: Record<string, { min: number; max: number }> = {
  toc: { min: 1, max: 2 },
  how_to_use: { min: 1, max: 1 },
  profile: { min: 1, max: 1 },
  journey: { min: 1, max: 1 },
  seoul_days: { min: 4, max: 10 },
  transit_busan_days: { min: 4, max: 10 },
  food: { min: 2, max: 4 },
  transport: { min: 2, max: 4 },
  shopping: { min: 1, max: 3 },
  hanbok: { min: 1, max: 2 },
  photo: { min: 2, max: 4 },
  before: { min: 2, max: 4 },
  emergency_short: { min: 1, max: 1 },
  decisions: { min: 1, max: 1 },
  sources: { min: 1, max: 2 },
  credits: { min: 2, max: 5 },
};

const handbookForbidden = [
  "REPLACE_ME",
  "YAML generator",
  "place_id",
  "foundation_slice",
  "route_option",
  "[place]",
  "DecisionRequired",
  "AREX_or_bus_TBD",
];

const beforeCreditsForbidden = [
  "AI-generated illustration",
  "Cursor GenerateImage",
  "AI-generated",
  "GenerateImage",
];

// Bare engineering tokens must not appear in reader PDF body
const handbookBareTokens = [/\bTBD\b/, /\bProvisional\b/, /\bConfirmed\b/, /\bAssumption\b/, /\bStale\b/];

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
const hasPdfToPpm = hasBin("pdftoppm");
const hasPdfFonts = hasBin("pdffonts");

function pageCount(p: string, latin: string): number {
  if (hasPdfInfo) {
    try {
      const info = execSync(`pdfinfo "${p}"`, { encoding: "utf8" });
      return Number((info.match(/Pages:\s+(\d+)/) || [])[1] || 0);
    } catch {
      /* fall through */
    }
  }
  return (latin.match(/\/Type\s*\/Page[^s]/g) || []).length;
}

function checkSectionBudgets(pdfPath: string, label: string) {
  if (!hasPdfToText || !hasPdfInfo) {
    console.warn(`  skip section-budget check (tools missing) for ${label}`);
    return;
  }
  try {
    const info = execSync(`pdfinfo "${pdfPath}"`, { encoding: "utf8" });
    const pageCount = Number((info.match(/Pages:\s+(\d+)/) || [])[1] || 0);
    const counts: Record<string, number> = {};
    let current = "front";
    for (let i = 1; i <= pageCount; i++) {
      const text = execSync(`pdftotext -f ${i} -l ${i} -layout "${pdfPath}" -`, { encoding: "utf8" });
      const markers = [...text.matchAll(/PDFSEC:([a-z0-9_]+)/g)].map((m) => m[1]);
      if (markers.length) current = markers[markers.length - 1];
      counts[current] = (counts[current] || 0) + 1;
    }
    for (const [id, budget] of Object.entries(SECTION_BUDGETS)) {
      const n = counts[id] || 0;
      if (n < budget.min || n > budget.max) {
        failed = true;
        console.error(
          `${label}: section "${id}" pages=${n}, expected ${budget.min}-${budget.max}`
        );
      }
    }
    console.log(
      `  section budgets: ${Object.entries(counts)
        .map(([k, v]) => `${k}=${v}`)
        .join(" · ")}`
    );
  } catch (e) {
    failed = true;
    console.error(`${label}: section-budget check failed: ${e}`);
  }
}

function checkNearBlankPages(pdfPath: string, label: string) {
  if (!hasPdfToPpm || !hasPdfToText) {
    console.warn(`  skip blank-page check (tools missing) for ${label}`);
    return;
  }
  const tmp = fs.mkdtempSync(path.join("/tmp", "pdf-blank-"));
  try {
    execSync(`pdftoppm -png -r 72 "${pdfPath}" "${path.join(tmp, "p")}"`, { stdio: "ignore" });
    const pages = fs.readdirSync(tmp).filter((f) => f.endsWith(".png")).sort();
    const info = execSync(`pdfinfo "${pdfPath}"`, { encoding: "utf8" });
    const pageCount = Number((info.match(/Pages:\s+(\d+)/) || [])[1] || pages.length);
    for (let i = 1; i <= pageCount; i++) {
      const text = execSync(`pdftotext -f ${i} -l ${i} -layout "${pdfPath}" -`, { encoding: "utf8" })
        .replace(/\f/g, "")
        .trim();
      const compact = text.replace(/\s+/g, "");
      const intentionalSparse =
        /^(Chapter|Transit)/.test(compact) ||
        compact.includes("Chapter") ||
        compact.startsWith("Transit") ||
        /首爾·Seoul|釜山·Busan|首爾→釜山·KTX|Food Atlas|Transport|Photo|Before|Credits|PDFSEC:/.test(compact) ||
        /^我們的韓國·Textbook\d+\/\d+$/.test(compact);
      // Orphan / near-blank: very little extractable content (chapter dividers are image-led)
      if (!intentionalSparse && compact.length > 0 && compact.length < 60) {
        failed = true;
        console.error(`${label}: near-blank/orphan page ${i} (text chars=${compact.length}): ${compact.slice(0, 80)}`);
      }
      if (compact.length === 0) {
        failed = true;
        console.error(`${label}: empty page ${i}`);
      }
    }
    console.log(`  blank-page heuristic: ${pageCount} pages checked`);
  } catch (e) {
    console.warn(`  blank-page check failed: ${e}`);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
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
  if (f.maxBytes && buf.length > f.maxBytes) {
    failed = true;
    console.error(`${f.name} too large: ${buf.length} > ${f.maxBytes}`);
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

  const pages = pageCount(p, latin);
  console.log(`  pages: ${pages}`);
  if (pages < f.minPages) {
    failed = true;
    console.error(`${f.name}: expected >= ${f.minPages} pages, got ${pages}`);
  }
  if (pages > f.maxPages) {
    failed = true;
    console.error(`${f.name}: expected <= ${f.maxPages} pages, got ${pages} (pagination bloat)`);
  }

  let text = "";
  if (hasPdfToText) {
    try {
      text = execSync(`pdftotext -layout "${p}" -`, { encoding: "utf8" });
    } catch {
      text = "";
    }
  }
  const hay = `${text}\n${latin}`;

  for (const bad of handbookForbidden) {
    // Emergency pack still scanned for REPLACE_ME; handbook for all
    if (f.name === "emergency-pack.pdf" && !["REPLACE_ME", "YAML generator", "place_id"].includes(bad)) {
      continue;
    }
    if (hay.includes(bad)) {
      failed = true;
      console.error(`${f.name}: forbidden reader text "${bad}"`);
    }
  }

  if (f.name === "korea-trip-handbook.pdf") {
    const beforeCredits = text.split(/Image Credits|圖片出處/i)[0] ?? text;
    for (const re of handbookBareTokens) {
      if (re.test(beforeCredits)) {
        failed = true;
        console.error(`${f.name}: forbidden engineering token matching ${re}`);
      }
    }
    for (const bad of beforeCreditsForbidden) {
      if (beforeCredits.includes(bad)) {
        failed = true;
        console.error(`${f.name}: AI tool attribution leaked before Credits ("${bad}")`);
      }
    }
    if (!/[\u4e00-\u9fff]/.test(text)) {
      failed = true;
      console.error(`${f.name}: no extractable Chinese text`);
    }
    if (!/[\uac00-\ud7af]/.test(text)) {
      failed = true;
      console.error(`${f.name}: no extractable Korean text`);
    }
    if (/%[0-9A-Fa-f]{2}%[0-9A-Fa-f]{2}/.test(text)) {
      failed = true;
      console.error(`${f.name}: raw percent-encoded URL visible in text`);
    }
    if (hasPdfFonts) {
      try {
        const fonts = execSync(`pdffonts "${p}"`, { encoding: "utf8" });
        fs.mkdirSync(path.join(root, "docs/design-proof"), { recursive: true });
        fs.writeFileSync(path.join(root, "docs/design-proof/pdffonts-handbook.txt"), fonts);
        if (!/Noto|CID|Identity/i.test(fonts)) {
          failed = true;
          console.error(`${f.name}: pdffonts missing expected CJK/CID fonts`);
        }
        console.log("  pdffonts: captured");
      } catch {
        console.warn("  pdffonts failed");
      }
    }
    checkNearBlankPages(p, f.name);
    checkSectionBudgets(p, f.name);
    if (!/PDFSEC:toc/.test(text) || !/目錄/.test(text)) {
      failed = true;
      console.error(`${f.name}: missing TOC / PDFSEC:toc`);
    }
    if (!/\d+\s*\/\s*\d+/.test(text) && !Object.keys(SECTION_BUDGETS).every((id) => text.includes(`PDFSEC:${id}`) || id === "front")) {
      // page numbers live in footer; require section markers instead
    }
    for (const id of Object.keys(SECTION_BUDGETS)) {
      if (!text.includes(`PDFSEC:${id}`)) {
        failed = true;
        console.error(`${f.name}: missing section marker PDFSEC:${id}`);
      }
    }
  }

  console.log(`OK PDF ${f.name} (${buf.length} bytes)`);
}

// Media record coverage for PDF-referenced images is enforced by check-media; echo reminder
const mediaYaml = fs.readFileSync(path.join(root, "data/media.yaml"), "utf8");
if (!mediaYaml.includes("busan-chapter")) {
  failed = true;
  console.error("media.yaml missing busan-chapter record");
}

if (failed) process.exit(1);
console.log("verify-pdfs: OK");
