/** Day ↔ Guide contextual navigation for Jerry & Nikita textbook IA. */

export type GuideLink = { href: string; label: string };

const baseGuides: Record<string, GuideLink> = {
  transport: { href: "transport/", label: "交通教學" },
  food: { href: "food/", label: "食物教學" },
  before: { href: "before/", label: "出發前準備" },
  packing: { href: "packing/", label: "行李清單" },
  shopping: { href: "shopping/", label: "購物與退稅" },
  phrases: { href: "phrases/", label: "實用韓文" },
  emergency: { href: "emergency/", label: "緊急離線" },
  hanbok: { href: "days/day-2/", label: "韓服與宮殿" },
  photo: { href: "photo/", label: "拍照與回憶" },
  day1: { href: "days/day-1/", label: "Day 1 抵達" },
  day2: { href: "days/day-2/", label: "Day 2 韓服" },
  day3: { href: "days/day-3/", label: "Day 3 明洞" },
  day4: { href: "days/day-4/", label: "Day 4 江南" },
  day5: { href: "days/day-5/", label: "Day 5 KTX" },
  day6: { href: "days/day-6/", label: "Day 6 海岸" },
  day7: { href: "days/day-7/", label: "Day 7 離境" },
  guides: { href: "guides/", label: "全部教材" },
};

/** Primary related guides for each journey day (reader-facing labels only). */
export function relatedGuidesForDay(dayIndex: number): GuideLink[] {
  switch (dayIndex) {
    case 1:
      return [baseGuides.transport, baseGuides.before];
    case 2:
      return [baseGuides.photo, baseGuides.phrases];
    case 3:
      return [baseGuides.shopping, baseGuides.photo];
    case 4:
      return [baseGuides.shopping, baseGuides.food];
    case 5:
      return [baseGuides.transport, baseGuides.food];
    case 6:
      return [baseGuides.photo, baseGuides.food];
    case 7:
      return [baseGuides.transport, baseGuides.emergency];
    default:
      return [baseGuides.guides];
  }
}

/** Related days for each guide surface. */
export function relatedDaysForGuide(
  guide:
    | "transport"
    | "food"
    | "before"
    | "packing"
    | "shopping"
    | "phrases"
    | "emergency"
    | "hanbok"
    | "photo"
): GuideLink[] {
  switch (guide) {
    case "transport":
      return [baseGuides.day1, baseGuides.day5, baseGuides.day7];
    case "food":
      return [baseGuides.day5, baseGuides.day6];
    case "before":
    case "packing":
      return [baseGuides.day1];
    case "shopping":
      return [baseGuides.day3, baseGuides.day4];
    case "phrases":
      return [baseGuides.day2, baseGuides.day3];
    case "emergency":
      return [baseGuides.day7, baseGuides.day1];
    case "hanbok":
      return [baseGuides.day2];
    case "photo":
      return [baseGuides.day2, baseGuides.day6];
    default:
      return [];
  }
}

/** Guides hub entries — high-value completed teaching, no blank hubs. */
export const GUIDES_HUB: { href: string; label: string; blurb: string }[] = [
  { href: "transport/", label: "交通", blurb: "仁川抵達、市區、KTX、錯過車次怎麼辦" },
  { href: "food/", label: "食物", blurb: "辨識、點餐、甲殼類／蝦醬避雷" },
  { href: "before/", label: "出發前", blurb: "時程、SIM、文件、離線準備" },
  { href: "shopping/", label: "購物與退稅", blurb: "明洞路徑、退稅怎麼做" },
  { href: "photo/", label: "拍照與回憶", blurb: "合照構圖、拍立得、每日回憶提示" },
  { href: "days/day-2/", label: "韓服與宮殿", blurb: "Day 2 合照與宮殿節奏" },
  { href: "emergency/", label: "緊急", blurb: "離線救援與回住宿" },
  { href: "phrases/", label: "實用韓文", blurb: "點餐、問路、拍照請路人" },
];
