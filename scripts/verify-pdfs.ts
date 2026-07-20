import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { distDir, root } from "./lib/root.ts";

const files = [
  { name: "korea-trip-handbook.pdf", minBytes: 80000, minPages: 10, maxPages: 20 },
  { name: "emergency-pack.pdf", minBytes: 8000, minPages: 1, maxPages: 3 },
];

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
        /首爾·Seoul|釜山·Busan|首爾→釜山·KTX/.test(compact);
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
