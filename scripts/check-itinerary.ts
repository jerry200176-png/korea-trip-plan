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
  city?: string;
  buffer_percent?: number;
  primary_areas: string[];
  blocks: Block[];
};

/** Areas that must not be paired on the same non-transit day (cross-town / non-adjacent). */
const FORBIDDEN_PAIRS: [string, string][] = [
  ["Gangnam", "Jongno"],
  ["Gangnam", "Myeongdong"],
  ["Gangnam", "Bukchon"],
  ["Hongdae", "Jongno"],
  ["Haeundae", "Seoul"],
];

const itinerary = yaml.load(
  fs.readFileSync(path.join(root, "data/itinerary.yaml"), "utf8")
) as { days: Day[] };

const trip = yaml.load(fs.readFileSync(path.join(root, "data/trip.yaml"), "utf8")) as {
  duration_days: number;
  route_option?: string;
};

const destinations = yaml.load(
  fs.readFileSync(path.join(root, "data/destinations.yaml"), "utf8")
) as { destinations: { id: string; provisional_nights: number | null }[] };

let failed = false;

function parseHm(value: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(value);
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}

// Night math: Day1 arrive / DayN depart ⇒ nights = duration_days - 1
const expectedNights = trip.duration_days - 1;
const nightSum = destinations.destinations.reduce(
  (s, d) => s + (d.provisional_nights ?? 0),
  0
);
if (nightSum !== expectedNights) {
  failed = true;
  console.error(
    `Night conflict: destinations sum to ${nightSum}N but duration_days=${trip.duration_days} implies ${expectedNights}N (arrive D1 / depart D${trip.duration_days})`
  );
}

for (const day of itinerary.days) {
  if (day.primary_areas.length > 2) {
    failed = true;
    console.error(`${day.id}: more than 2 primary areas`);
  }
  if (day.buffer_percent != null && (day.buffer_percent < 15 || day.buffer_percent > 25)) {
    console.warn(`${day.id}: buffer_percent ${day.buffer_percent} outside 15–25 guidance`);
  }

  if (day.city !== "Transit") {
    const areas = day.primary_areas.map((a) => a.toLowerCase());
    for (const [a, b] of FORBIDDEN_PAIRS) {
      const hitA = areas.some((x) => x.includes(a.toLowerCase()));
      const hitB = areas.some((x) => x.includes(b.toLowerCase()));
      if (hitA && hitB) {
        failed = true;
        console.error(`${day.id}: non-adjacent area pair ${a}+${b}`);
      }
    }
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
console.log(
  `check-itinerary: OK (nights ${nightSum}=${expectedNights}; route ${trip.route_option ?? "?"})`
);
