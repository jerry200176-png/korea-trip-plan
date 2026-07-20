import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { chromium } from "playwright";
import { root, siteDistDir } from "./lib/root.ts";

const outDir = path.join(root, "docs/design-proof");
fs.mkdirSync(outDir, { recursive: true });

const pages = [
  { path: "/", name: "home" },
  { path: "/days/day-2/", name: "day-2" },
  { path: "/days/day-5/", name: "day-5" },
  { path: "/today/day-2/", name: "today" },
  { path: "/decisions/", name: "decisions" },
  { path: "/emergency/", name: "emergency" },
];

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webmanifest": "application/manifest+json",
  ".pdf": "application/pdf",
  ".woff2": "font/woff2",
};

function resolveFile(urlPath: string): string | null {
  let rel = urlPath.split("?")[0];
  // Astro base is /korea-trip-plan
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
    ["mobile", { width: 390, height: 844 }],
    ["desktop", { width: 1280, height: 900 }],
  ] as const) {
    const page = await browser.newPage({ viewport: vp });
    await page.goto(`${origin}${p.path}`, { waitUntil: "networkidle" });
    // Wait for CSS to apply (warm canvas)
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
    await page.close();
  }
}

// PDF page screenshots via Chromium print HTML (from PDF file bytes as images)
const pdfFiles = ["korea-trip-handbook.pdf", "emergency-pack.pdf"];
for (const pdf of pdfFiles) {
  const src = path.join(root, "dist", pdf);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(outDir, pdf));
  }
}

// Render PDF pages to PNG using Chromium's PDF viewer is unreliable;
// instead re-open the HTML print documents and screenshot A4-ish viewports.
const { wrapHtml } = await import("./lib/pdf-html.ts");
const yaml = await import("js-yaml");
const trip = yaml.load(fs.readFileSync(path.join(root, "data/trip.yaml"), "utf8")) as any;
const itinerary = yaml.load(fs.readFileSync(path.join(root, "data/itinerary.yaml"), "utf8")) as any;
const emergency = yaml.load(fs.readFileSync(path.join(root, "data/emergency-public.yaml"), "utf8")) as any;
const day2 = itinerary.days.find((d: any) => d.day_index === 2);
const day5 = itinerary.days.find((d: any) => d.day_index === 5);

const pdfPages: { name: string; html: string }[] = [
  {
    name: "pdf-cover",
    html: wrapHtml(
      "Cover",
      `<div class="cover"><p class="eyebrow">Our First Korea</p><h1>${trip.title}</h1><p class="lede">${trip.success_criterion}</p><p>首爾四晚 · 釜山兩晚 · ${trip.target_month}</p></div>`
    ),
  },
  {
    name: "pdf-toc",
    html: wrapHtml(
      "TOC",
      `<section class="toc"><h2>目錄</h2><ol><li>封面</li><li>Day 2 — ${day2.theme}</li><li>Day 5 — ${day5.theme}</li></ol></section>`
    ),
  },
  {
    name: "pdf-day-2",
    html: wrapHtml(
      "Day2",
      `<section class="day"><p class="eyebrow">Day 2</p><h1>${day2.theme}</h1><p><strong>今天最重要：</strong>${day2.one_priority}</p><p class="status">暫定</p></section>`
    ),
  },
  {
    name: "pdf-day-5",
    html: wrapHtml(
      "Day5",
      `<section class="day"><p class="eyebrow">Day 5</p><h1>${day5.theme}</h1><p><strong>今天最重要：</strong>${day5.one_priority}</p><p class="status">暫定</p></section>`
    ),
  },
  {
    name: "pdf-emergency",
    html: wrapHtml(
      "Emergency",
      `<section class="emergency"><h1>緊急協助</h1><p class="big">${emergency.korea.police} 警察 · ${emergency.korea.fire_ambulance} 消防／醫療</p><p lang="ko">${emergency.phrases_ko.help}</p></section>`
    ),
  },
];

for (const pp of pdfPages) {
  const page = await browser.newPage({ viewport: { width: 794, height: 1123 } });
  await page.setContent(pp.html, { waitUntil: "networkidle" });
  await page.screenshot({ path: path.join(outDir, `${pp.name}.png`), fullPage: true });
  await page.close();
}

const webImgs = fs
  .readdirSync(outDir)
  .filter((f) => f.endsWith(".png") && !f.startsWith("pdf-"))
  .sort();
const pdfImgs = fs
  .readdirSync(outDir)
  .filter((f) => f.startsWith("pdf-") && f.endsWith(".png"))
  .sort();

const sheetCss = `body{font-family:system-ui;background:#1c2420;color:#f7f4ed;padding:24px}h1{font-size:1.25rem}img{width:min(320px,100%);border:1px solid #5a635c;margin:8px;background:#f7f4ed}figure{display:inline-block;vertical-align:top;max-width:320px}`;
fs.writeFileSync(
  path.join(outDir, "website-contact-sheet.html"),
  `<!DOCTYPE html><html lang="zh-Hant"><head><meta charset="utf-8"/><title>Website contact sheet</title><style>${sheetCss}</style></head><body><h1>Website contact sheet</h1>${webImgs.map((i) => `<figure><figcaption>${i}</figcaption><img src="${i}" alt="${i}"/></figure>`).join("")}</body></html>`
);
fs.writeFileSync(
  path.join(outDir, "pdf-contact-sheet.html"),
  `<!DOCTYPE html><html lang="zh-Hant"><head><meta charset="utf-8"/><title>PDF contact sheet</title><style>${sheetCss}</style></head><body><h1>PDF contact sheet</h1>${pdfImgs.map((i) => `<figure><figcaption>${i}</figcaption><img src="${i}" alt="${i}"/></figure>`).join("")}</body></html>`
);

await browser.close();
server.close();

if (failed) process.exit(1);
console.log(`capture-visual: wrote ${outDir} (${webImgs.length} web + ${pdfImgs.length} pdf shots)`);
