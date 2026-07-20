import fs from "node:fs";
import path from "node:path";
import { root } from "./lib/root.ts";

const tokensPath = path.join(root, "site/src/styles/tokens.css");
const globalPath = path.join(root, "site/src/styles/global.css");
const allowlistPath = path.join(root, "scripts/css-hex-allowlist.txt");

const tokenCss = fs.readFileSync(tokensPath, "utf8");
const globalCss = fs.readFileSync(globalPath, "utf8");

const tokenHex = new Set(
  [...tokenCss.matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map((m) => m[0].toLowerCase())
);

const allowlist = new Set(
  fs.existsSync(allowlistPath)
    ? fs
        .readFileSync(allowlistPath, "utf8")
        .split("\n")
        .map((l) => l.trim().toLowerCase())
        .filter(Boolean)
    : []
);

const hexRe = /#[0-9a-fA-F]{3,8}\b/g;
let failed = false;

for (const [file, css] of [
  ["tokens.css", tokenCss],
  ["global.css", globalCss],
] as const) {
  const lines = css.split("\n");
  lines.forEach((line, i) => {
    if (line.trim().startsWith("/*")) return;
    for (const m of line.matchAll(hexRe)) {
      const hex = m[0].toLowerCase();
      if (file === "tokens.css") continue;
      if (tokenHex.has(hex) || allowlist.has(hex)) continue;
      failed = true;
      console.error(`${file}:${i + 1} raw hex ${hex} not in tokens.css or allowlist`);
    }
  });
}

const handbook = fs.readFileSync(path.join(root, "site/src/layouts/Handbook.astro"), "utf8");
const cjkFonts =
  /Noto Sans TC|Noto Sans KR|Noto Serif TC|Noto\+Sans\+TC|Noto\+Sans\+KR|Noto\+Serif\+TC/.test(tokenCss) &&
  /Noto Sans TC|Noto Sans KR|Noto Serif TC|Noto\+Sans\+TC|Noto\+Sans\+KR|Noto\+Serif\+TC/.test(handbook);

if (!cjkFonts) {
  failed = true;
  console.error("CJK font stacks not configured");
}

if (failed) process.exit(1);
console.log("check-css-tokens: OK");
