import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { STATUSES, loadAllTripData, loadYaml } from "./lib/load-data.ts";
import { dataDir, root } from "./lib/root.ts";

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
  "founder-decisions.yaml": "founder-decisions.json",
  "lodging-area-scores.yaml": "lodging-area-scores.json",
};

function loadSchema(file: string) {
  return JSON.parse(fs.readFileSync(path.join(schemaDir, file), "utf8"));
}

let failed = false;

function fail(msg: string) {
  failed = true;
  console.error(msg);
}

function assertStatus(label: string, status: string) {
  if (!STATUSES.includes(status as (typeof STATUSES)[number])) {
    fail(`${label}: invalid status "${status}"`);
  }
}

for (const [dataFile, schemaFile] of Object.entries(fileSchemaMap)) {
  const data = loadYaml(dataFile);
  const schema = loadSchema(schemaFile);
  const validate = ajv.compile(schema);
  if (!validate(data)) {
    fail(`Schema errors in ${dataFile}:`);
    console.error(validate.errors);
  } else {
    console.log(`OK schema: ${dataFile}`);
  }
}

const data = loadAllTripData();
const sourceIds = new Set(data.sources.sources.map((s: { id: string }) => s.id));
const placeIds = new Set(data.places.places.map((p: { id: string }) => p.id));
const restaurantIds = new Set(data.restaurants.restaurants.map((r: { id: string }) => r.id));

function dupCheck(ids: string[], label: string) {
  const seen = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) fail(`Duplicate ${label} id: ${id}`);
    seen.add(id);
  }
}

dupCheck(data.places.places.map((p: { id: string }) => p.id), "place");
dupCheck(data.restaurants.restaurants.map((r: { id: string }) => r.id), "restaurant");
dupCheck(data.sources.sources.map((s: { id: string }) => s.id), "source");
dupCheck(data.itinerary.days.map((d: { id: string }) => d.id), "itinerary-day");

assertStatus("trip", data.trip.status);
assertStatus("trip.route_status", data.trip.route_status);

// Night math
const expectedNights = data.trip.duration_days - 1;
const nightSum = data.destinations.destinations.reduce(
  (s: number, d: { provisional_nights: number | null }) => s + (d.provisional_nights ?? 0),
  0
);
if (nightSum !== expectedNights) {
  fail(
    `Night math: destinations=${nightSum}N but duration_days=${data.trip.duration_days} implies ${expectedNights}N`
  );
}

if (data.trip.route_option === "seoul-4n-busan-3n") {
  fail('trip.route_option still "seoul-4n-busan-3n" — current 7-day recommendation must be 4n+2n or update duration_days');
}

// Ban 4N+3N as *current* recommendation in trip/destinations
const busanN = data.destinations.destinations.find((d: { id: string }) => d.id === "dest-busan")
  ?.provisional_nights;
const seoulN = data.destinations.destinations.find((d: { id: string }) => d.id === "dest-seoul")
  ?.provisional_nights;
if (seoulN === 4 && busanN === 3 && data.trip.duration_days === 7) {
  fail("Seoul 4N + Busan 3N incompatible with 7-day arrive/depart pattern");
}

for (const p of data.places.places) {
  assertStatus(`place ${p.id}`, p.status);
  if (p.status === "Confirmed" && !p.opening_hours) {
    console.warn(`WARN place ${p.id} Confirmed but opening_hours vague — review`);
  }
  for (const sid of p.source_ids ?? []) {
    if (!sourceIds.has(sid)) fail(`Place ${p.id} unknown source ${sid}`);
  }
  if (!p.source_ids?.length) fail(`Place ${p.id} missing sources`);
  if (!p.checked_at) fail(`Place ${p.id} missing checked_at`);
}

for (const r of data.restaurants.restaurants) {
  assertStatus(`restaurant ${r.id}`, r.status);
  for (const sid of r.source_ids ?? []) {
    if (!sourceIds.has(sid)) fail(`Restaurant ${r.id} unknown source ${sid}`);
  }
}

for (const s of data.sources.sources) {
  assertStatus(`source ${s.id}`, s.status);
  if (!s.url || !s.name || !s.checked_at) {
    fail(`Source ${s.id} missing url/name/checked_at`);
  }
}

for (const day of data.itinerary.days) {
  assertStatus(`day ${day.id}`, day.status);
  for (const b of day.blocks) {
    if (b.place_id && !placeIds.has(b.place_id)) {
      fail(`${day.id} block references missing place ${b.place_id}`);
    }
    if (b.restaurant_id && !restaurantIds.has(b.restaurant_id)) {
      fail(`${day.id} block references missing restaurant ${b.restaurant_id}`);
    }
  }
}

const sliceDays = data.itinerary.days.filter((d: { foundation_slice?: boolean }) => d.foundation_slice);
if (sliceDays.length < 3) {
  fail(`Expected >=3 foundation_slice days, got ${sliceDays.length}`);
}

// Founder decisions
for (const d of data.founderDecisions.decisions) {
  assertStatus(`founder ${d.id}`, d.status);
  if (d.options.length > 3) fail(`${d.id} has >3 options`);
}

if (failed) process.exit(1);
console.log("validate-data: all checks passed");
