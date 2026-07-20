import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";

const root = path.resolve(import.meta.dirname, "..");

type Block = {
  start: string;
  end: string;
  title: string;
  kind: string;
  transit_minutes?: number | null;
  dwell_minutes?: number | null;
  droppable?: boolean;
};

type Day = {
  id: string;
  day_index: number;
  buffer_percent?: number;
  primary_areas: string[];
  blocks: Block[];
};

const itinerary = yaml.load(
  fs.readFileSync(path.join(root, "data/itinerary.yaml"), "utf8")
) as { days: Day[] };

let failed = false;

function parseHm(value: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(value);
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}

for (const day of itinerary.days) {
  if (day.primary_areas.length > 2) {
    failed = true;
    console.error(`${day.id}: more than 2 primary areas`);
  }
  if (day.buffer_percent != null && (day.buffer_percent < 15 || day.buffer_percent > 25)) {
    console.warn(`${day.id}: buffer_percent ${day.buffer_percent} outside 15–25 guidance`);
  }

  const timed = day.blocks
    .map((b) => ({ b, s: parseHm(b.start), e: parseHm(b.end) }))
    .filter((x) => x.s != null && x.e != null) as {
    b: Block;
    s: number;
    e: number;
  }[];

  timed.sort((a, c) => a.s - c.s);
  for (let i = 1; i < timed.length; i++) {
    if (timed[i].s < timed[i - 1].e) {
      failed = true;
      console.error(
        `${day.id}: overlap ${timed[i - 1].b.title} vs ${timed[i].b.title}`
      );
    }
  }

  // Transportation buffer heuristic: after a transit block, next block should not start instantly without note
  for (let i = 0; i < timed.length - 1; i++) {
    const cur = timed[i];
    const next = timed[i + 1];
    if (cur.b.kind === "transit" && next.s < cur.e) {
      failed = true;
      console.error(`${day.id}: transit buffer conflict around ${cur.b.title}`);
    }
  }
}

if (failed) {
  process.exit(1);
}
console.log("check-itinerary: OK");
