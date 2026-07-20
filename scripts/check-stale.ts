import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";

const root = path.resolve(import.meta.dirname, "..");
const today = new Date("2026-07-20T00:00:00Z");

type Sourced = { id: string; checked_at: string; status?: string; freshness_days?: number };

function daysBetween(a: Date, b: Date) {
  return Math.floor((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
}

const sources = (
  yaml.load(fs.readFileSync(path.join(root, "data/sources.yaml"), "utf8")) as {
    sources: Sourced[];
  }
).sources;

const places = (
  yaml.load(fs.readFileSync(path.join(root, "data/places.yaml"), "utf8")) as {
    places: Sourced[];
  }
).places;

const restaurants = (
  yaml.load(fs.readFileSync(path.join(root, "data/restaurants.yaml"), "utf8")) as {
    restaurants: Sourced[];
  }
).restaurants;

let warnings = 0;

function check(items: Sourced[], defaultFreshness: number, label: string) {
  for (const item of items) {
    const freshness = item.freshness_days ?? defaultFreshness;
    const checked = new Date(`${item.checked_at}T00:00:00Z`);
    const age = daysBetween(today, checked);
    if (age > freshness || item.status === "Stale") {
      warnings += 1;
      console.warn(`STALE warning: ${label} ${item.id} age=${age}d threshold=${freshness}d status=${item.status}`);
    }
  }
}

check(sources, 90, "source");
check(places, 60, "place");
check(restaurants, 60, "restaurant");

if (warnings > 0) {
  console.warn(`check-stale: ${warnings} warning(s) (non-fatal for now)`);
} else {
  console.log("check-stale: OK (no stale items)");
}

// Write machine-readable report for Dashboard
fs.mkdirSync(path.join(root, "dist"), { recursive: true });
fs.writeFileSync(
  path.join(root, "dist/stale-report.json"),
  JSON.stringify({ checked_on: "2026-07-20", warnings }, null, 2)
);
