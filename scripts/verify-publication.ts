import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import {
  OUTPUT_FILES,
  RENDER_DIRS,
  MIN_HANDBOOK_BYTES,
  MIN_EMERGENCY_BYTES,
  MIN_DESIGN_PROOF_BYTES,
  CJK_EXTRACT_SAMPLES,
  FORBIDDEN_BODY_PATTERNS,
} from "./lib/publication-config.ts";
import { distDir, root } from "./lib/root.ts";

function fail(msg: string): never {
  console.error(`verify-publication: FAIL — ${msg}`);
  process.exit(1);
}

function pdfPageCount(pdfPath: string): number {
  const info = spawnSync("pdfinfo", [pdfPath], { encoding: "utf8" });
  if (info.status !== 0) fail(`pdfinfo failed for ${pdfPath}`);
  const m = info.stdout.match(/Pages:\s+(\d+)/);
  return m ? Number(m[1]) : 0;
}

function pdffontsOutput(pdfPath: string): string {
  const r = spawnSync("pdffonts", [pdfPath], { encoding: "utf8" });
  if (r.status !== 0) fail(`pdffonts failed for ${pdfPath}`);
  return r.stdout;
}

function assertEmbeddedCjk(fontsOut: string, label: string): void {
  if (/Helvetica/i.test(fontsOut) && !/Noto/i.test(fontsOut)) {
    fail(`${label}: Helvetica-only PDF detected`);
  }
  const lines = fontsOut.split("\n").slice(2).filter((l) => l.trim().length > 0);
  const embeddedNoto = lines.filter(
    (l) => /Noto/i.test(l) && /\byes\b.*\byes\b.*\byes\b/.test(l)
  );
  if (embeddedNoto.length < 2) {
    fail(`${label}: expected embedded Noto CJK fonts, got ${embeddedNoto.length} rows`);
  }
  const identityH = embeddedNoto.filter((l) => /Identity-H/i.test(l));
  if (identityH.length < 1) {
    fail(`${label}: expected Identity-H CJK encoding`);
  }
  console.log(`${label} pdffonts OK (${embeddedNoto.length} Noto rows, Identity-H present)`);
}

function pdfText(pdfPath: string): string {
  const r = spawnSync("pdftotext", [pdfPath, "-"], { encoding: "utf8" });
  if (r.status !== 0) fail(`pdftotext failed for ${pdfPath}`);
  return r.stdout;
}

function assertSamples(text: string, pdfLabel: string): void {
  for (const sample of CJK_EXTRACT_SAMPLES) {
    if (!text.includes(sample)) {
      fail(`${pdfLabel}: missing extracted text «${sample}»`);
    }
  }
  console.log(`${pdfLabel}: Unicode extraction OK`);
}

function assertNoForbidden(text: string, pdfLabel: string): void {
  for (const re of FORBIDDEN_BODY_PATTERNS) {
    if (re.test(text)) {
      fail(`${pdfLabel}: forbidden pattern ${re}`);
    }
  }
}

function assertFile(p: string, minBytes: number): void {
  if (!fs.existsSync(p)) fail(`missing ${p}`);
  const size = fs.statSync(p).size;
  if (size < minBytes) fail(`${path.basename(p)} too small (${size} bytes)`);
  const pages = pdfPageCount(p);
  if (pages < 1) fail(`${path.basename(p)} has 0 pages`);
  console.log(`OK ${path.basename(p)} — ${size} bytes, ${pages} pages`);
}

function assertRenders(dir: string, minPages: number): void {
  if (!fs.existsSync(dir)) fail(`missing render dir ${dir}`);
  const pngs = fs.readdirSync(dir).filter((f) => f.endsWith(".png"));
  if (pngs.length < minPages) fail(`${dir}: expected >= ${minPages} PNGs, got ${pngs.length}`);
  console.log(`OK renders ${dir} (${pngs.length} PNGs)`);
}

function checkRemoteFontCss(): void {
  const siteDist = path.join(root, "site/dist");
  /** Built CSS is hashed — scan site dist for google fonts */
  const walk = (d: string): void => {
    if (!fs.existsSync(d)) return;
    for (const ent of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, ent.name);
      if (ent.isDirectory()) walk(p);
      else if (ent.name.endsWith(".css") || ent.name.endsWith(".html")) {
        const c = fs.readFileSync(p, "utf8");
        if (/fonts\.googleapis\.com/i.test(c)) {
          fail(`remote font reference in ${p}`);
        }
      }
    }
  };
  walk(siteDist);
  console.log("OK no Google Fonts CDN in site dist");
}

function assertFontFiles(): void {
  const fontsDir = path.join(root, "site/node_modules/@fontsource");
  if (!fs.existsSync(fontsDir)) fail("@fontsource packages missing in site/");
  for (const pkg of ["noto-sans-tc", "noto-serif-tc", "noto-sans-kr"]) {
    if (!fs.existsSync(path.join(fontsDir, pkg))) fail(`missing @fontsource/${pkg}`);
  }
  console.log("OK local @fontsource packages present");
}

assertFontFiles();
checkRemoteFontCss();

assertFile(OUTPUT_FILES.designProof, MIN_DESIGN_PROOF_BYTES);
assertFile(OUTPUT_FILES.handbook, MIN_HANDBOOK_BYTES);
assertFile(OUTPUT_FILES.emergency, MIN_EMERGENCY_BYTES);

const handbookFonts = pdffontsOutput(OUTPUT_FILES.handbook);
console.log("--- pdffonts handbook ---\n" + handbookFonts);
assertEmbeddedCjk(handbookFonts, "handbook");

const handbookText = pdfText(OUTPUT_FILES.handbook);
assertSamples(handbookText, "handbook");
assertNoForbidden(handbookText, "handbook");

const emergencyText = pdfText(OUTPUT_FILES.emergency);
if (!/112/.test(emergencyText) || !/119/.test(emergencyText)) {
  fail("emergency: missing 112/119");
}
if (!/갑각류/.test(emergencyText)) {
  fail("emergency: missing Korean allergy phrase");
}

assertRenders(RENDER_DIRS.designProof, 5);
assertRenders(RENDER_DIRS.handbook, 8);

if (!fs.existsSync(OUTPUT_FILES.contactSheet)) fail("missing publication contact sheet");
if (!fs.existsSync(OUTPUT_FILES.designProofContact)) fail("missing design-proof contact sheet");

console.log("verify-publication: PASS");
