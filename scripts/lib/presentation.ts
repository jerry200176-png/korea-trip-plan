/** Reader-facing presentation helpers (PDF + shared wording). */

export function statusZh(status: string): string {
  const map: Record<string, string> = {
    Confirmed: "已決定",
    Provisional: "目前暫定",
    Assumption: "規劃基準",
    DecisionRequired: "還要一起決定",
    Stale: "出發前需重查",
  };
  return map[status] ?? status;
}

export function statusClass(status: string): string {
  if (status === "Confirmed") return "status-confirmed";
  if (status === "DecisionRequired") return "status-decision";
  if (status === "Assumption") return "status-assumption";
  if (status === "Stale") return "status-decision";
  return "status-provisional";
}

export function kindZh(kind: string): string {
  const map: Record<string, string> = {
    transit: "移動",
    experience: "體驗",
    meal: "用餐",
    free: "自由",
    photo: "拍照",
    shopping: "購物",
    rest: "休息",
    buffer: "緩衝",
    place: "景點",
  };
  return map[kind] ?? "行程";
}

export function placeTypeZh(type: string | null | undefined): string | null {
  if (!type) return null;
  const map: Record<string, string> = {
    palace: "宮殿",
    market: "市場",
    beach: "海灘",
    shopping_district: "購物",
    neighborhood: "街區",
    restaurant: "用餐",
    entertainment_interest: "打卡",
    transit_hub: "移動",
  };
  return map[type] ?? null;
}

export function cityZh(city: string | null | undefined): string {
  const map: Record<string, string> = {
    Seoul: "首爾",
    Busan: "釜山",
    Transit: "移動中",
  };
  return (city && map[city]) || city || "行程";
}

export function areaZh(area: string): string {
  const map: Record<string, string> = {
    lodging_area: "住宿附近",
    Jongno: "鍾路",
    Myeongdong: "明洞",
    Gangnam: "江南",
    "Seoul-station": "首爾站周邊",
    "Busan-lodging": "釜山住宿附近",
    Haeundae: "海雲台",
    Mapo: "麻浦",
    Jung: "中區",
    Suyeong: "水營",
    TBD: "區域確認後補上",
  };
  return map[area] ?? sanitizeReaderText(area);
}

export function transitModeZh(mode: string | null | undefined): string | null {
  if (!mode) return null;
  const map: Record<string, string> = {
    airport: "機場動線",
    subway: "地鐵",
    AREX_or_bus_TBD: "機場鐵路或巴士（出發前確認）",
    subway_taxi: "地鐵或計程車",
    KTX: "KTX",
    taxi: "計程車",
    walk: "步行",
  };
  return map[mode] ?? mode.replace(/_/g, " ");
}

export function walkingZh(level: string | null | undefined): string {
  const map: Record<string, string> = {
    low: "低",
    medium: "中",
    high: "高",
  };
  return (level && map[level]) || "出發前再確認";
}

export function formatTargetMonth(month: string | null | undefined): string {
  if (!month) return "日期待決定";
  const m = /^(\d{4})-(\d{2})$/.exec(month);
  if (!m) return month;
  return `${m[1]} 年 ${Number(m[2])} 月，日期待決定`;
}

const READER_PLACE_LABELS: Record<string, string> = {
  "plc-jyp-tower": "JYP 周邊打卡",
  "plc-gyeongbokgung": "景福宮",
  "plc-bukchon": "北村韓屋村",
  "plc-myeongdong": "明洞",
  "plc-hongdae": "弘大",
  "plc-haeundae": "海雲台海水浴場",
  "plc-gwangalli": "廣安里海水浴場",
};

/** Resolve internal refs (plc-*, etc.) to reader-facing labels. Never emit raw IDs. */
export function readerRefLabel(
  ref: string,
  places?: Record<string, { name_zh?: string } | undefined>
): string {
  const raw = String(ref || "").trim();
  if (!raw) return "";
  if (READER_PLACE_LABELS[raw]) return READER_PLACE_LABELS[raw];
  if (places?.[raw]?.name_zh) return places[raw]!.name_zh!;
  if (/^(plc|src|med|rst|trv|dest|t\d)-/i.test(raw) || /^(place_id|foundation_slice|route_option)$/i.test(raw)) {
    return "待確認項目";
  }
  return sanitizeReaderText(raw);
}

export function sanitizeReaderText(text: string | null | undefined): string {
  if (!text) return "";
  return text
    .replace(/Jerry\s*與女友/g, "Jerry 與 Nikita")
    .replace(/Jerry\s*&\s*女友/g, "Jerry & Nikita")
    .replace(/\bREPLACE_ME\b/g, "確認後補上")
    .replace(/\bDecision Required\b/gi, "還要一起決定")
    .replace(/\bDecisionRequired\b/g, "還要一起決定")
    .replace(/\bOpen Decision\b/gi, "還要一起決定")
    .replace(/\bConfirmed\b/g, "已決定")
    .replace(/\bProvisional\b/g, "目前暫定")
    .replace(/\bAssumption\b/g, "規劃基準")
    .replace(/\bStale\b/g, "出發前需重查")
    .replace(/\bTBD\b/g, "尚未決定")
    .replace(/\bFounder\b/g, "我們")
    .replace(/\bplace_id\b/g, "地點")
    .replace(/\bfoundation_slice\b/g, "")
    .replace(/\broute_option\b/g, "路線")
    .replace(/\bstart_date\b/g, "出發日")
    .replace(/\bend_date\b/g, "回程日")
    .replace(/\bBooking Ready\b/gi, "可預訂狀態")
    .replace(/\bTrip Ready\b/gi, "行程就緒")
    .replace(/\bDashboard\b/g, "首頁")
    .replace(/\btrip\.yaml\b/g, "旅程資料")
    .replace(/\bdata\/[a-z0-9_.-]+\.yaml\b/gi, "旅程資料")
    .replace(/\bchecklists\/[a-z0-9_.-]*/gi, "出發前清單")
    .replace(/\bhandbook\/[a-z0-9_.-]*/gi, "旅行筆記")
    .replace(/\bupdate YAML\b/gi, "回填實際心得")
    .replace(/\bYAML\b/g, "資料")
    .replace(/\bduration_days\b/g, "行程天數")
    .replace(/\bcalendar days\b/gi, "個日曆日")
    .replace(/\bhotel nights\b/gi, "晚住宿")
    .replace(/\bSeoul 4N \+ Busan 2N\b/g, "首爾四晚 + 釜山兩晚")
    .replace(/\b4N\+3N\b/g, "四晚+三晚")
    .replace(/\b4N\b/g, "四晚")
    .replace(/\b2N\b/g, "兩晚")
    .replace(/\b3N\b/g, "三晚")
    .replace(/\b6N\b/g, "六晚")
    .replace(/\b7N\b/g, "七晚")
    .replace(/\bSeoul\b/g, "首爾")
    .replace(/\bBusan\b/g, "釜山")
    .replace(/\bplc-[a-z0-9-]+/gi, (id) => READER_PLACE_LABELS[id] || "待確認地點")
    .replace(/\bsrc-[a-z0-9-]+/gi, "來源")
    .replace(/\bmed-[a-z0-9-]+/gi, "圖片")
    .replace(/\brst-[a-z0-9-]+/gi, "餐廳候選")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function formatClock(value: string): string {
  const map: Record<string, string> = {
    ARR: "抵達後",
    ARR_AIRPORT: "依航班抵達機場前",
  };
  if (map[value]) return map[value];
  if (value.startsWith("+")) return `抵達後 ${value.slice(1)}`;
  return value;
}
