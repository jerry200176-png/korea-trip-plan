/**
 * One-off generator for data/lodging-area-scores.yaml (deterministic scores).
 * Run: npx tsx scripts/generate-lodging-area-scores.ts
 */
import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { dataDir } from "./lib/root.ts";

type Ep = "Fact" | "Inference" | "Assumption";
type Cell = { score: number | null; epistemic: Ep; rationale: string; source_ids: string[] };

const DIMS: { id: string; label_zh: string }[] = [
  { id: "icn_arrival", label_zh: "ICN 抵達後進城便利性" },
  { id: "seoul_days1_4_transit", label_zh: "前四晚首爾行程平均交通成本" },
  { id: "ktx_seoul_station", label_zh: "前往 Seoul Station 搭 KTX 便利性" },
  { id: "pus_departure", label_zh: "PUS 離境便利性" },
  { id: "pork_soup_food", label_zh: "豬肉湯飯與日常餐飲密度" },
  { id: "beach_scenery", label_zh: "海灘／海景可達性" },
  { id: "shopping", label_zh: "購物、化妝品、服飾便利性" },
  { id: "evening_safety", label_zh: "晚間安全與回住宿便利性" },
  { id: "walking_elevator", label_zh: "步行量、坡度、轉乘與電梯風險" },
  { id: "room_couple_supply", label_zh: "房間大小與雙人住宿供給" },
  { id: "noise", label_zh: "噪音風險" },
  { id: "convenience_breakfast", label_zh: "便利商店與早餐取得" },
  { id: "luggage_movement", label_zh: "行李移動成本" },
  { id: "schedule_0900_2100", label_zh: "對 09:00–21:00 作息適配" },
];

function c(
  score: number | null,
  epistemic: Ep,
  rationale: string,
  source_ids: string[]
): Cell {
  return { score, epistemic, rationale, source_ids };
}

const MAP = "src-naver-map";
const INC = "src-incheon";
const KORAIL = "src-korail";
const PUS = "src-pusan-air";
const BUSAN = "src-busan-city";
const PALACE = "src-royal-palaces";
const HANOK = "src-seoul-hanok";
const TMONEY = "src-tmoney";

type Row = Record<string, Cell>;

const seoulAreas: { id: string; label: string; included_reason?: string; scores: Row }[] = [
  {
    id: "jongno_insadong",
    label: "Jongno / Insadong",
    included_reason: "Itinerary Day 2 Jongno；景福宮／北村／韓服動線",
    scores: {
      icn_arrival: c(4, "Inference", "ICN→AREX/機場鐵路→首爾站或直達線再轉 1/3/5 號線；時間依航班時段", [INC, MAP, TMONEY]),
      seoul_days1_4_transit: c(5, "Inference", "Day2 同區；Day3 至明洞約 15–25 分地鐵；Day4 至江南需 25–40 分", [MAP, PALACE]),
      ktx_seoul_station: c(4, "Inference", "地鐵至 Seoul Station 約 10–20 分；KTX 日可預留計程車", [KORAIL, MAP]),
      pus_departure: c(2, "Assumption", "首爾住宿離 PUS 遠；離境日應已在釜山（不以此區評 PUS）", [PUS]),
      pork_soup_food: c(4, "Inference", "老城區食堂多；豬肉湯飯選擇需逐店確認無甲殼類", [MAP]),
      beach_scenery: c(1, "Fact", "非海濱區", [BUSAN]),
      shopping: c(3, "Inference", "傳統伴手禮強；明洞級美妝需一次地鐵", [MAP]),
      evening_safety: c(4, "Inference", "觀光警政多；22:00 前回宿與偏好一致", [MAP]),
      walking_elevator: c(3, "Inference", "北村坡度與階梯多；Day2 步行量高", [HANOK, MAP]),
      room_couple_supply: c(3, "Assumption", "雙人房供給中等；需篩選床型與面積", [MAP]),
      noise: c(3, "Assumption", "主幹道旁可能較吵", [MAP]),
      convenience_breakfast: c(4, "Inference", "便利店與小食多", [MAP]),
      luggage_movement: c(3, "Inference", "Day1 ICN 進城與 Day5 帶行李去 KTX 需預留電梯/計程車", [INC, KORAIL]),
      schedule_0900_2100: c(5, "Inference", "09:00 出門至景福宮等近；21:00 前回宿容易", [PALACE]),
    },
  },
  {
    id: "myeongdong_euljiro",
    label: "Myeongdong / Euljiro",
    scores: {
      icn_arrival: c(4, "Inference", "機場鐵路/巴士至市區後轉 2/4 號線；尖峰時段較擠", [INC, MAP]),
      seoul_days1_4_transit: c(4, "Inference", "Day3 購物最佳；Day2 景福宮需跨區；Day4 江南中等", [MAP]),
      ktx_seoul_station: c(5, "Inference", "至 Seoul Station 地鐵短；KTX 日友善", [KORAIL, MAP]),
      pus_departure: c(2, "Assumption", "離 PUS 遠（離境日在釜山）", [PUS]),
      pork_soup_food: c(4, "Inference", "明洞餐飲密度高；需避開海鮮為主的店", [MAP]),
      beach_scenery: c(1, "Fact", "非海濱", [BUSAN]),
      shopping: c(5, "Inference", "美妝服飾與外國人服務成熟", [MAP]),
      evening_safety: c(4, "Inference", "觀光區夜間人流大", [MAP]),
      walking_elevator: c(4, "Inference", "相對平坦；明洞坡道仍多", [MAP]),
      room_couple_supply: c(4, "Assumption", "觀光飯店/商務旅館多", [MAP]),
      noise: c(2, "Assumption", "鬧區噪音風險較高", [MAP]),
      convenience_breakfast: c(5, "Inference", "便利店極多", [MAP]),
      luggage_movement: c(4, "Inference", "交通樞紐多；Day1 進城路線選擇多", [INC, MAP]),
      schedule_0900_2100: c(4, "Inference", "09:00 出發 OK；21:00 回宿 OK 但人潮", [MAP]),
    },
  },
  {
    id: "hongdae",
    label: "Hongdae",
    scores: {
      icn_arrival: c(4, "Inference", "機場鐵路→首爾站/弘大線轉乘；行李尖峰較累", [INC, MAP]),
      seoul_days1_4_transit: c(3, "Inference", "至 Jongno/明洞/江南皆需 25–40+ 分", [MAP]),
      ktx_seoul_station: c(4, "Inference", "至 Seoul Station 約 15–25 分", [KORAIL, MAP]),
      pus_departure: c(2, "Assumption", "離 PUS 遠", [PUS]),
      pork_soup_food: c(4, "Inference", "青年街餐飲多；服飾與小吃為主", [MAP]),
      beach_scenery: c(1, "Fact", "非海濱", [BUSAN]),
      shopping: c(4, "Inference", "服飾與年輕品牌強", [MAP]),
      evening_safety: c(3, "Assumption", "夜生活多；需選安靜街區", [MAP]),
      walking_elevator: c(4, "Inference", "站周邊相對平；轉乘次數可能多", [MAP]),
      room_couple_supply: c(4, "Assumption", "青年/設計旅店多", [MAP]),
      noise: c(2, "Assumption", "夜間噪音風險高", [MAP]),
      convenience_breakfast: c(5, "Inference", "便利店密集", [MAP]),
      luggage_movement: c(3, "Inference", "轉乘較多", [MAP]),
      schedule_0900_2100: c(3, "Inference", "遠距離日（Day2/4）早出門壓力", [MAP]),
    },
  },
  {
    id: "gangnam",
    label: "Gangnam",
    included_reason: "Itinerary Day 4 Gangnam（JYP／算命候選）— 證據支持納入比較",
    scores: {
      icn_arrival: c(4, "Inference", "機場巴士/地鐵 2/9 號線進江南；尖峰時間長", [INC, MAP]),
      seoul_days1_4_transit: c(3, "Inference", "Day4 最佳；Day2/3 跨城長", [MAP, "src-jyp"]),
      ktx_seoul_station: c(3, "Inference", "至 Seoul Station 較遠；KTX 日宜計程車", [KORAIL, MAP]),
      pus_departure: c(2, "Assumption", "離 PUS 遠", [PUS]),
      pork_soup_food: c(4, "Inference", "餐廳多；豬湯需挑店", [MAP]),
      beach_scenery: c(1, "Fact", "非海濱", [BUSAN]),
      shopping: c(4, "Inference", "百貨與服飾強", [MAP]),
      evening_safety: c(4, "Inference", "商業區夜間仍有人流", [MAP]),
      walking_elevator: c(4, "Inference", "站區相對平；站內轉乘長", [MAP]),
      room_couple_supply: c(4, "Assumption", "商務/連鎖多", [MAP]),
      noise: c(3, "Assumption", "幹道旁可能吵", [MAP]),
      convenience_breakfast: c(4, "Inference", "便利店充足", [MAP]),
      luggage_movement: c(3, "Inference", "KTX 日行李跨城較麻煩", [KORAIL]),
      schedule_0900_2100: c(3, "Inference", "Day2 早出門至 Jongno 負擔大", [MAP]),
    },
  },
];

const busanAreas: { id: string; label: string; included_reason?: string; scores: Row }[] = [
  {
    id: "haeundae",
    label: "Haeundae",
    scores: {
      icn_arrival: c(1, "Fact", "釜山區域；不適用 ICN 進城", [INC]),
      seoul_days1_4_transit: c(null, "Fact", "N/A — 首爾 4 晚不在釜山", []),
      ktx_seoul_station: c(null, "Fact", "N/A", []),
      pus_departure: c(4, "Inference", "PUS 距海雲台約 30–50 分（路況/大眾運輸）；離境日宜預留緩衝", [PUS, MAP, BUSAN]),
      pork_soup_food: c(4, "Inference", "豬湯名店多；海鮮街需避甲殼類", [MAP, BUSAN]),
      beach_scenery: c(5, "Inference", "Day6 海灘主題最佳", [BUSAN]),
      shopping: c(3, "Inference", "海雲台商圈；非首爾級美妝", [MAP]),
      evening_safety: c(4, "Inference", "觀光海灘區警政與照明", [BUSAN]),
      walking_elevator: c(3, "Inference", "海灘步行多；部分坡道", [BUSAN]),
      room_couple_supply: c(4, "Assumption", "度假村/飯店多", [MAP]),
      noise: c(3, "Assumption", "海邊娛樂區夏夜較吵；3 月相對好", [BUSAN]),
      convenience_breakfast: c(4, "Inference", "便利店多", [MAP]),
      luggage_movement: c(3, "Inference", "Day5 抵釜山帶行李；Day7 去 PUS", [KORAIL, PUS]),
      schedule_0900_2100: c(5, "Inference", "Day6 海灘日減少通勤", [BUSAN]),
    },
  },
  {
    id: "seomyeon",
    label: "Seomyeon",
    scores: {
      icn_arrival: c(1, "Fact", "N/A ICN", [INC]),
      seoul_days1_4_transit: c(null, "Fact", "N/A", []),
      ktx_seoul_station: c(null, "Fact", "N/A", []),
      pus_departure: c(4, "Inference", "地鐵 2 號線至 PUS 約 40+ 分；計程車較穩", [PUS, MAP]),
      pork_soup_food: c(5, "Inference", "豬湯飯與本地食堂密度高", [MAP, BUSAN]),
      beach_scenery: c(2, "Inference", "至海雲台需 20–30 分地鐵", [MAP, BUSAN]),
      shopping: c(4, "Inference", "地下街與百貨", [MAP]),
      evening_safety: c(4, "Inference", "核心商業區", [BUSAN]),
      walking_elevator: c(4, "Inference", "轉乘樞紐；站內步行長", [MAP]),
      room_couple_supply: c(4, "Assumption", "商務旅館多", [MAP]),
      noise: c(3, "Assumption", "鬧區中等噪音", [MAP]),
      convenience_breakfast: c(5, "Inference", "便利店極多", [MAP]),
      luggage_movement: c(4, "Inference", "KTX 釜山站/西面轉乘成熟", [KORAIL, MAP]),
      schedule_0900_2100: c(4, "Inference", "Day6 海灘需額外交通", [MAP]),
    },
  },
  {
    id: "gwangalli",
    label: "Gwangalli",
    scores: {
      icn_arrival: c(1, "Fact", "N/A", [INC]),
      seoul_days1_4_transit: c(null, "Fact", "N/A", []),
      ktx_seoul_station: c(null, "Fact", "N/A", []),
      pus_departure: c(3, "Inference", "PUS 距離與海雲台類似或略遠；需查即時路線", [PUS, MAP]),
      pork_soup_food: c(3, "Inference", "海邊餐飲偏海鮮；豬湯選擇較少", [MAP]),
      beach_scenery: c(4, "Inference", "广安里沙滩；橋景佳", [BUSAN]),
      shopping: c(2, "Inference", "非主要購物區", [MAP]),
      evening_safety: c(4, "Inference", "海邊步道照明", [BUSAN]),
      walking_elevator: c(3, "Inference", "海堤步行", [BUSAN]),
      room_couple_supply: c(3, "Assumption", "中小型 lodging", [MAP]),
      noise: c(3, "Assumption", "酒吧街可能吵", [MAP]),
      convenience_breakfast: c(3, "Inference", "便利店較海雲台少", [MAP]),
      luggage_movement: c(3, "Inference", "轉乘次數可能多於海雲台", [MAP]),
      schedule_0900_2100: c(4, "Inference", "海灘近但 Day7 去 PUS 需規劃", [PUS]),
    },
  },
  {
    id: "busan_station_nampo",
    label: "Busan Station / Nampo",
    included_reason: "KTX 抵釜山與機場巴士動線；僅在交通證據支持時納入",
    scores: {
      icn_arrival: c(1, "Fact", "N/A", [INC]),
      seoul_days1_4_transit: c(null, "Fact", "N/A", []),
      ktx_seoul_station: c(null, "Fact", "N/A", []),
      pus_departure: c(4, "Inference", "釜山站一帶至 PUS 有巴士/地鐵；南浦較遠", [PUS, KORAIL, MAP]),
      pork_soup_food: c(5, "Inference", "南浦/札嘎其周邊豬湯文化", [MAP, BUSAN]),
      beach_scenery: c(2, "Inference", "至海雲台 30+ 分", [MAP]),
      shopping: c(3, "Inference", "南浦傳統市場", [MAP]),
      evening_safety: c(3, "Inference", "車站/市場混合區需選街", [BUSAN]),
      walking_elevator: c(3, "Inference", "階梯與市場坡道", [MAP]),
      room_couple_supply: c(3, "Assumption", "老舊/小型旅館比例高", [MAP]),
      noise: c(3, "Assumption", "車站周邊", [MAP]),
      convenience_breakfast: c(4, "Inference", "便利店 OK", [MAP]),
      luggage_movement: c(5, "Inference", "Day5 KTX 抵達最省搬運", [KORAIL]),
      schedule_0900_2100: c(3, "Inference", "Day6 海灘日通勤長", [MAP]),
    },
  },
];

const doc = {
  id: "lodging-area-scores-v1",
  status: "Provisional",
  updated: "2026-07-20",
  depends_on: { route: "seoul-4n-busan-2n", flight_plan: "D3-B" },
  dimensions: DIMS,
  seoul: {
    recommendation: {
      primary: "jongno_insadong",
      backup: "myeongdong_euljiro",
      status: "Provisional",
      summary_zh:
        "4 晚首爾以 Jongno/Insadong 平衡 Day2 景點與 KTX；明洞為購物備選（Day3 一次地鐵）。",
    },
    areas: seoulAreas.map(({ id, label, included_reason, scores }) => ({
      id,
      label,
      ...(included_reason ? { included_reason } : {}),
      scores,
    })),
  },
  busan: {
    recommendation: {
      primary: "haeundae",
      backup: "seomyeon",
      status: "Provisional",
      summary_zh: "2 晚釜山優先海雲台（Day6 海灘）；西面為豬湯/轉運備選。",
    },
    areas: busanAreas.map(({ id, label, included_reason, scores }) => ({
      id,
      label,
      ...(included_reason ? { included_reason } : {}),
      scores,
    })),
  },
};

const out = path.join(dataDir, "lodging-area-scores.yaml");
fs.writeFileSync(out, yaml.dump(doc, { lineWidth: 120, noRefs: true }), "utf8");
console.log("Wrote", out);
