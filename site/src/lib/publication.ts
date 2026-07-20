/** Human-facing labels for print & couple UX — hide engineering enums. */

export type ReaderStatus =
  | "已決定"
  | "暫定"
  | "還要一起決定"
  | "出發前重查";

const STATUS_MAP: Record<string, ReaderStatus> = {
  Confirmed: "已決定",
  Provisional: "暫定",
  Assumption: "還要一起決定",
  DecisionRequired: "還要一起決定",
  Stale: "出發前重查",
};

export function readerStatus(raw: string | undefined): ReaderStatus {
  if (!raw) return "暫定";
  return STATUS_MAP[raw] ?? "暫定";
}

export function walkingLabel(level: string | undefined): string {
  switch (level) {
    case "low":
      return "輕";
    case "medium":
      return "中";
    case "high":
      return "高";
    default:
      return level ?? "—";
  }
}

export function energyLabel(level: string | undefined): string {
  switch (level) {
    case "low":
      return "低";
    case "medium":
      return "中";
    case "high":
      return "高";
    default:
      return level ?? "—";
  }
}

export function cityLabel(city: string): string {
  if (city === "Seoul") return "首爾";
  if (city === "Busan") return "釜山";
  if (city === "Transit") return "移動日";
  return city;
}

export function mapButtonLabel(): string {
  return "Naver 地圖";
}

export function tocEntries(): { label: string; target: string }[] {
  return [
    { label: "Overview", target: "overview" },
    { label: "Seoul", target: "seoul" },
    { label: "KTX", target: "ktx" },
    { label: "Busan", target: "busan" },
    { label: "Before You Go", target: "before" },
    { label: "Budget", target: "budget" },
    { label: "Emergency", target: "emergency" },
  ];
}

export function resolvePlace(
  places: Record<string, any>,
  placeId: string | null | undefined
) {
  if (!placeId) return null;
  return places[placeId] ?? null;
}

export function blockDisplayNames(
  block: any,
  places: Record<string, any>,
  restaurants: Record<string, any>
): { zh: string; ko: string | null } {
  const place = block.place_id ? places[block.place_id] : null;
  const rest = block.restaurant_id ? restaurants[block.restaurant_id] : null;
  if (place) return { zh: place.name_zh, ko: place.name_ko };
  if (rest) return { zh: rest.name_zh, ko: rest.name_ko };
  return { zh: block.title, ko: null };
}

/** Short marker for appendix source list — not a URL in body. */
export function sourceMarker(index: number): string {
  return `[${index}]`;
}

export const OVERFLOW_SENTINEL = "PUBLICATION_OVERFLOW_DETECTED";
