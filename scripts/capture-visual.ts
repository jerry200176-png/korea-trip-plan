import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { chromium } from "playwright";
import { root, siteDistDir, distDir } from "./lib/root.ts";

const outDir = path.join(root, "docs/design-proof");
fs.mkdirSync(outDir, { recursive: true });

const pages = [
  { path: "/", name: "home" },
  { path: "/guides/", name: "guides" },
  { path: "/route/", name: "route" },
  { path: "/transport/", name: "transport" },
  { path: "/food/", name: "food" },
  { path: "/before/", name: "before" },
  { path: "/packing/", name: "packing" },
  { path: "/shopping/", name: "shopping" },
  { path: "/photo/", name: "photo" },
  { path: "/days/", name: "seoul-chapter" },
  { path: "/days/day-1/", name: "day-1" },
  { path: "/days/day-2/", name: "day-2" },
  { path: "/days/day-5/", name: "ktx" },
  { path: "/days/day-6/", name: "busan-chapter" },
  { path: "/days/day-7/", name: "day-7" },
  { path: "/today/", name: "today-picker" },
  { path: "/today/day-2/", name: "today" },
  { path: "/review/", name: "review" },
  { path: "/decisions/", name: "decisions" },
  { path: "/emergency/", name: "emergency" },
  { path: "/credits/", name: "credits" },
];

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".webmanifest": "application/manifest+json",
  ".pdf": "application/pdf",
  ".woff2": "font/woff2",
};

function resolveFile(urlPath: string): string | null {
  let rel = urlPath.split("?")[0];
  if (rel.startsWith("/korea-trip-plan")) {
    rel = rel.slice("/korea-trip-plan".length) || "/";
  }
  if (rel.endsWith("/")) rel += "index.html";
  const file = path.join(siteDistDir, rel.replace(/^\//, ""));
  if (fs.existsSync(file) && fs.statSync(file).isFile()) return file;
  return null;
}

const server = http.createServer((req, res) => {
  const file = resolveFile(req.url ?? "/");
  if (!file) {
    res.writeHead(404);
    res.end("not found");
    return;
  }
  const ext = path.extname(file);
  res.writeHead(200, { "Content-Type": MIME[ext] ?? "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
});

await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
const { port } = server.address() as { port: number };
const origin = `http://127.0.0.1:${port}/korea-trip-plan`;

let failed = false;
const browser = await chromium.launch();

for (const p of pages) {
  for (const [suffix, vp] of [
    ["390", { width: 390, height: 844 }],
    ["430", { width: 430, height: 932 }],
  ] as const) {
    const page = await browser.newPage({ viewport: vp });
    await page.goto(`${origin}${p.path}`, { waitUntil: "networkidle" });
    await page.waitForFunction(() => {
      const bg = getComputedStyle(document.body).backgroundColor;
      return bg !== "rgba(0, 0, 0, 0)" && bg !== "rgb(255, 255, 255)";
    }, { timeout: 10000 }).catch(() => {
      console.error(`WARN: warm canvas not detected on ${p.name}-${suffix}`);
    });
    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth + 2;
    });
    if (overflow) {
      console.error(`visual overflow: ${p.name} ${suffix}`);
      failed = true;
    }
    await page.screenshot({
      path: path.join(outDir, `${p.name}-${suffix}.png`),
      fullPage: true,
    });
    // also keep mobile/desktop aliases for older docs
    if (suffix === "390") {
      await page.screenshot({ path: path.join(outDir, `${p.name}-mobile.png`), fullPage: true });
    }
    await page.close();
  }
}

for (const pdf of ["korea-trip-handbook.pdf", "emergency-pack.pdf"]) {
  const src = path.join(distDir, pdf);
  if (fs.existsSync(src)) fs.copyFileSync(src, path.join(outDir, pdf));
}

// Render PDF pages at ~200 DPI using pdftoppm
const handbook = path.join(distDir, "korea-trip-handbook.pdf");
const renderDir = path.join(outDir, "pdf-renders");
// Always clear prior renders so a shorter PDF cannot leave stale page-N.png files
// that inflate renders.length and mis-map decisions/credits proofs.
if (fs.existsSync(renderDir)) {
  fs.rmSync(renderDir, { recursive: true, force: true });
}
fs.mkdirSync(renderDir, { recursive: true });
if (fs.existsSync(handbook)) {
  try {
    const { execSync } = await import("node:child_process");
    execSync(`command -v pdftoppm`, { stdio: "ignore" });
    execSync(`pdftoppm -png -r 200 "${handbook}" "${path.join(renderDir, "page")}"`, {
      stdio: "inherit",
    });
    const renders = fs
      .readdirSync(renderDir)
      .filter((f) => /^page-\d+\.png$/.test(f))
      .sort((a, b) => {
        const na = Number((a.match(/page-(\d+)/) || [])[1] || 0);
        const nb = Number((b.match(/page-(\d+)/) || [])[1] || 0);
        return na - nb;
      });
    const wanted = [
      { key: "cover", idx: 0 },
      { key: "toc", idx: 1 },
      { key: "seoul-divider", idx: 5 },
      { key: "day", idx: 7 },
      { key: "ktx", idx: 12 },
      { key: "busan-divider", idx: 14 },
      { key: "food", idx: Math.min(20, Math.max(0, renders.length - 14)) },
      { key: "transport", idx: Math.min(22, Math.max(0, renders.length - 12)) },
      { key: "photo", idx: Math.min(28, Math.max(0, renders.length - 8)) },
      { key: "decisions", idx: Math.max(0, renders.length - 5) },
      { key: "credits", idx: Math.max(0, renders.length - 2) },
    ];
    for (const w of wanted) {
      const srcName = renders[Math.min(w.idx, renders.length - 1)];
      if (srcName) {
        fs.copyFileSync(path.join(renderDir, srcName), path.join(outDir, `pdf-${w.key}.png`));
      }
    }
    console.log(`pdftoppm: ${renders.length} pages @ 200 DPI`);
  } catch (e) {
    console.warn("pdftoppm unavailable or failed — keeping existing pdf-*.png proofs if present");
  }
}

const webImgs = fs
  .readdirSync(outDir)
  .filter((f) => f.endsWith(".png") && !f.startsWith("pdf-") && !f.includes("contact"))
  .sort();
const pdfImgs = fs
  .readdirSync(outDir)
  .filter((f) => f.startsWith("pdf-") && f.endsWith(".png"))
  .sort();

const sheetCss = `body{font-family:system-ui;background:#1c2420;color:#f7f4ed;padding:24px}h1{font-size:1.25rem}img{width:min(280px,100%);border:1px solid #5a635c;margin:8px;background:#f7f4ed}figure{display:inline-block;vertical-align:top;max-width:280px}`;
fs.writeFileSync(
  path.join(outDir, "website-contact-sheet.html"),
  `<!DOCTYPE html><html lang="zh-Hant"><head><meta charset="utf-8"/><title>Website contact sheet</title><style>${sheetCss}</style></head><body><h1>Website contact sheet</h1>${webImgs.map((i) => `<figure><figcaption>${i}</figcaption><img src="${i}" alt="${i}"/></figure>`).join("")}</body></html>`
);
fs.writeFileSync(
  path.join(outDir, "pdf-contact-sheet.html"),
  `<!DOCTYPE html><html lang="zh-Hant"><head><meta charset="utf-8"/><title>PDF contact sheet</title><style>${sheetCss}</style></head><body><h1>PDF contact sheet</h1>${pdfImgs.map((i) => `<figure><figcaption>${i}</figcaption><img src="${i}" alt="${i}"/></figure>`).join("")}</body></html>`
);

// Also rasterize contact sheets for artifacts
const sheetPage = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await sheetPage.goto(`file://${path.join(outDir, "website-contact-sheet.html")}`, { waitUntil: "networkidle" });
await sheetPage.screenshot({ path: path.join(outDir, "website-contact-sheet.png"), fullPage: true });
await sheetPage.goto(`file://${path.join(outDir, "pdf-contact-sheet.html")}`, { waitUntil: "networkidle" });
await sheetPage.screenshot({ path: path.join(outDir, "pdf-contact-sheet.png"), fullPage: true });
await sheetPage.close();

await browser.close();
server.close();

if (failed) process.exit(1);
console.log(`capture-visual: wrote ${outDir} (${webImgs.length} web + ${pdfImgs.length} pdf shots)`);
