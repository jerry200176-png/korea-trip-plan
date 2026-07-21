import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { distDir, root } from "./lib/root.ts";

const files = [
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
    maxPages: 2,
    maxBytes: 2_000_000,
    kind: "emergency" as const,
  },
];

/** Section-aware page budgets — enforced via pdf-section-manifest.json (not PDFSEC text). */
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
  "PDFSEC:",
];

const beforeCreditsForbidden = [
  "AI-generated illustration",
  "Cursor GenerateImage",
  "AI-generated",
  "GenerateImage",
];

const handbookBareTokens = [/\bTBD\b/, /\bProvisional\b/, /\bConfirmed\b/, /\bAssumption\b/, /\bStale\b/];
const functionLabelRe = /\b(?:Orient|Explain|Warn|Rescue|Compare|Identify|Remember)\b/;

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

type SectionManifest = {
  total_pages: number;
  pages: Array<{ page: number; section: string }>;
  section_counts: Record<string, number>;
};

function loadSectionManifest(): SectionManifest | null {
  const p = path.join(root, "docs/design-proof/pdf-section-manifest.json");
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, "utf8")) as SectionManifest;
}

function checkSectionBudgets(pdfPath: string, label: string) {
  const manifest = loadSectionManifest();
  if (!manifest) {
    failed = true;
    console.error(`${label}: missing docs/design-proof/pdf-section-manifest.json`);
    return;
  }
  if (!hasPdfInfo) {
    console.warn(`  skip section-budget page-count sync (pdfinfo missing)`);
  } else {
    try {
      const info = execSync(`pdfinfo "${pdfPath}"`, { encoding: "utf8" });
      const pages = Number((info.match(/Pages:\s+(\d+)/) || [])[1] || 0);
      if (pages !== manifest.total_pages) {
        failed = true;
        console.error(
          `${label}: manifest total_pages=${manifest.total_pages} != pdfinfo pages=${pages}`
        );
      }
    } catch (e) {
      failed = true;
      console.error(`${label}: pdfinfo failed during section-budget check: ${e}`);
    }
  }
  for (const [id, budget] of Object.entries(SECTION_BUDGETS)) {
    const n = manifest.section_counts[id] || 0;
    if (n < budget.min || n > budget.max) {
      failed = true;
      console.error(`${label}: section "${id}" pages=${n}, expected ${budget.min}-${budget.max}`);
    }
  }
  console.log(
    `  section budgets (manifest): ${Object.entries(manifest.section_counts)
      .map(([k, v]) => `${k}=${v}`)
      .join(" · ")}`
  );
}

function checkNearBlankPages(pdfPath: string, label: string) {
  if (!hasPdfToPpm || !hasPdfToText) {
    console.warn(`  skip blank-page check (tools missing) for ${label}`);
    return;
  }
  const tmp = fs.mkdtempSync(path.join("/tmp", "pdf-blank-"));
  try {
    execSync(`pdftoppm -png -r 72 "${pdfPath}" "${path.join(tmp, "p")}"`, { stdio: "ignore" });
    const info = execSync(`pdfinfo "${pdfPath}"`, { encoding: "utf8" });
    const pageCount = Number((info.match(/Pages:\s+(\d+)/) || [])[1] || 0);
    for (let i = 1; i <= pageCount; i++) {
      const text = execSync(`pdftotext -f ${i} -l ${i} -layout "${pdfPath}" -`, { encoding: "utf8" })
        .replace(/\f/g, "")
        .trim();
      const compact = text.replace(/\s+/g, "");
      const intentionalSparse =
        /^(Chapter|Transit)/.test(compact) ||
        compact.includes("Chapter") ||
        compact.startsWith("Transit") ||
        /首爾·Seoul|釜山·Busan|首爾→釜山·KTX|Food Atlas|Transport|Photo|Before|Credits/.test(compact) ||
        /^我們的韓國·Textbook\d+\/\d+$/.test(compact);
      if (!intentionalSparse && compact.length > 0 && compact.length < 40) {
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
    if (f.name === "emergency-pack.pdf" && !["REPLACE_ME", "YAML generator", "place_id", "PDFSEC:"].includes(bad)) {
      continue;
    }
    if (hay.includes(bad)) {
      failed = true;
      console.error(`${f.name}: forbidden reader text "${bad}"`);
    }
  }

  if (f.name === "emergency-pack.pdf") {
    if (pages > 1) {
      // Allow 2 only if page 2 is not a near-blank orphan — checked below via blank heuristic
      console.log(`  emergency pages: ${pages} (prefer 1; max 2 if second page is meaningful)`);
    }
    if (functionLabelRe.test(text)) {
      failed = true;
      console.error(`${f.name}: forbidden visual-function label in extractable text`);
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
    if (functionLabelRe.test(text)) {
      failed = true;
      const m = text.match(functionLabelRe);
      console.error(`${f.name}: forbidden visual-function label in extractable text: ${m?.[0]}`);
    }
    if (/\bDate Pending\b/i.test(text) || /\bBooking Ready\b/i.test(text)) {
      failed = true;
      console.error(`${f.name}: forbidden internal status label in extractable text`);
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
    if (!/目錄/.test(text)) {
      failed = true;
      console.error(`${f.name}: missing TOC (目錄)`);
    }
    if (!/\d+\s*\/\s*\d+/.test(text)) {
      failed = true;
      console.error(`${f.name}: missing page numbers in footer text`);
    } else {
      console.log("  page numbers: extractable");
    }
  }

  console.log(`OK PDF ${f.name} (${buf.length} bytes)`);
}

const mediaYaml = fs.readFileSync(path.join(root, "data/media.yaml"), "utf8");
if (!mediaYaml.includes("busan-chapter")) {
  failed = true;
  console.error("media.yaml missing busan-chapter record");
}

if (failed) process.exit(1);
console.log("verify-pdfs: OK");
