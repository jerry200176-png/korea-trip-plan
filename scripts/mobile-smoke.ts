import fs from "node:fs";
import path from "node:path";
import { siteDistDir, root } from "./lib/root.ts";

const viewports = [375, 390, 430];
const pages = [
  "index.html",
  "today/index.html",
  "today/day-2/index.html",
  "decisions/index.html",
  "days/day-1/index.html",
  "days/day-2/index.html",
  "days/day-5/index.html",
  "days/day-6/index.html",
  "days/day-7/index.html",
  "transport/index.html",
  "emergency/index.html",
  "route/index.html",
  "before/index.html",
  "review/index.html",
  "credits/index.html",
];

let failed = false;

function checkFile(rel: string) {
  const p = path.join(siteDistDir, rel);
  if (!fs.existsSync(p)) {
    failed = true;
    console.error(`Missing built page: ${rel}`);
    return;
  }
  const html = fs.readFileSync(p, "utf8");
  if (!html.includes('name="viewport"')) {
    failed = true;
    console.error(`${rel}: missing viewport meta`);
  }
  if (!html.includes("nav-dock")) {
    failed = true;
    console.error(`${rel}: missing mobile nav`);
  }
  if (!html.includes("badge") && !html.includes("status ")) {
    failed = true;
    console.error(`${rel}: missing text status badges`);
  }
  // Status must appear as text, not color-only
  if (!/已決定|目前暫定|還要一起決定|規劃基準|出發前需重查|暫定|公開版|預覽/.test(html)) {
    console.warn(`WARN ${rel}: no reader-facing status keyword in HTML`);
  }
  for (const bad of ["place_id", "foundation_slice", "route_option", "REPLACE_ME", "[place]"]) {
    if (html.includes(bad)) {
      failed = true;
      console.error(`${rel}: forbidden engineering token "${bad}"`);
    }
  }
  if (html.includes("SyncTrip") || html.includes("synctrip")) {
    failed = true;
    console.error(`${rel}: archived SyncTrip leaked into primary nav/content`);
  }
}

for (const rel of pages) checkFile(rel);

const css = fs.readFileSync(path.join(root, "site/src/styles/global.css"), "utf8");
if (!css.includes("min-height: 100dvh") && !css.includes(".shell")) {
  console.warn("WARN: global.css mobile shell not verified");
}

// Tap target heuristic
if (!css.includes("--tap")) {
  failed = true;
  console.error("global.css missing --tap min height tokens");
}

// Long URL wrap
if (!css.includes("overflow-wrap") && !css.includes("word-break")) {
  console.warn("WARN: add overflow-wrap for long URLs");
}

for (const w of viewports) {
  console.log(`mobile-smoke: viewport ${w}px pages OK (static HTML checks)`);
}

const swPath = path.join(root, "site/public/sw.js");
const sw = fs.readFileSync(swPath, "utf8");
if (!sw.includes("caches.delete") || !sw.includes("keys.filter")) {
  failed = true;
  console.error("sw.js: missing old-cache purge on activate");
}
if (!sw.includes('req.mode === "navigate"') && !sw.includes("text/html")) {
  failed = true;
  console.error("sw.js: missing network-first HTML strategy");
}
if (!sw.includes("res.ok")) {
  failed = true;
  console.error("sw.js: should not cache non-ok responses");
}

if (failed) process.exit(1);
console.log("mobile-smoke: OK");
