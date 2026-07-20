import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";

const dataDir = path.resolve(process.cwd(), "../data");

export function loadData<T>(file: string): T {
  return yaml.load(fs.readFileSync(path.join(dataDir, file), "utf8")) as T;
}

export type Status =
  | "Confirmed"
  | "Provisional"
  | "Assumption"
  | "DecisionRequired"
  | "Stale";

export function loadTrip() {
  return loadData<any>("trip.yaml");
}

export function loadItinerary() {
  return loadData<{ days: any[] }>("itinerary.yaml");
}

export function loadPlaces() {
  return loadData<{ places: any[] }>("places.yaml").places;
}

export function loadRestaurants() {
  return loadData<{ restaurants: any[] }>("restaurants.yaml").restaurants;
}

export function loadBudget() {
  return loadData<any>("budget.yaml");
}

export function loadSources() {
  return loadData<{ sources: any[] }>("sources.yaml").sources;
}

export function loadTimeline() {
  return loadData<{ milestones: any[] }>("timeline.yaml");
}

export function loadDestinations() {
  return loadData<{ destinations: any[] }>("destinations.yaml").destinations;
}

export function loadTravelers() {
  return loadData<{ travelers: any[] }>("travelers.yaml").travelers;
}

export function loadFounderDecisions() {
  return loadData<{ decisions: any[] }>("founder-decisions.yaml").decisions;
}

export function loadEmergencyPublic() {
  return loadData<any>("emergency-public.yaml");
}

export function loadMedia() {
  return loadData<{ media: any[]; kto_candidates: any[] }>("media.yaml");
}

export function mediaById(id: string) {
  return loadMedia().media.find((m) => m.id === id);
}

export function mediaPublicUrl(base: string, item: { web_path?: string | null; local_path: string }) {
  const rel = (item.web_path ?? item.local_path).replace(/^site\/public\//, "");
  return `${base}${rel}`;
}

export function loadReadinessReport() {
  const p = path.resolve(process.cwd(), "../dist/readiness-report.json");
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

export function nextOpenTask(timeline: { milestones: any[] }) {
  for (const m of timeline.milestones) {
    for (const t of m.tasks) {
      if (!t.done) return { milestone: m.label, task: t };
    }
  }
  return null;
}

export function budgetProgress(budget: any) {
  const planned = budget.categories.reduce((s: number, c: any) => s + c.planned_twd, 0);
  const spent = budget.categories.reduce((s: number, c: any) => s + c.spent_twd, 0);
  return { planned, spent, pct: planned ? Math.round((spent / planned) * 100) : 0 };
}

export function bookingProgress() {
  // No real bookings in repo — all placeholders
  return { total: 6, done: 0, label: "0/6（僅 example 占位，未預訂）" };
}

export function staleSources(sources: any[], today = "2026-07-20") {
  const now = new Date(`${today}T00:00:00Z`).getTime();
  return sources.filter((s) => {
    const age =
      (now - new Date(`${s.checked_at}T00:00:00Z`).getTime()) / (1000 * 60 * 60 * 24);
    return age > (s.freshness_days ?? 90) || s.status === "Stale";
  });
}
