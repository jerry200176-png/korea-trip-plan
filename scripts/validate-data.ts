import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const root = path.resolve(import.meta.dirname, "..");
const dataDir = path.join(root, "data");
const schemaDir = path.join(root, "schemas");

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);

const fileSchemaMap: Record<string, string> = {
  "trip.yaml": "trip.json",
  "travelers.yaml": "travelers.json",
  "destinations.yaml": "destinations.json",
  "places.yaml": "places.json",
  "restaurants.yaml": "restaurants.json",
  "itinerary.yaml": "itinerary.json",
  "sources.yaml": "sources.json",
  "budget.yaml": "budget.json",
  "timeline.yaml": "timeline.json",
};

function loadYaml(file: string) {
  return yaml.load(fs.readFileSync(path.join(dataDir, file), "utf8"));
}

function loadSchema(file: string) {
  return JSON.parse(fs.readFileSync(path.join(schemaDir, file), "utf8"));
}

let failed = false;

for (const [dataFile, schemaFile] of Object.entries(fileSchemaMap)) {
  const data = loadYaml(dataFile);
  const schema = loadSchema(schemaFile);
  const validate = ajv.compile(schema);
  const ok = validate(data);
  if (!ok) {
    failed = true;
    console.error(`Schema errors in ${dataFile}:`);
    console.error(validate.errors);
  } else {
    console.log(`OK schema: ${dataFile}`);
  }
}

const places = (loadYaml("places.yaml") as { places: { id: string }[] }).places;
const restaurants = (loadYaml("restaurants.yaml") as { restaurants: { id: string }[] }).restaurants;
const sources = (loadYaml("sources.yaml") as { sources: { id: string }[] }).sources;
const sourceIds = new Set(sources.map((s) => s.id));

function dupCheck(ids: string[], label: string) {
  const seen = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) {
      failed = true;
      console.error(`Duplicate ${label} id: ${id}`);
    }
    seen.add(id);
  }
}

dupCheck(places.map((p) => p.id), "place");
dupCheck(restaurants.map((r) => r.id), "restaurant");
dupCheck(sources.map((s) => s.id), "source");

for (const p of places) {
  const srcs = (p as { source_ids?: string[] }).source_ids ?? [];
  if (srcs.length === 0) {
    failed = true;
    console.error(`Place ${p.id} missing sources`);
  }
  for (const sid of srcs) {
    if (!sourceIds.has(sid)) {
      failed = true;
      console.error(`Place ${p.id} references unknown source ${sid}`);
    }
  }
}

for (const r of restaurants) {
  const srcs = (r as { source_ids?: string[] }).source_ids ?? [];
  if (srcs.length === 0) {
    failed = true;
    console.error(`Restaurant ${r.id} missing sources`);
  }
  for (const sid of srcs) {
    if (!sourceIds.has(sid)) {
      failed = true;
      console.error(`Restaurant ${r.id} references unknown source ${sid}`);
    }
  }
}

if (failed) {
  process.exit(1);
}
console.log("validate-data: all checks passed");
