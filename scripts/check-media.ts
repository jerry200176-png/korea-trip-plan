import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { root } from "./lib/root.ts";

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);

const schema = JSON.parse(fs.readFileSync(path.join(root, "schemas/media.json"), "utf8"));
const raw = yaml.load(fs.readFileSync(path.join(root, "data/media.yaml"), "utf8")) as {
  media: any[];
  kto_candidates: any[];
};

const validate = ajv.compile(schema);
let failed = false;
function fail(msg: string) {
  failed = true;
  console.error(`check-media: ${msg}`);
}

if (!validate(raw)) {
  fail("schema validation failed");
  console.error(validate.errors);
}

const vague = /網路圖片|internet image|from the web|google images|random image/i;
const bannedPlatform = /google images|instagram|pinterest|blogspot|news|travel agency/i;
const ids = new Set<string>();

const largeTypes = new Set(["photo", "generated_illustration"]);
let largeCount = 0;

for (const m of raw.media ?? []) {
  if (ids.has(m.id)) fail(`duplicate id ${m.id}`);
  ids.add(m.id);

  if (vague.test(String(m.source_url)) || vague.test(String(m.source_platform)) || vague.test(String(m.attribution))) {
    fail(`${m.id}: vague source wording forbidden`);
  }
  if (bannedPlatform.test(String(m.source_platform)) || bannedPlatform.test(String(m.source_url))) {
    fail(`${m.id}: banned source platform`);
  }
  if (!m.license || String(m.license).trim().length < 2) {
    fail(`${m.id}: missing license`);
  }
  if (!m.creator || String(m.creator).trim().length < 2) {
    fail(`${m.id}: missing creator`);
  }

  const local = path.join(root, m.local_path);
  if (!fs.existsSync(local)) fail(`${m.id}: missing local_path ${m.local_path}`);
  if (m.web_path && !fs.existsSync(path.join(root, m.web_path))) {
    fail(`${m.id}: missing web_path ${m.web_path}`);
  }
  if (m.pdf_path && !fs.existsSync(path.join(root, m.pdf_path))) {
    fail(`${m.id}: missing pdf_path ${m.pdf_path}`);
  }
  if (m.type === "generated_illustration") {
    if (!m.prompt_path || !fs.existsSync(path.join(root, m.prompt_path))) {
      fail(`${m.id}: generated_illustration requires prompt_path file`);
    }
    if (!m.generation_tool || !m.generation_date) {
      fail(`${m.id}: generated_illustration requires generation_tool and generation_date`);
    }
  }
  if (m.status === "Approved" && m.usage_scope?.includes("pdf") && !m.license) {
    fail(`${m.id}: PDF usage requires license`);
  }
  if (largeTypes.has(m.type) && m.status === "Approved") largeCount += 1;
}

if (largeCount > 10) {
  fail(`too many large media items (${largeCount}); Media Edition cap is 8–10`);
}

for (const k of raw.kto_candidates ?? []) {
  if (k.status === "NeedsFounderAction" && !k.founder_action) {
    fail(`${k.id}: NeedsFounderAction requires founder_action`);
  }
}

if (failed) process.exit(1);
console.log(`check-media: OK (${raw.media.length} items, ${largeCount} large approved, ${raw.kto_candidates.length} KTO candidates)`);
