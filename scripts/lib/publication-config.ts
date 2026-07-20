import fs from "node:fs";
import path from "node:path";
import { root, distDir, siteDistDir } from "./root.ts";

export const PUBLICATION_ROUTES = {
  designProof: "/korea-trip-plan/print/design-proof/",
  handbook: "/korea-trip-plan/print/handbook/",
  emergency: "/korea-trip-plan/print/emergency/",
} as const;

export const OUTPUT_FILES = {
  designProof: path.join(distDir, "design-proof.pdf"),
  handbook: path.join(distDir, "korea-trip-handbook-a5.pdf"),
  emergency: path.join(distDir, "emergency-pack.pdf"),
  contactSheet: path.join(distDir, "publication-contact-sheet.png"),
  designProofContact: path.join(distDir, "design-proof-contact-sheet.png"),
} as const;

export const RENDER_DIRS = {
  designProof: path.join(distDir, "design-proof-renders"),
  handbook: path.join(distDir, "publication-renders"),
} as const;

export const PREVIEW_PORT = 8765;
export const PREVIEW_HOST = "127.0.0.1";

export const MIN_HANDBOOK_BYTES = 80_000;
export const MIN_EMERGENCY_BYTES = 15_000;
export const MIN_DESIGN_PROOF_BYTES = 40_000;

export const CJK_EXTRACT_SAMPLES = [
  "第一次一起出國，留下最美好的回憶",
  "서울",
  "부산",
] as const;

export const FORBIDDEN_BODY_PATTERNS = [
  /%EA%B2%BD%EB%B3%B5%EA%B6%81/i,
  /foundation_slice/i,
  /place_id/i,
  /route_option/i,
] as const;

export function vendorPagedJsPath(): string {
  return path.join(root, "site/public/vendor/paged.polyfill.js");
}

export function ensureDistDirs(): void {
  fs.mkdirSync(distDir, { recursive: true });
  fs.mkdirSync(RENDER_DIRS.designProof, { recursive: true });
  fs.mkdirSync(RENDER_DIRS.handbook, { recursive: true });
  fs.mkdirSync(path.dirname(vendorPagedJsPath()), { recursive: true });
}
