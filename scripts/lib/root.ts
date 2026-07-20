import path from "node:path";
import { fileURLToPath } from "node:url";

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
export const dataDir = path.join(root, "data");
export const distDir = path.join(root, "dist");
export const siteDistDir = path.join(root, "site/dist");
