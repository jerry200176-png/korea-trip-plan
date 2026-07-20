import { loadYaml } from "./lib/load-data.ts";
import { loadAllTripData } from "./lib/load-data.ts";

const DIM_IDS = [
  "icn_arrival",
  "seoul_days1_4_transit",
  "ktx_seoul_station",
  "pus_departure",
  "pork_soup_food",
  "beach_scenery",
  "shopping",
  "evening_safety",
  "walking_elevator",
  "room_couple_supply",
  "noise",
  "convenience_breakfast",
  "luggage_movement",
  "schedule_0900_2100",
] as const;

type ScoresDoc = {
  dimensions: { id: string }[];
  seoul: { recommendation: { primary: string; backup: string }; areas: { id: string; scores: Record<string, unknown> }[] };
  busan: { recommendation: { primary: string; backup: string }; areas: { id: string; scores: Record<string, unknown> }[] };
};

function checkCity(name: string, block: ScoresDoc["seoul"], sourceIds: Set<string>) {
  const areaIds = new Set(block.areas.map((a) => a.id));
  for (const id of [block.recommendation.primary, block.recommendation.backup]) {
    if (!areaIds.has(id)) throw new Error(`${name} recommendation references missing area ${id}`);
  }
  for (const area of block.areas) {
    for (const dim of DIM_IDS) {
      const cell = area.scores[dim] as { score: number | null; epistemic: string; source_ids: string[] } | undefined;
      if (!cell) throw new Error(`${name}/${area.id} missing dimension ${dim}`);
      if (cell.score !== null && (cell.score < 1 || cell.score > 5)) {
        throw new Error(`${name}/${area.id}/${dim} score out of range`);
      }
      if (!["Fact", "Inference", "Assumption"].includes(cell.epistemic)) {
        throw new Error(`${name}/${area.id}/${dim} bad epistemic`);
      }
      for (const sid of cell.source_ids) {
        if (!sourceIds.has(sid)) throw new Error(`${name}/${area.id}/${dim} unknown source ${sid}`);
      }
    }
  }
}

const data = loadAllTripData();
const doc = loadYaml<ScoresDoc>("lodging-area-scores.yaml");
const sourceIds = new Set(data.sources.sources.map((s: { id: string }) => s.id));

if (doc.dimensions.length !== DIM_IDS.length) {
  throw new Error("dimension count mismatch");
}

checkCity("seoul", doc.seoul, sourceIds);
checkCity("busan", doc.busan, sourceIds);

console.log("check-lodging-scores: OK");
