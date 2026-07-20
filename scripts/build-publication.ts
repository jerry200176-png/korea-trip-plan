import { spawnSync } from "node:child_process";
import path from "node:path";
import { root } from "./lib/root.ts";

function run(cmd: string, args: string[], cwd = root): void {
  const r = spawnSync(cmd, args, { cwd, stdio: "inherit", shell: false });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

console.log("build-publication: build site");
run("npm", ["run", "build", "--prefix", "site"]);

console.log("build-publication: install Playwright Chromium if needed");
run("npx", ["playwright", "install", "chromium"]);

console.log("build-publication: render PDFs");
run("npx", ["tsx", "scripts/render-publication.ts"]);

console.log("build-publication: verify");
run("npx", ["tsx", "scripts/verify-publication.ts"]);

console.log("build-publication: OK");
