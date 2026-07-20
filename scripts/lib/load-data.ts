import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { dataDir } from "./root.ts";

export const STATUSES = [
  "Confirmed",
  "Provisional",
  "Assumption",
  "DecisionRequired",
  "Stale",
] as const;

export type Status = (typeof STATUSES)[number];

export function loadYaml<T>(file: string): T {
  return yaml.load(fs.readFileSync(path.join(dataDir, file), "utf8")) as T;
}

export function loadAllTripData() {
  const trip = loadYaml<any>("trip.yaml");
  const travelers = loadYaml<{ travelers: unknown[] }>("travelers.yaml");
  const destinations = loadYaml<{ destinations: any[] }>("destinations.yaml");
  const places = loadYaml<{ places: any[] }>("places.yaml");
  const restaurants = loadYaml<{ restaurants: any[] }>("restaurants.yaml");
  const itinerary = loadYaml<{ days: any[] }>("itinerary.yaml");
  const sources = loadYaml<{ sources: any[] }>("sources.yaml");
  const budget = loadYaml<any>("budget.yaml");
  const timeline = loadYaml<{ milestones: any[] }>("timeline.yaml");
  const founderDecisions = loadYaml<{ decisions: any[] }>("founder-decisions.yaml");
  const emergency = loadYaml<any>("emergency-public.yaml");
  return {
    trip,
    travelers,
    destinations,
    places,
    restaurants,
    itinerary,
    sources,
    budget,
    timeline,
    founderDecisions,
    emergency,
  };
}
