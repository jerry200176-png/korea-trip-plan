import fs from "node:fs";
import path from "node:path";
import { distDir, root, siteDistDir } from "./lib/root.ts";

const textExt = new Set([".html", ".css", ".js", ".json", ".txt", ".xml", ".webmanifest"]);
const targetDirs = [siteDistDir, distDir, path.join(root, "site/public/downloads")];

const sensitiveRules: Array<{ label: string; re: RegExp }> = [
  { label: "passport identifier", re: /\b(passport|護照)\s*(no|number|#|號碼)\s*[:#-]?\s*[A-Z0-9]{5,}\b/i },
  { label: "booking/confirmation identifier", re: /\b(booking|confirmation|ticket)\s*(code|number|#)\s*[:#-]?\s*[A-Z0-9]{5,}\b/i },
  { label: "qr payload marker", re: /\bqr(\s*code)?\s*[:#-]?\s*[A-Z0-9]{8,}\b/i },
  { label: "payment details", re: /\b(card number|credit card|cvv|cvc|iban|swift)\b/i },
  { label: "email", re: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi },
  { label: "phone number", re: /(\+886|\+82|09\d{8}|\b\d{3,4}[- ]\d{3,4}[- ]\d{3,4}\b)/gi },
  { label: ".env secret marker", re: /\b(API_KEY|SECRET|TOKEN|DATABASE_URL|PASSWORD)\s*=/i },
  { label: "private key marker", re: /BEGIN (RSA|EC|OPENSSH) PRIVATE KEY/i },
];

let failed = false;

function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

function scanContent(file: string, content: string) {
  for (const rule of sensitiveRules) {
    if (rule.re.test(content)) {
      failed = true;
      console.error(`public-preview-privacy: ${rule.label} matched in ${path.relative(root, file)}`);
    }
  }
}

for (const dir of targetDirs) {
  for (const file of walk(dir)) {
    const ext = path.extname(file);
    if (ext === ".pdf") {
      // PDF text is often plain enough to catch obvious leaks.
      const bytes = fs.readFileSync(file);
      const text = bytes.toString("latin1");
      scanContent(file, text);
      continue;
    }
    if (!textExt.has(ext)) continue;
    const text = fs.readFileSync(file, "utf8");
    scanContent(file, text);
  }
}

if (failed) process.exit(1);
console.log("public-preview-privacy: OK");
