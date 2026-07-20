import fs from "node:fs";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { chromium } from "playwright";
import {
  PUBLICATION_ROUTES,
  OUTPUT_FILES,
  RENDER_DIRS,
  PREVIEW_HOST,
  PREVIEW_PORT,
  vendorPagedJsPath,
  ensureDistDirs,
} from "./lib/publication-config.ts";
import { root, siteDistDir } from "./lib/root.ts";

function copyPagedJs(): void {
  const src = path.join(root, "node_modules/pagedjs/dist/paged.polyfill.js");
  if (!fs.existsSync(src)) {
    console.error("Missing pagedjs — run npm install");
    process.exit(1);
  }
  fs.copyFileSync(src, vendorPagedJsPath());
  console.log("Copied Paged.js polyfill to site/public/vendor/");
}

function startPreview(): ReturnType<typeof spawn> {
  const child = spawn(
    "npx",
    ["astro", "preview", "--host", PREVIEW_HOST, "--port", String(PREVIEW_PORT)],
    {
      cwd: path.join(root, "site"),
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, NODE_ENV: "production" },
    }
  );
  return child;
}

async function waitForServer(url: string, timeoutMs = 60_000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Preview server did not start: ${url}`);
}

async function renderPdf(
  browser: Awaited<ReturnType<typeof chromium.launch>>,
  url: string,
  outPath: string
): Promise<void> {
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle", timeout: 120_000 });
  await page.evaluate(() => (window as any).__PUBLICATION_READY__);
  await page.waitForTimeout(1500);
  await page.pdf({
    path: outPath,
    preferCSSPageSize: true,
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  });
  await page.close();
  console.log(`Wrote ${outPath}`);
}

function renderPagesToPng(pdfPath: string, outDir: string, prefix: string): string[] {
  fs.mkdirSync(outDir, { recursive: true });
  const existing = fs.readdirSync(outDir).filter((f) => f.startsWith(prefix));
  for (const f of existing) fs.unlinkSync(path.join(outDir, f));

  const result = spawnSync(
    "pdftoppm",
    ["-png", "-r", "200", pdfPath, path.join(outDir, prefix)],
    { encoding: "utf8" }
  );
  if (result.status !== 0) {
    console.error(result.stderr || result.stdout);
    throw new Error(`pdftoppm failed for ${pdfPath}`);
  }
  return fs
    .readdirSync(outDir)
    .filter((f) => f.startsWith(prefix) && f.endsWith(".png"))
    .sort()
    .map((f) => path.join(outDir, f));
}

async function buildContactSheet(pngPaths: string[], outPath: string): Promise<void> {
  if (pngPaths.length === 0) {
    throw new Error("No PNGs for contact sheet");
  }
  const sharp = (await import("sharp")).default;
  const thumbs = await Promise.all(
    pngPaths.map(async (p) => {
      const buf = await sharp(p).resize({ width: 320 }).png().toBuffer();
      const meta = await sharp(buf).metadata();
      return { buf, width: meta.width ?? 320, height: meta.height ?? 450 };
    })
  );
  const cols = Math.min(4, thumbs.length);
  const rows = Math.ceil(thumbs.length / cols);
  const cellW = Math.max(...thumbs.map((t) => t.width));
  const cellH = Math.max(...thumbs.map((t) => t.height));
  const width = cols * cellW + (cols + 1) * 8;
  const height = rows * cellH + (rows + 1) * 8;
  const composites: { input: Buffer; left: number; top: number }[] = [];
  thumbs.forEach((t, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    composites.push({
      input: t.buf,
      left: 8 + col * (cellW + 8),
      top: 8 + row * (cellH + 8),
    });
  });
  await sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: 240, g: 236, b: 230 },
    },
  })
    .composite(composites)
    .png()
    .toFile(outPath);
  console.log(`Contact sheet: ${outPath}`);
}

async function main(): Promise<void> {
  ensureDistDirs();
  copyPagedJs();

  if (!fs.existsSync(siteDistDir)) {
    console.error("site/dist missing — run npm run build:site first");
    process.exit(1);
  }

  const preview = startPreview();
  const baseUrl = `http://${PREVIEW_HOST}:${PREVIEW_PORT}`;

  try {
    await waitForServer(`${baseUrl}/korea-trip-plan/print/design-proof/`);

    const browser = await chromium.launch({ headless: true });

    await renderPdf(
      browser,
      `${baseUrl}${PUBLICATION_ROUTES.designProof}`,
      OUTPUT_FILES.designProof
    );
    await renderPdf(
      browser,
      `${baseUrl}${PUBLICATION_ROUTES.handbook}`,
      OUTPUT_FILES.handbook
    );
    await renderPdf(
      browser,
      `${baseUrl}${PUBLICATION_ROUTES.emergency}`,
      OUTPUT_FILES.emergency
    );

    await browser.close();

    const proofPngs = renderPagesToPng(
      OUTPUT_FILES.designProof,
      RENDER_DIRS.designProof,
      "page"
    );
    const handbookPngs = renderPagesToPng(
      OUTPUT_FILES.handbook,
      RENDER_DIRS.handbook,
      "page"
    );

    await buildContactSheet(proofPngs, OUTPUT_FILES.designProofContact);
    await buildContactSheet(handbookPngs.slice(0, 16), OUTPUT_FILES.contactSheet);
  } finally {
    preview.kill("SIGKILL");
  }
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
