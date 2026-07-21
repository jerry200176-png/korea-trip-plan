/**
 * Scrub reader-facing visual-function labels from diagram SVGs, then convert
 * <text> to paths using embedded Noto CJK OTFs so <img>-loaded SVGs render
 * without depending on unembedded system fonts.
 *
 * Writes identical bytes to media/diagrams/ and site/public/media/.
 */
import fs from "node:fs";
import path from "node:path";
import opentype from "opentype.js";
import { root } from "./lib/root.ts";
import { scrubVisualFunctionLabels } from "./lib/reader-sanitize-extra.ts";

const diagramsDir = path.join(root, "media/diagrams");
const publicDir = path.join(root, "site/public/media");
const fontDir = path.join(root, ".fonts");

function loadFont(name: string) {
  const buf = fs.readFileSync(path.join(fontDir, name));
  return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
}

const fontRegular = loadFont("NotoSansCJKtc-Regular.otf");
const fontBold = loadFont("NotoSansCJKtc-Bold.otf");

function decodeXml(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function encodeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function scrubXmlTextContent(svg: string): string {
  // title / desc
  svg = svg.replace(/<(title|desc)(\s[^>]*)?>([\s\S]*?)<\/\1>/gi, (_m, tag, attrs = "", body) => {
    const cleaned = scrubVisualFunctionLabels(decodeXml(body));
    return `<${tag}${attrs || ""}>${encodeXml(cleaned)}</${tag}>`;
  });
  // text nodes (including nested tspan later flattened)
  svg = svg.replace(/<text(\s[^>]*)?>([\s\S]*?)<\/text>/gi, (full, attrs = "", body) => {
    if (/<tspan/i.test(body)) {
      const scrubbed = body.replace(/<tspan(\s[^>]*)?>([\s\S]*?)<\/tspan>/gi, (_m, a = "", t) => {
        return `<tspan${a}>${encodeXml(scrubVisualFunctionLabels(decodeXml(t)))}</tspan>`;
      });
      // also scrub direct text leftovers
      return `<text${attrs}>${scrubbed}</text>`;
    }
    const cleaned = scrubVisualFunctionLabels(decodeXml(body));
    return `<text${attrs}>${encodeXml(cleaned)}</text>`;
  });
  return svg;
}

function attr(attrs: string, name: string): string | null {
  const re = new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`, "i");
  const m = attrs.match(re);
  return m ? m[1] : null;
}

function styleVal(attrs: string, prop: string): string | null {
  const style = attr(attrs, "style") || "";
  const m = style.match(new RegExp(`${prop}\\s*:\\s*([^;]+)`, "i"));
  return m ? m[1].trim() : null;
}

function classFontSize(className: string | null): number | null {
  if (!className) return null;
  if (/\btitle\b/.test(className)) return 28;
  if (/\bh\b/.test(className)) return 16;
  if (/\btag\b/.test(className)) return 12;
  if (/\btt\b/.test(className)) return 12;
  if (/\bmuted\b/.test(className)) return 12;
  if (/\bt\b/.test(className)) return 13;
  return null;
}

function isBold(attrs: string): boolean {
  const fw = attr(attrs, "font-weight") || styleVal(attrs, "font-weight") || "";
  const className = attr(attrs, "class") || "";
  if (/bold|700|600/i.test(fw)) return true;
  if (/\b(title|h|tag)\b/.test(className)) return true;
  return false;
}

function resolveFontSize(attrs: string): number {
  const direct = attr(attrs, "font-size") || styleVal(attrs, "font-size");
  if (direct) {
    const n = parseFloat(direct);
    if (!Number.isNaN(n)) return n;
  }
  return classFontSize(attr(attrs, "class")) ?? 14;
}

function resolveFill(attrs: string): string {
  return attr(attrs, "fill") || styleVal(attrs, "fill") || "#2c2416";
}

function convertTextsToPaths(svg: string): string {
  return svg.replace(/<text(\s[^>]*)?>([\s\S]*?)<\/text>/gi, (full, attrs = "", body) => {
    // Flatten simple tspans into one line if present (join)
    let text = body;
    if (/<tspan/i.test(body)) {
      const parts: string[] = [];
      body.replace(/<tspan(\s[^>]*)?>([\s\S]*?)<\/tspan>/gi, (_m, _a, t) => {
        parts.push(decodeXml(t));
        return "";
      });
      // leftover direct text
      const leftover = body.replace(/<tspan[\s\S]*?<\/tspan>/gi, "").replace(/<[^>]+>/g, "");
      if (leftover.trim()) parts.unshift(decodeXml(leftover));
      text = parts.join(" ");
    } else {
      text = decodeXml(body);
    }
    text = text.replace(/\s+/g, " ").trim();
    if (!text) return "";

    const x = parseFloat(attr(attrs, "x") || "0");
    const y = parseFloat(attr(attrs, "y") || "0");
    const fontSize = resolveFontSize(attrs);
    const fill = resolveFill(attrs);
    const font = isBold(attrs) ? fontBold : fontRegular;
    const anchor = attr(attrs, "text-anchor") || styleVal(attrs, "text-anchor") || "start";

    let path;
    try {
      path = font.getPath(text, x, y, fontSize);
    } catch {
      return full; // leave as text if glyph path fails
    }

    if (anchor === "middle" || anchor === "end") {
      const width = font.getAdvanceWidth(text, fontSize);
      const dx = anchor === "middle" ? -width / 2 : -width;
      path = font.getPath(text, x + dx, y, fontSize);
    }

    const d = path.toPathData(2);
    const aria = encodeXml(text);
    return `<path d="${d}" fill="${fill}" aria-label="${aria}"/>`;
  });
}

function processOne(file: string): void {
  const src = path.join(diagramsDir, file);
  let svg = fs.readFileSync(src, "utf8");
  svg = scrubXmlTextContent(svg);
  svg = convertTextsToPaths(svg);
  // Mark as path-rendered for auditors
  if (!svg.includes("data-cjk-paths=")) {
    svg = svg.replace(/<svg\b/, '<svg data-cjk-paths="1"');
  }
  fs.writeFileSync(src, svg);
  fs.writeFileSync(path.join(publicDir, file), svg);
  console.log("OK", file);
}

const files = fs.readdirSync(diagramsDir).filter((f) => f.endsWith(".svg"));
for (const f of files) processOne(f);
console.log(`Processed ${files.length} diagrams → media/diagrams + site/public/media`);
