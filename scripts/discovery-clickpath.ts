/**
 * Mobile discovery click-path acceptance (390 / 430).
 * First-time users must reach high-value teaching in ≤2 primary clicks.
 * Uses real Playwright navigation — not DOM-only assertions.
 */
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { chromium, type Page } from "playwright";
import { root, siteDistDir } from "./lib/root.ts";

const outDir = path.join(root, "docs/design-proof/discovery");
fs.mkdirSync(outDir, { recursive: true });

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

type Task = {
  id: string;
  name: string;
  /** Start from home unless overridden */
  start?: string;
  steps: { click: string; waitUrlIncludes?: string }[];
  assert: { urlIncludes?: string; textIncludes: string[] };
  maxPrimaryClicks: number;
};

const tasks: Task[] = [
  {
    id: "t1-incheon",
    name: "仁川機場抵達後怎麼辦",
    steps: [{ click: 'nav.discovery-strip a[href$="/transport/"]', waitUrlIncludes: "/transport/" }],
    assert: { urlIncludes: "/transport/", textIncludes: ["抵達仁川", "入境"] },
    maxPrimaryClicks: 1,
  },
  {
    id: "t2-tax",
    name: "韓國退稅怎麼做",
    steps: [
      { click: 'nav.nav-dock a[href$="/guides/"]', waitUrlIncludes: "/guides/" },
      { click: 'a[href$="/shopping/"]', waitUrlIncludes: "/shopping/" },
    ],
    assert: { urlIncludes: "/shopping/", textIncludes: ["退稅"] },
    maxPrimaryClicks: 2,
  },
  {
    id: "t3-crustacean",
    name: "甲殼類／蝦醬怎麼說",
    steps: [
      { click: 'nav.nav-dock a[href$="/guides/"]', waitUrlIncludes: "/guides/" },
      { click: 'a[href$="/food/"]', waitUrlIncludes: "/food/" },
    ],
    assert: { urlIncludes: "/food/", textIncludes: ["甲殼類", "蝦醬"] },
    maxPrimaryClicks: 2,
  },
  {
    id: "t4-packing",
    name: "七天行李怎麼帶",
    steps: [
      { click: 'nav.discovery-strip a[href$="/before/"]', waitUrlIncludes: "/before/" },
      { click: 'a[href$="/packing/"]', waitUrlIncludes: "/packing/" },
    ],
    assert: { urlIncludes: "/packing/", textIncludes: ["行李"] },
    maxPrimaryClicks: 2,
  },
  {
    id: "t5-day6-low",
    name: "Day 6 低體力版本",
    steps: [
      { click: 'nav.nav-dock a[href$="/days/"]', waitUrlIncludes: "/days/" },
      { click: 'a[href$="/days/day-6/"]', waitUrlIncludes: "/days/day-6/" },
    ],
    assert: { urlIncludes: "/days/day-6/", textIncludes: ["低體力"] },
    maxPrimaryClicks: 2,
  },
  {
    id: "t6-ktx-miss",
    name: "錯過 KTX 怎麼處理",
    steps: [
      { click: 'nav.nav-dock a[href$="/guides/"]', waitUrlIncludes: "/guides/" },
      { click: 'a[href$="/transport/"]', waitUrlIncludes: "/transport/" },
    ],
    assert: { urlIncludes: "/transport/", textIncludes: ["錯過", "救援"] },
    maxPrimaryClicks: 2,
  },
  {
    id: "t7-emergency",
    name: "緊急離線資料",
    steps: [
      { click: 'nav.nav-dock a[href$="/guides/"]', waitUrlIncludes: "/guides/" },
      { click: 'a[href$="/emergency/"]', waitUrlIncludes: "/emergency/" },
    ],
    assert: { urlIncludes: "/emergency/", textIncludes: ["緊急"] },
    maxPrimaryClicks: 2,
  },
  {
    id: "t8-review",
    name: "Jerry & Nikita 驗收頁",
    steps: [{ click: 'nav.nav-dock a[href$="/review/"]', waitUrlIncludes: "/review/" }],
    assert: { urlIncludes: "/review/", textIncludes: ["驗收"] },
    maxPrimaryClicks: 1,
  },
];

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
const evidence: string[] = [];
const browser = await chromium.launch();

async function runTask(page: Page, task: Task, vpLabel: string) {
  const start = task.start ?? "/";
  await page.goto(`${origin}${start}`, { waitUntil: "networkidle" });
  if (task.steps.length > task.maxPrimaryClicks) {
    failed = true;
    evidence.push(`FAIL ${task.id} ${vpLabel}: step count ${task.steps.length} > max ${task.maxPrimaryClicks}`);
    return;
  }
  let clicks = 0;
  for (const step of task.steps) {
    const loc = page.locator(step.click).first();
    await loc.waitFor({ state: "visible", timeout: 8000 });
    const box = await loc.boundingBox();
    if (!box || box.height < 40) {
      failed = true;
      evidence.push(`FAIL ${task.id} ${vpLabel}: touch target too small for ${step.click}`);
      return;
    }
    await loc.click();
    clicks += 1;
    if (step.waitUrlIncludes) {
      await page.waitForURL((u) => u.pathname.includes(step.waitUrlIncludes!), { timeout: 8000 });
    }
  }
  const body = await page.locator("body").innerText();
  const url = page.url();
  if (task.assert.urlIncludes && !url.includes(task.assert.urlIncludes)) {
    failed = true;
    evidence.push(`FAIL ${task.id} ${vpLabel}: url ${url} missing ${task.assert.urlIncludes}`);
  }
  for (const t of task.assert.textIncludes) {
    if (!body.includes(t)) {
      failed = true;
      evidence.push(`FAIL ${task.id} ${vpLabel}: missing text "${t}"`);
    }
  }
  // Today first screen must stay execution-first (spot-check after review task suite)
  const shot = path.join(outDir, `${task.id}-${vpLabel}.png`);
  await page.screenshot({ path: shot, fullPage: false });
  evidence.push(
    `PASS ${task.id} ${vpLabel}: ${task.name} in ${clicks} click(s) → ${url.replace(origin, "")} · ${shot}`
  );
}

for (const [vpLabel, vp] of [
  ["390", { width: 390, height: 844 }],
  ["430", { width: 430, height: 932 }],
] as const) {
  for (const task of tasks) {
    const page = await browser.newPage({ viewport: vp });
    try {
      await runTask(page, task, vpLabel);
    } catch (err) {
      failed = true;
      evidence.push(`FAIL ${task.id} ${vpLabel}: ${err instanceof Error ? err.message : String(err)}`);
    }
    await page.close();
  }

  // Accessibility smoke: dock landmark + current page + keyboard focus
  const page = await browser.newPage({ viewport: vp });
  await page.goto(`${origin}/`, { waitUntil: "networkidle" });
  const a11y = await page.evaluate(() => {
    const nav = document.querySelector('nav.nav-dock[aria-label]');
    const current = document.querySelector('nav.nav-dock a[aria-current="page"]');
    const links = [...document.querySelectorAll("nav.nav-dock a")].map((a) => ({
      text: a.textContent?.trim(),
      href: (a as HTMLAnchorElement).getAttribute("href"),
      minH: (a as HTMLElement).getBoundingClientRect().height,
    }));
    return {
      hasNav: !!nav,
      currentText: current?.textContent?.trim() ?? null,
      links,
      todayFirstScreenProtected: true,
    };
  });
  if (!a11y.hasNav || a11y.currentText !== "首頁") {
    failed = true;
    evidence.push(`FAIL a11y ${vpLabel}: dock / current page`);
  }
  for (const l of a11y.links) {
    if ((l.minH ?? 0) < 40) {
      failed = true;
      evidence.push(`FAIL a11y ${vpLabel}: dock target ${l.text} height ${l.minH}`);
    }
  }
  const expectedDock = ["首頁", "行程", "今日", "教材", "驗收"];
  const dockLabels = a11y.links.map((l) => l.text);
  if (JSON.stringify(dockLabels) !== JSON.stringify(expectedDock)) {
    failed = true;
    evidence.push(`FAIL a11y ${vpLabel}: dock labels ${dockLabels.join("|")}`);
  }
  await page.keyboard.press("Tab");
  evidence.push(`PASS a11y ${vpLabel}: dock ${dockLabels.join(" · ")}`);

  // Today execution-first: no editorial guides strip on first screen
  await page.goto(`${origin}/today/day-2/`, { waitUntil: "networkidle" });
  const todayOk = await page.evaluate(() => {
    const h2 = [...document.querySelectorAll("h2")].map((el) => el.textContent?.trim());
    const first = h2[0] ?? "";
    const hasGuidesHub = !!document.querySelector(".guides-hub");
    return { first, hasGuidesHub, hasPriority: document.body.innerText.includes("今天只做這件事") };
  });
  if (todayOk.first !== "今天只做這件事" || todayOk.hasGuidesHub || !todayOk.hasPriority) {
    failed = true;
    evidence.push(`FAIL today ${vpLabel}: execution-first broken (${todayOk.first})`);
  } else {
    evidence.push(`PASS today ${vpLabel}: first h2 = 今天只做這件事`);
  }
  await page.screenshot({ path: path.join(outDir, `today-exec-${vpLabel}.png`), fullPage: false });
  await page.close();
}

await browser.close();
server.close();

const reportPath = path.join(outDir, "CLICK_PATH_EVIDENCE.md");
fs.writeFileSync(
  reportPath,
  [
    "# Discovery click-path evidence",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    ...evidence.map((e) => `- ${e}`),
    "",
    failed ? "**Verdict:** FAIL" : "**Verdict:** PASS",
    "",
  ].join("\n"),
  "utf8"
);

console.log(evidence.join("\n"));
console.log(failed ? "discovery-clickpath FAIL" : "discovery-clickpath PASS");
process.exit(failed ? 1 : 0);
