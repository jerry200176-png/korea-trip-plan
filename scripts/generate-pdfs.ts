import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import yaml from "js-yaml";
import { chromium } from "playwright";
import { distDir, root } from "./lib/root.ts";
import { wrapHtml } from "./lib/pdf-html.ts";
import {
  areaZh,
  cityZh,
  formatClock,
  formatTripWindow,
  kindZh,
  placeTypeZh,
  readerRefLabel,
  sanitizeReaderText,
  statusZh,
  transitModeZh,
  tripDayLabel,
  walkingZh,
} from "./lib/presentation.ts";

fs.mkdirSync(distDir, { recursive: true });

function load<T>(file: string): T {
  return yaml.load(fs.readFileSync(path.join(root, "data", file), "utf8")) as T;
}

const trip = load<any>("trip.yaml");
const itinerary = load<{ days: any[] }>("itinerary.yaml");
const places = load<{ places: any[] }>("places.yaml").places;
const restaurants = load<{ restaurants: any[] }>("restaurants.yaml").restaurants;
const emergency = load<any>("emergency-public.yaml");
const decisions = load<{ decisions: any[] }>("founder-decisions.yaml").decisions;
const mediaDoc = load<{ media: any[] }>("media.yaml");
const sourcesDoc = load<{ sources: any[] }>("sources.yaml");
const photoMemory = load<any>("photo-memory.yaml");
const placeMap = Object.fromEntries(places.map((p) => [p.id, p]));
const restaurantMap = Object.fromEntries(restaurants.map((r) => [r.id, r]));
const mediaById = Object.fromEntries(mediaDoc.media.map((m) => [m.id, m]));

function mediaSrc(id: string): string {
  const m = mediaById[id];
  if (!m?.pdf_path || !m.license) {
    throw new Error(`PDF media ${id} missing pdf_path or license`);
  }
  const abs = path.join(root, m.pdf_path);
  const buf = fs.readFileSync(abs);
  const ext = path.extname(abs).toLowerCase();
  const mime =
    ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : ext === ".svg" ? "image/svg+xml" : "image/jpeg";
  return `data:${mime};base64,${buf.toString("base64")}`;
}

function altCaption(id: string): string {
  return sanitizeReaderText(mediaById[id].alt_zh);
}

function diagram(id: string, maxH = 150): string {
  return `<div class="media-frame"><img src="${mediaSrc(id)}" alt="${mediaById[id].alt_zh}" style="max-height:${maxH}pt;object-fit:contain;width:100%"/><p class="caption">${altCaption(id)}</p></div>`;
}

/** Section marker via non-rendered data attribute (machine-only; not PDF text). */
function sec(id: string, eyebrow: string, title: string): string {
  return `<div data-pdfsec="${id}" hidden></div><p class="eyebrow">${eyebrow}</p><h2>${title}</h2>`;
}
function secMark(id: string): string {
  return `<div data-pdfsec="${id}" hidden></div>`;
}

function blockHtml(b: any): string {
  const place = b.place_id ? placeMap[b.place_id] : null;
  const rest = b.restaurant_id ? restaurantMap[b.restaurant_id] : null;
  const typeLabel = place ? placeTypeZh(place.type) : null;
  const placeLine = place
    ? `<p><strong>${place.name_zh}</strong> · <span lang="ko">${place.name_ko}</span>${typeLabel ? ` · ${typeLabel}` : ""}${place.area ? ` · ${areaZh(place.area)}` : ""}</p>`
    : "";
  const restLine = rest
    ? `<p>餐飲：${rest.name_zh} · <span lang="ko">${rest.name_ko}</span> · ${statusZh(rest.status)}</p>`
    : b.kind === "meal"
      ? `<p class="muted">餐廳：店家鎖定後補上</p>`
      : "";
  const transit = transitModeZh(b.transit_mode);
  const transitLine = transit
    ? `<p class="muted">${transit}${b.transit_minutes != null ? ` · 約 ${b.transit_minutes} 分` : " · 移動時間出發前確認"}</p>`
    : "";
  const reservationRaw =
    b.reservation_deadline != null
      ? sanitizeReaderText(String(b.reservation_deadline))
          .replace(/T-(\d+)\s*前?/g, "出發前 $1 天")
          .replace(/出發前 (\d+) 天\s*前/g, "出發前 $1 天")
      : null;
  const reservation = reservationRaw
    ? `<p class="muted">預約：${reservationRaw}</p>`
    : place && place.reservation_required === true
      ? `<p class="muted">需要預約</p>`
      : place && place.reservation_required === false
        ? `<p class="muted">通常免預約（出發前再確認）</p>`
        : "";
  const title = sanitizeReaderText(b.title);
  return `<div class="block"><div class="time">${formatClock(b.start)} – ${formatClock(b.end)}</div><strong>${title}</strong><p class="muted">${kindZh(b.kind)}${b.droppable ? " · 體力不足可刪" : ""}</p>${placeLine}${restLine}${transitLine}${reservation}${b.plan_b ? `<p><strong>備案：</strong>${sanitizeReaderText(b.plan_b)}</p>` : ""}</div>`;
}

function dayHeader(day: any, continued = false): string {
  const cont = continued ? " · 續" : "";
  const cal = tripDayLabel(trip.start_date, day.day_index);
  return `<div class="day-header"><p class="eyebrow">Day ${day.day_index}${cal ? ` · ${cal}` : ""} · ${cityZh(day.city)}${cont}</p><h1>${sanitizeReaderText(day.theme)}</h1><p><strong>今天最重要：</strong>${sanitizeReaderText(day.one_priority)}</p><p class="meta-row">最晚回住宿 ${day.return_by} · 步行強度 ${walkingZh(day.walking_level)} · <span class="status">${statusZh(day.status)}</span></p><p class="meta-row">區域：${(day.primary_areas || []).map(areaZh).join("／")}</p></div>`;
}

function dayClosing(day: any): string {
  const drop = (day.droppable_items || []).length
    ? `<p><strong>低體力優先刪除：</strong>${day.droppable_items.map((x: string) => readerRefLabel(String(x), placeMap)).join("、")}</p>`
    : "";
  return `<div class="keep"><p><strong>雨備：</strong>${sanitizeReaderText(day.rain_plan)}</p><p><strong>低體力：</strong>${sanitizeReaderText(day.low_energy_plan)}</p><p><strong>回住宿：</strong>${sanitizeReaderText(day.emergency_return)}</p>${drop}</div>`;
}

function expectBox(day: any): string {
  return `<div class="editorial"><h3>這一天最期待</h3><p>${sanitizeReaderText(day.one_priority)}</p></div>`;
}

function dayPages(day: any, mediaId?: string, sectionId = "seoul_days"): string {
  const blocks = day.blocks || [];
  const media = mediaId
    ? `<img class="day-media" src="${mediaSrc(mediaId)}" alt="${mediaById[mediaId].alt_zh}"/><p class="caption">${altCaption(mediaId)}</p>`
    : "";
  const marker = secMark(sectionId);

  if (day.day_index === 3 && blocks.length >= 4) {
    const morning = blocks.slice(0, 3).map(blockHtml).join("\n");
    const afternoon = blocks.slice(3).map(blockHtml).join("\n");
    return `
<section class="page day compact">
  ${marker}
  ${dayHeader(day, false)}
  ${media}
  ${morning}
  ${expectBox(day)}
</section>
<section class="page day compact">
  ${marker}
  ${dayHeader(day, true)}
  ${afternoon}
  ${dayClosing(day)}
</section>`;
  }

  if (day.day_index === 2 && blocks.length >= 5) {
    const morning = blocks.slice(0, 3).map(blockHtml).join("\n");
    const afternoon = blocks.slice(3).map(blockHtml).join("\n");
    return `
<section class="page day compact">
  ${marker}
  ${dayHeader(day, false)}
  ${media}
  ${morning}
  ${expectBox(day)}
</section>
<section class="page day compact">
  ${marker}
  ${dayHeader(day, true)}
  ${afternoon}
  ${dayClosing(day)}
</section>`;
  }

  if (day.day_index === 6 && blocks.length >= 4) {
    const first = blocks.slice(0, 2).map(blockHtml).join("\n");
    const second = blocks.slice(2).map(blockHtml).join("\n");
    return `
<section class="page day compact">
  ${marker}
  ${dayHeader(day, false)}
  ${media}
  ${first}
  ${expectBox(day)}
</section>
<section class="page day compact">
  ${marker}
  ${dayHeader(day, true)}
  ${second}
  ${dayClosing(day)}
</section>`;
  }

  return `
<section class="page day compact">
  ${marker}
  ${dayHeader(day, false)}
  ${media}
  ${blocks.map(blockHtml).join("\n")}
  ${dayClosing(day)}
</section>`;
}

const days = [...itinerary.days].sort((a, b) => a.day_index - b.day_index);
const seoulDays = days.filter((d) => d.city === "Seoul");
const transitDays = days.filter((d) => d.city === "Transit");
const busanDays = days.filter((d) => d.city === "Busan");
const day7 = busanDays.find((d) => d.day_index === 7);
const busanMain = busanDays.filter((d) => d.day_index !== 7);
const openDecisions = decisions
  .filter((d) => d.status === "DecisionRequired" || d.status === "Provisional")
  .slice(0, 6);

const dayMedia: Record<number, string | undefined> = {
  1: "incheon-arrival-flow",
  2: "day2-hanbok-compare",
  3: "day3-myeongdong-route",
  4: "day4-feasibility-diagram",
  5: "seoul-busan-ktx-journey",
  6: "busan-haeundae",
  7: "busan-station-to-hotel",
};

function creditItemHtml(m: any): string {
  const isAi = m.type === "generated_illustration";
  const creator = isAi
    ? `AI 原創插畫（專案生成 · ${m.generation_date || ""}）`
    : sanitizeReaderText(m.creator);
  const source = String(m.source_url || "").startsWith("http")
    ? "來源頁面見網站圖片出處"
    : isAi
      ? "本專案原創插畫"
      : sanitizeReaderText(m.source_platform || "本專案");
  const attrib = isAi
    ? `本專案 AI 原創插畫 · ${m.generation_date || ""}`
    : sanitizeReaderText(m.attribution);
  const license = sanitizeReaderText(
    String(m.license || "")
      .replace(/Original AI-generated illustration for this project/g, "本專案原創 AI 插畫授權")
      .replace(/AI-generated/g, "AI 原創")
  );
  return `<li><strong>${sanitizeReaderText(m.alt_zh)}</strong><br/>攝影者／生成方式：${creator}<br/>來源：${source}<br/>授權：${license}<br/>出處：${attrib}</li>`;
}

const approvedIllustrations = mediaDoc.media.filter(
  (m) => m.status === "Approved" && m.type === "generated_illustration"
);
const approvedPhotos = mediaDoc.media.filter((m) => m.status === "Approved" && m.type === "photo");
const approvedMaps = mediaDoc.media.filter((m) => m.status === "Approved" && m.type === "map");
const creditIllustrations = approvedIllustrations.map(creditItemHtml).join("");
const creditPhotos = approvedPhotos.map(creditItemHtml).join("");
const creditMaps = approvedMaps.slice(0, 16).map(creditItemHtml).join("");
const photoListStart = approvedIllustrations.length + 1;
const mapListStart = approvedIllustrations.length + approvedPhotos.length + 1;

const monthLabel = formatTripWindow(trip);

const tocEntries: { id: string; title: string }[] = [
  { id: "how_to_use", title: "怎麼使用這本書" },
  { id: "profile", title: "Jerry 與 Nikita" },
  { id: "journey", title: "旅程總覽" },
  { id: "seoul_days", title: "首爾 · Day 1–4" },
  { id: "transit_busan_days", title: "KTX 與釜山 · Day 5–7" },
  { id: "food", title: "美食教材" },
  { id: "transport", title: "交通教材" },
  { id: "shopping", title: "購物與退稅" },
  { id: "hanbok", title: "韓服與宮殿" },
  { id: "photo", title: "拍照與回憶" },
  { id: "before", title: "出發前" },
  { id: "emergency_short", title: "緊急離線（摘要）" },
  { id: "decisions", title: "還要一起決定" },
  { id: "sources", title: "來源" },
  { id: "credits", title: "圖片出處" },
];

function tocHtml(pageMap: Record<string, number> = {}): string {
  const items = tocEntries
    .map((e) => {
      const pg = pageMap[e.id];
      const pageBit = pg ? `<span class="toc-page">${pg}</span>` : `<span class="toc-page">—</span>`;
      return `<li><span class="toc-title">${e.title}</span>${pageBit}</li>`;
    })
    .join("\n");
  return `
<section class="page compact toc">
  ${secMark("toc")}
  <p class="eyebrow">目錄</p>
  <h2>目錄</h2>
  <ol class="toc-list">${items}</ol>
  <p class="muted">頁碼對應章節起始頁。緊急完整卡另見 Emergency／Quick Pack PDF。</p>
</section>`;
}

function buildHandbookBody(tocBlock: string): string {
  return `
<div class="cover">
  <img class="cover-media" src="${mediaSrc("cover-hero")}" alt="${mediaById["cover-hero"].alt_zh}"/>
  <div class="cover-body">
    <p class="eyebrow">我們的韓國 · Textbook Edition</p>
    <h1>Jerry &amp; Nikita</h1>
    <p class="lede">${trip.success_criterion}</p>
    <p class="meta">Jerry 與 Nikita · 首爾四晚 · 釜山兩晚 · ${monthLabel}</p>
    <p class="meta muted">目前是規劃預覽，不是已完成預訂。</p>
  </div>
</div>

${tocBlock}

<section class="page compact">
  ${sec("how_to_use", "How to use", "怎麼使用這本書")}
  <ul class="dense">
    <li><strong>出發前：</strong>讀「出發前」「行李」「交通」與「還要一起決定」。</li>
    <li><strong>路上執行：</strong>用網站「今日」模式；本書當教材與離線備援。</li>
    <li><strong>每天：</strong>看當日行程＋相關教材（食物／拍照／購物）。</li>
    <li><strong>緊急：</strong>先打開 Emergency／Quick Pack；本書只保留摘要。</li>
    <li>狀態文字「目前暫定」代表尚未鎖票／鎖房，不是已預訂。</li>
  </ul>
</section>

<section class="page compact">
  ${sec("profile", "Profile", "Jerry 與 Nikita")}
  <p>第一次一起出國。Nikita 期待 GOT7、海景、韓服、購物、美食與韓國算命；Jerry 希望順暢、不要太累、不要排太滿。</p>
  <p>裝置：Jerry iPhone 14 · Nikita iPhone 17 Pro · 拍立得。兩人照合約八成。</p>
  <ul class="dense">
    <li>不喝酒 · 避免甲殼類主打 · 排隊約超過 1 小時就改備案</li>
    <li>腳容易累：低體力版優先刪拉伸，不硬塞跨區</li>
    <li>精確出發日仍待一起決定（D1）</li>
  </ul>
</section>

<section class="page compact">
  ${sec("journey", "Journey", "旅程總覽")}
  <div class="route-line">
    <strong>TPE → ICN</strong> · 首爾四晚 · <strong>KTX</strong> · 釜山兩晚 · <strong>PUS → TPE</strong>
  </div>
  <p><strong>目前方案：</strong>首爾四晚 + 釜山兩晚 · ${monthLabel}</p>
  <ol class="dense">
    ${days.map((d) => `<li><strong>Day ${d.day_index}</strong> · ${sanitizeReaderText(d.theme)} <span class="muted">（${cityZh(d.city)}）</span></li>`).join("")}
  </ol>
  <p class="muted">這本旅行書是 Textbook Edition 規劃預覽，不是訂票憑證。</p>
</section>

<div class="divider seoul">
  <img src="${mediaSrc("seoul-chapter")}" alt="${mediaById["seoul-chapter"].alt_zh}"/>
  <div class="divider-body">
    ${secMark("seoul_days")}
    <p class="eyebrow">Chapter</p>
    <h1>首爾 · Seoul</h1>
    <p>四晚慢慢走：韓服、宮殿、購物、算命與城市節奏。</p>
  </div>
</div>

${seoulDays.map((d) => dayPages(d, dayMedia[d.day_index], "seoul_days")).join("\n")}

<div class="divider ktx">
  <img src="${mediaSrc("ktx-transition")}" alt="${mediaById["ktx-transition"].alt_zh}"/>
  <div class="divider-body">
    ${secMark("transit_busan_days")}
    <p class="eyebrow">Transit</p>
    <h1>首爾 → 釜山 · KTX</h1>
    <p>移動日以行李與體力為先，車窗風景留給兩個人。</p>
  </div>
</div>

${transitDays.map((d) => dayPages(d, dayMedia[d.day_index], "transit_busan_days")).join("\n")}

<div class="divider busan">
  <img src="${mediaSrc("busan-chapter")}" alt="${mediaById["busan-chapter"].alt_zh}"/>
  <div class="divider-body">
    ${secMark("transit_busan_days")}
    <p class="eyebrow">Chapter</p>
    <h1>釜山 · Busan</h1>
    <p>兩晚海邊收尾：海岸節奏、食物、慢慢走路。</p>
  </div>
</div>

${busanMain.map((d) => dayPages(d, dayMedia[d.day_index], "transit_busan_days")).join("\n")}

<section class="page compact">
  ${sec("transit_busan_days", "Day 7", day7 ? sanitizeReaderText(day7.theme) : "Day 7")}
  ${day7 ? dayHeader(day7, false) : ""}
  ${day7 && dayMedia[7] ? `<img class="day-media" src="${mediaSrc(dayMedia[7])}" alt="${mediaById[dayMedia[7]!].alt_zh}"/>` : ""}
  ${day7 ? (day7.blocks || []).map(blockHtml).join("\n") : ""}
  ${day7 ? dayClosing(day7) : ""}
</section>

<section class="page compact">
  ${sec("food", "Food Atlas", "美食教材")}
  <p>辨識、點餐、避雷。不保證零甲殼類；不為熱門店排過久；腳累不跨區吃一餐。</p>
  ${diagram("food-identify-cards", 130)}
  ${diagram("food-crustacean-shrimp-warn", 130)}
</section>
<section class="page compact">
  ${secMark("food")}
  <p class="eyebrow">Food Atlas · 續</p>
  <h2>點餐與排隊</h2>
  ${diagram("food-order-korean-cards", 120)}
  ${diagram("food-queue-or-alt-decision", 120)}
  <p><strong>釜山：</strong>豬肉湯飯可點；現場仍要問蝦醬。</p>
  ${diagram("busan-pork-order", 110)}
</section>

<section class="page compact">
  ${sec("transport", "Transport", "交通教材")}
  <p>航班、住宿與 KTX 未鎖定時仍可照著做。不是訂票完成狀態。</p>
  ${diagram("incheon-arrival-flow", 130)}
  ${diagram("arex-vs-airport-bus", 120)}
</section>
<section class="page compact">
  ${secMark("transport")}
  <p class="eyebrow">Transport · 續</p>
  <h2>市區 · KTX · 救援</h2>
  ${diagram("transport-card-payment-guide", 110)}
  ${diagram("seoul-busan-ktx-journey", 110)}
  ${diagram("lost-wrong-train-recovery", 110)}
  <p>錯過列車：改下一班庫存，不硬闖危險轉乘。</p>
</section>

<section class="page compact">
  ${sec("shopping", "Shopping", "購物與退稅")}
  <p>明洞單區完成化妝品與衣服補齊。弘大可選／有體力再去；聖水不進 Day 3。</p>
  ${diagram("day3-myeongdong-route", 120)}
  ${diagram("korea-tax-refund-flow", 120)}
  <ul class="dense">
    <li>即時退稅需實體護照；一般退稅預留機場排隊</li>
    <li>排隊約超過 1 小時就先跳過</li>
  </ul>
</section>

<section class="page compact">
  ${sec("hanbok", "Hanbok &amp; Palace", "韓服與宮殿")}
  <p>Day 2 主要行程：租借 → 宮殿合照 → 低體力可刪北村長坡。</p>
  ${diagram("day2-hanbok-compare", 120)}
  ${diagram("day2-palace-areas", 110)}
  ${diagram("day2-low-energy", 100)}
</section>

<section class="page compact">
  ${sec("photo", "Photo &amp; Memory", "拍照與回憶")}
  <p>Jerry（iPhone 14）與 Nikita（iPhone 17 Pro）。兩人照優先；拍立得留給重要時刻。不比較外貌；不虛構日落時刻。</p>
  ${diagram("photo-couple-framing-guide", 120)}
  ${diagram("photo-phone-handoff-timer", 110)}
</section>
<section class="page compact">
  ${secMark("photo")}
  <p class="eyebrow">Photo · 續</p>
  <h2>拍立得 · 雨天 · 回憶 · 禮儀</h2>
  ${diagram("photo-instant-budget-card", 100)}
  ${diagram("photo-rainy-day-guide", 95)}
  ${diagram("photo-memory-card-system", 95)}
  ${diagram("photo-privacy-etiquette-warn", 95)}
  <ul class="dense">
    ${(photoMemory.daily_plans || [])
      .map(
        (p: any) =>
          `<li><strong>Day ${p.day}</strong>：${p.primary_moment}（${(p.memory_prompts || []).slice(0, 1).join("")}）</li>`
      )
      .join("")}
  </ul>
</section>

<section class="page compact">
  ${sec("before", "Before Trip", "出發前")}
  <p>條件式時程：日期鎖定後再把「出發前 N 天」對到日曆。</p>
  ${diagram("before-trip-timeline", 120)}
  ${diagram("sim-esim-powerbank-card", 110)}
</section>
<section class="page compact">
  ${secMark("before")}
  <p class="eyebrow">Before · 行李</p>
  <h2>七天行李與離線文件</h2>
  ${diagram("packing-luggage-decision", 110)}
  ${diagram("offline-docs-checklist", 110)}
</section>

<section class="page compact">
  ${sec("emergency_short", "Emergency", "緊急離線（摘要）")}
  <p class="big">${emergency.korea.police} 警察 · ${emergency.korea.fire_ambulance} 消防／醫療</p>
  <p>${emergency.korea.mission_name} · ${emergency.korea.mission_phone_note}</p>
  <p>完整緊急卡、住宿韓文地址待補與離線口訣，請另開 <strong>Emergency／Quick Pack PDF</strong>（保持短小，不膨脹成旅行書）。</p>
  ${diagram("offline-emergency-transport-card", 110)}
  <p lang="ko">${emergency.phrases_ko.help}</p>
  <p lang="ko">${emergency.phrases_ko.ambulance}</p>
</section>

<section class="page compact">
  ${sec("decisions", "Decisions", "還要一起決定")}
  <ul class="dense">
    ${openDecisions.map((d) => `<li><strong>${d.title_zh}</strong> · ${statusZh(d.status)}</li>`).join("")}
  </ul>
  <p class="muted">未決定前，行程與票務保持「目前暫定」。</p>
</section>

<section class="page compact">
  ${sec("sources", "Sources", "來源（摘要）")}
  <p>教材引用官方與可再查來源。完整列表見網站「來源」頁；時間敏感項目出發前再查。</p>
  <ul class="dense">
    ${sourcesDoc.sources
      .filter((s: any) => s.tier === "A" || s.tier === "B")
      .slice(0, 12)
      .map((s: any) => `<li>${sanitizeReaderText(s.name)} · ${statusZh(s.status)}</li>`)
      .join("")}
  </ul>
</section>

<section class="page compact credits-page">
  ${secMark("credits")}
  <p class="eyebrow">Credits · 1／3</p>
  <h2>圖片出處 · 插畫</h2>
  <p class="muted">封面與章節插畫的完整出處。AI 插畫不是景點證據。</p>
  <ol class="credits dense-credits">${creditIllustrations}</ol>
</section>

<section class="page compact credits-page">
  ${secMark("credits")}
  <p class="eyebrow">Credits · 2／3</p>
  <h2>圖片出處 · 照片</h2>
  <ol class="credits dense-credits" start="${photoListStart}">${creditPhotos}</ol>
</section>

<section class="page compact credits-page">
  ${secMark("credits")}
  <p class="eyebrow">Credits · 3／3</p>
  <h2>圖片出處 · 功能圖</h2>
  <ol class="credits dense-credits" start="${mapListStart}">${creditMaps}</ol>
  <p class="footer-note">Jerry 與 Nikita · 我們的韓國 · Textbook Edition · 非訂票憑證</p>
</section>
`;
}

const emergencyBody = `
<section class="emergency compact-emergency">
  <p class="eyebrow">緊急卡 · Quick Pack</p>
  <h1>緊急協助</h1>
  <p class="big">${emergency.korea.police} 警察 · ${emergency.korea.fire_ambulance} 消防／醫療</p>
  <p>${emergency.korea.mission_name}</p>
  <p>${emergency.korea.mission_phone_note}</p>
  <h2>住宿地址</h2>
  <p>首爾：${sanitizeReaderText(emergency.lodging_placeholders.seoul_address_ko)}</p>
  <p>釜山：${sanitizeReaderText(emergency.lodging_placeholders.busan_address_ko)}</p>
  <h2>保險</h2>
  <p>保險公司：${sanitizeReaderText(emergency.insurance.provider)}</p>
  <p>緊急電話：${sanitizeReaderText(emergency.insurance.emergency_phone)}</p>
  <p class="muted">${sanitizeReaderText(emergency.insurance.note)}</p>
  <h2>韓文短句</h2>
  <p lang="ko">${emergency.phrases_ko.no_alcohol}</p>
  <p lang="ko">${emergency.phrases_ko.no_crustaceans}</p>
  <p lang="ko">${emergency.phrases_ko.help}</p>
  <p lang="ko">${emergency.phrases_ko.ambulance}</p>
  <p lang="ko">${emergency.phrases_ko.taxi_address}</p>
  ${emergency.phrases_ko.wrong_train ? `<p lang="ko">${emergency.phrases_ko.wrong_train}</p>` : ""}
  ${emergency.phrases_ko.station_staff ? `<p lang="ko">${emergency.phrases_ko.station_staff}</p>` : ""}
  <h2>交通救援（摘要）</h2>
  ${(emergency.transport_rescue?.first_moves ?? []).map((m: string) => `<p>${sanitizeReaderText(m)}</p>`).join("\n  ")}
  <p class="muted">${sanitizeReaderText(emergency.offline_note)}</p>
  <p class="muted">完整教材見 Full Textbook PDF；本卡保持短小。</p>
</section>
`;

function footerTemplateHtml(): string {
  const brand = "PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9Ijk4Ljc0MTAwMDAwMDAwMDAzIiBoZWlnaHQ9IjEyIiB2aWV3Qm94PSIwIDAgOTguNzQxMDAwMDAwMDAwMDMgMTIiPjxwYXRoIGQ9Ik02LjM0IDMuMDNDNi44NiAzLjQ5IDcuNDcgNC4xNSA3Ljc1IDQuNThMOC4zMCA0LjE5QzggMy43NiA3LjM3IDMuMTIgNi44NSAyLjY3TTcuNDkgNi4xNkM3LjE4IDYuNzMgNi43OCA3LjMwIDYuMzAgNy44MUM2LjE1IDcuMjEgNi4wMiA2LjUxIDUuOTMgNS43NEw4LjUxIDUuNzRMOC41MSA1LjEwTDUuODYgNS4xMEM1Ljc5IDQuMjkgNS43NSAzLjQyIDUuNzUgMi41MUw1LjA0IDIuNTFDNS4wNSAzLjQwIDUuMDkgNC4yOCA1LjE3IDUuMTBMMy4xMSA1LjEwTDMuMTEgMy41MkMzLjY1IDMuNDAgNC4xOCAzLjI3IDQuNjIgMy4xMUw0LjE0IDIuNTVDMy4yOCAyLjg3IDEuODIgMy4xOCAwLjU2IDMuMzdDMC42NCAzLjUzIDAuNzMgMy43NyAwLjc3IDMuOTNDMS4zMCAzLjg2IDEuODcgMy43NyAyLjQzIDMuNjZMMi40MyA1LjEwTDAuNTAgNS4xMEwwLjUwIDUuNzRMMi40MyA1Ljc0TDIuNDMgNy4zNEwwLjM3IDcuNzRMMC41NyA4LjQzTDIuNDMgOEwyLjQzIDkuODVDMi40MyAxMCAyLjM4IDEwLjA0IDIuMjIgMTAuMDVDMi4wNiAxMC4wNiAxLjUzIDEwLjA2IDAuOTUgMTAuMDRDMS4wNSAxMC4yMyAxLjE3IDEwLjU0IDEuMjAgMTAuNzNDMS45NCAxMC43MyAyLjQzIDEwLjcxIDIuNzEgMTAuNjBDMy4wMSAxMC40OSAzLjExIDEwLjI5IDMuMTEgOS44NUwzLjExIDcuODRMNC43NyA3LjQ1TDQuNzIgNi44NUwzLjExIDcuMTlMMy4xMSA1Ljc0TDUuMjMgNS43NEM1LjM1IDYuNzIgNS41MiA3LjYyIDUuNzMgOC4zOEM1LjA5IDguOTcgNC4zNiA5LjQ4IDMuNTkgOS44NUMzLjc2IDkuOTkgMy45NiAxMC4yMiA0LjA2IDEwLjM4QzQuNzMgMTAuMDMgNS4zOCA5LjU4IDUuOTcgOS4wNUM2LjM3IDEwLjExIDYuOTMgMTAuNzUgNy42NCAxMC43NUM4LjMyIDEwLjc1IDguNTcgMTAuMzEgOC42OSA4LjgxQzguNTEgOC43NSA4LjI2IDguNjAgOC4xMiA4LjQ0QzguMDYgOS42MCA3Ljk2IDEwLjA2IDcuNzAgMTAuMDZDNy4yNSAxMC4wNiA2Ljg0IDkuNDkgNi41MiA4LjUzQzcuMTQgNy44OSA3LjY4IDcuMTcgOC4wOCA2LjQxTTEyLjQ4IDQuODNMMTMuNzQgNC44M0wxMy43NCA1LjcwTDEyLjQ4IDUuNzBNMTIuNDggNC4zMUwxMi40OCAzLjUwTDEzLjc0IDMuNTBMMTMuNzQgNC4zMU0xNi43MCA0LjgzTDE2LjcwIDUuNzBMMTUuMzcgNS43MEwxNS4zNyA0LjgzTTE2LjcwIDQuMzFMMTUuMzcgNC4zMUwxNS4zNyAzLjUwTDE2LjcwIDMuNTBNMTcuMDMgMi45NkwxNC44MiAyLjk2TDE0LjgyIDYuMjRMMTYuNzAgNi4yNEwxNi43MCA5LjgzQzE2LjcwIDEwLjAxIDE2LjY0IDEwLjA2IDE2LjQ3IDEwLjA2QzE2LjI5IDEwLjA3IDE1LjY3IDEwLjA4IDE1LjAyIDEwLjA1QzE1LjEyIDEwLjIzIDE1LjIzIDEwLjUzIDE1LjI2IDEwLjcxQzE2LjExIDEwLjcxIDE2LjY0IDEwLjcwIDE2Ljk1IDEwLjU5QzE3LjI0IDEwLjQ5IDE3LjM1IDEwLjI4IDE3LjM1IDkuODRMMTcuMzUgMi45Nk0xMS44NSAyLjk2TDExLjg1IDEwLjcwTDEyLjQ4IDEwLjcwTDEyLjQ4IDYuMjRMMTQuMjggNi4yNEwxNC4yOCAyLjk2TTExLjEwIDIuNDhDMTAuNjcgMy44OCA5Ljk1IDUuMjcgOS4xNiA2LjE3QzkuMjggNi4zNCA5LjQ1IDYuNjkgOS41MSA2Ljg1QzkuODEgNi41MCAxMC4xMCA2LjA5IDEwLjM3IDUuNjRMMTAuMzcgMTAuNzJMMTEuMDIgMTAuNzJMMTEuMDIgNC40M0MxMS4yOSAzLjg2IDExLjUzIDMuMjYgMTEuNzIgMi42Nk0yMi45NyA2LjE5QzIzLjQ2IDYuODUgMjQuMDggNy43NSAyNC4zNSA4LjMwTDI0LjkyIDcuOTRDMjQuNjIgNy40MSAyNCA2LjU0IDIzLjQ5IDUuOTBNMjAuMTYgMi40MkMyMC4wOSAyLjg1IDE5Ljk0IDMuNDUgMTkuNzkgMy44OUwxOC43OCAzLjg5TDE4Ljc4IDEwLjQ5TDE5LjQwIDEwLjQ5TDE5LjQwIDkuNzhMMjEuOTIgOS43OEwyMS45MiAzLjg5TDIwLjQxIDMuODlDMjAuNTcgMy41MCAyMC43NCAzIDIwLjg5IDIuNTVNMTkuNDAgNC40OUwyMS4yOSA0LjQ5TDIxLjI5IDYuMzlMMTkuNDAgNi4zOU0xOS40MCA5LjE2TDE5LjQwIDYuOThMMjEuMjkgNi45OEwyMS4yOSA5LjE2TTIzLjM4IDIuNDBDMjMuMDkgMy42NSAyMi42MSA0Ljg5IDIxLjk5IDUuNjlDMjIuMTUgNS43OCAyMi40MyA1Ljk3IDIyLjU1IDYuMDhDMjIuODYgNS42NCAyMy4xNSA1LjA5IDIzLjQwIDQuNDhMMjUuNzAgNC40OEMyNS42MCA4LjA5IDI1LjQ1IDkuNDggMjUuMTYgOS43OEMyNS4wNiA5LjkxIDI0Ljk2IDkuOTQgMjQuNzggOS45NEMyNC41NyA5Ljk0IDI0LjAzIDkuOTMgMjMuNDQgOS44OEMyMy41NiAxMC4wNSAyMy42NCAxMC4zNCAyMy42NiAxMC41M0MyNC4xNyAxMC41NiAyNC43MCAxMC41OCAyNSAxMC41NUMyNS4zMyAxMC41MSAyNS41MiAxMC40NCAyNS43MyAxMC4xN0MyNi4wOSA5LjczIDI2LjIyIDguMzMgMjYuMzUgNC4yMEMyNi4zNiA0LjExIDI2LjM2IDMuODYgMjYuMzYgMy44NkwyMy42NCAzLjg2QzIzLjc5IDMuNDQgMjMuOTIgMi45OSAyNC4wMyAyLjU1TTMyLjMzIDUuODlMMzQuNTAgNS44OUwzNC41MCA2LjgwTDMyLjMzIDYuODBNMjguMzEgNi40OUwzMC4yMSA2LjQ5TDMwLjIxIDcuMjBMMjguMzEgNy4yME0yOC4zMSA1LjI5TDMwLjIxIDUuMjlMMzAuMjEgNS45OEwyOC4zMSA1Ljk4TTM0LjMzIDQuNDRMMzMuMDIgNC40NEwzMy4xMyAzLjcwTDM0LjMzIDMuNzBNMzIuNjMgMi40NEwzMi41NSAzLjE3TDMxLjUxIDMuMTdMMzEuNTEgMy43MEwzMi41MCAzLjcwTDMyLjQwIDQuNDRMMzEuMDQgNC40NEwzMS4wNCA0Ljk5TDM1LjYyIDQuOTlMMzUuNjIgNC40NEwzNC45MyA0LjQ0TDM0LjkzIDMuMTdMMzMuMTkgMy4xN0wzMy4yNiAyLjQ5TTMxLjMzIDcuNzlMMzEuMzMgOC4zM0wzMS45MyA4LjMzQzMxLjgyIDguODEgMzEuNzAgOS4zNiAzMS41OCA5Ljc0TDMzLjM4IDkuNzRMMzMuMzggMTAuNzFMMzQuMDEgMTAuNzFMMzQuMDEgOS43NEwzNS42MiA5Ljc0TDM1LjYyIDkuMjBMMzQuMDEgOS4yMEwzNC4wMSA4LjMzTDM1LjQyIDguMzNMMzUuNDIgNy43OUwzNC4wMSA3Ljc5TDM0LjAxIDcuMjZMMzUuMTUgNy4yNkwzNS4xNSA1LjQwTDMxLjY5IDUuNDBMMzEuNjkgNy4yNkwzMy4zOCA3LjI2TDMzLjM4IDcuNzlNMzMuMzggOC4zM0wzMy4zOCA5LjIwTDMyLjM0IDkuMjBMMzIuNTMgOC4zM00yNy4zOCA4LjUwTDI3LjM4IDkuMTFMMjguOTMgOS4xMUwyOC45MyAxMC43MUwyOS41OCAxMC43MUwyOS41OCA5LjExTDMxLjEwIDkuMTFMMzEuMTAgOC41MEwyOS41OCA4LjUwTDI5LjU4IDcuNzNMMzAuODMgNy43M0wzMC44MyA0Ljc0TDI5LjU4IDQuNzRMMjkuNTggMy45OUwzMS4wMSAzLjk5TDMxLjAxIDMuMzhMMjkuNTggMy4zOEwyOS41OCAyLjQyTDI4LjkzIDIuNDJMMjguOTMgMy4zOEwyNy40NyAzLjM4TDI3LjQ3IDMuOTlMMjguOTMgMy45OUwyOC45MyA0Ljc0TDI3LjcxIDQuNzRMMjcuNzEgNy43M0wyOC45MyA3LjczTDI4LjkzIDguNTBNNDEuNjMgMy45MkM0MS45OCA0LjA5IDQyLjM5IDQuMzYgNDIuNjAgNC41Nkw0Mi45MiA0LjIwQzQyLjcxIDQgNDIuMjkgMy43NCA0MS45NCAzLjU5TTM3Ljc4IDguMzNMMzcuODggOC44NkMzOC42MyA4LjcxIDM5LjU4IDguNTIgNDAuNTMgOC4zM0w0MC41MCA3Ljg2QzM5LjQ5IDguMDUgMzguNDggOC4yMyAzNy43OCA4LjMzTTM4LjY3IDYuMTZMMzkuNzEgNi4xNkwzOS43MSA3LjA3TDM4LjY3IDcuMDdNMzguMjAgNS43NEwzOC4yMCA3LjQ5TDQwLjIwIDcuNDlMNDAuMjAgNS43NE00MC41NCAzLjY5TDQwLjYxIDQuNjZMMzcuODcgNC42NkwzNy44NyA1LjE3TDQwLjY1IDUuMTdDNDAuNzUgNi4xOSA0MC45MSA3LjEzIDQxLjE1IDcuODVDNDAuNzcgOC4zMyA0MC4zMSA4LjcyIDM5Ljc4IDkuMDNDMzkuOTEgOS4xMyA0MC4xMCA5LjM0IDQwLjE4IDkuNDVDNDAuNjIgOS4xNiA0MS4wMiA4LjgyIDQxLjM3IDguNDJDNDEuNjIgOC45MCA0MS45MSA5LjIyIDQyLjMxIDkuMzBDNDIuNzkgOS40NyA0My4xMCA5LjEyIDQzLjIzIDguMTNDNDMuMTAgOC4wNyA0Mi44OSA3LjkzIDQyLjc4IDcuODFDNDIuNzIgOC40MSA0Mi42MyA4Ljc5IDQyLjUxIDguNzZDNDIuMjEgOC43MSA0MS45NyA4LjQwIDQxLjc3IDcuOTFDNDIuMjEgNy4yOSA0Mi41NCA2LjU1IDQyLjc4IDUuNzBMNDIuMjMgNS41OUM0Mi4wOCA2LjIwIDQxLjg1IDYuNzYgNDEuNTUgNy4yNUM0MS40MSA2LjY2IDQxLjI5IDUuOTQgNDEuMjIgNS4xN0w0My4xNSA1LjE3TDQzLjE1IDQuNjZMNDEuMTggNC42Nkw0MS4xMSAzLjY5TTM2Ljc0IDIuODVMMzYuNzQgMTAuNzVMMzcuMzkgMTAuNzVMMzcuMzkgMTAuMzJMNDMuNjAgMTAuMzJMNDMuNjAgMTAuNzVMNDQuMjYgMTAuNzVMNDQuMjYgMi44NU0zNy4zOSA5LjcxTDM3LjM5IDMuNDdMNDMuNjAgMy40N0w0My42MCA5LjcxTTUxLjUyIDUuNjNDNTAuOTkgNS42MyA1MC41NiA2LjA1IDUwLjU2IDYuNThDNTAuNTYgNy4xMSA1MC45OSA3LjUzIDUxLjUyIDcuNTNDNTIuMDUgNy41MyA1Mi40NyA3LjExIDUyLjQ3IDYuNThDNTIuNDcgNi4wNSA1Mi4wNSA1LjYzIDUxLjUyIDUuNjNNNjAuMzEgMTBMNjEuMTUgMTBMNjEuMTUgNC4xMEw2My4xNCA0LjEwTDYzLjE0IDMuNDBMNTguMzEgMy40MEw1OC4zMSA0LjEwTDYwLjMxIDQuMTBNNjUuNTcgMTAuMTJDNjYuMjIgMTAuMTIgNjYuNzQgOS45MCA2Ny4xNyA5LjYyTDY2Ljg4IDkuMDdDNjYuNTEgOS4zMiA2Ni4xMyA5LjQ2IDY1LjY2IDkuNDZDNjQuNzMgOS40NiA2NC4wOSA4Ljc5IDY0LjA0IDcuNzVMNjcuMzMgNy43NUM2Ny4zNSA3LjYyIDY3LjM3IDcuNDYgNjcuMzcgNy4yOEM2Ny4zNyA1Ljg5IDY2LjY2IDQuOTkgNjUuNDEgNC45OUM2NC4zMCA0Ljk5IDYzLjIzIDUuOTcgNjMuMjMgNy41NkM2My4yMyA5LjE3IDY0LjI2IDEwLjEyIDY1LjU3IDEwLjEyTTY0LjAzIDcuMTZDNjQuMTMgNi4xOSA2NC43NCA1LjY0IDY1LjQzIDUuNjRDNjYuMjAgNS42NCA2Ni42NSA2LjE3IDY2LjY1IDcuMTZNNjcuODEgMTBMNjguNjcgMTBMNjkuMzMgOC44NkM2OS41MCA4LjU2IDY5LjY1IDguMjYgNjkuODIgNy45OEw2OS44NyA3Ljk4QzcwLjA2IDguMjYgNzAuMjQgOC41NiA3MC40MCA4Ljg2TDcxLjEyIDEwTDcyLjAyIDEwTDcwLjQxIDcuNTNMNzEuODkgNS4xMUw3MS4wNCA1LjExTDcwLjQzIDYuMThDNzAuMjggNi40NiA3MC4xNSA2LjcyIDcwIDdMNjkuOTYgN0M2OS44MCA2LjcyIDY5LjYyIDYuNDYgNjkuNDggNi4xOEw2OC44MiA1LjExTDY3LjkzIDUuMTFMNjkuNDIgNy40NU03NC4yNyAxMC4xMkM3NC41NyAxMC4xMiA3NC45MCAxMC4wMyA3NS4xOCA5Ljk0TDc1LjAyIDkuMzJDNzQuODUgOS4zOSA3NC42NCA5LjQ1IDc0LjQ2IDkuNDVDNzMuODkgOS40NSA3My43MCA5LjExIDczLjcwIDguNTJMNzMuNzAgNS43OEw3NS4wMyA1Ljc4TDc1LjAzIDUuMTFMNzMuNzAgNS4xMUw3My43MCAzLjc0TDczLjAyIDMuNzRMNzIuOTMgNS4xMUw3Mi4xNSA1LjE2TDcyLjE1IDUuNzhMNzIuODggNS43OEw3Mi44OCA4LjQ5QzcyLjg4IDkuNDcgNzMuMjMgMTAuMTIgNzQuMjcgMTAuMTJNNzguMjggMTAuMTJDNzkuNDAgMTAuMTIgODAuNDEgOS4xNSA4MC40MSA3LjQ4QzgwLjQxIDUuOTcgNzkuNzIgNC45OSA3OC40NiA0Ljk5Qzc3LjkxIDQuOTkgNzcuMzcgNS4yOSA3Ni45MiA1LjY3TDc2Ljk2IDQuODBMNzYuOTYgMi44NEw3Ni4xMyAyLjg0TDc2LjEzIDEwTDc2Ljc5IDEwTDc2Ljg2IDkuNTBMNzYuOTAgOS41MEM3Ny4zMiA5Ljg4IDc3LjgzIDEwLjEyIDc4LjI4IDEwLjEyTTc4LjE1IDkuNDJDNzcuODIgOS40MiA3Ny4zOCA5LjMwIDc2Ljk2IDguOTJMNzYuOTYgNi4zNUM3Ny40MiA1LjkxIDc3Ljg1IDUuNjggNzguMjYgNS42OEM3OS4xOSA1LjY4IDc5LjU1IDYuNDAgNzkuNTUgNy40OUM3OS41NSA4LjcwIDc4Ljk2IDkuNDIgNzguMTUgOS40Mk04My41OSAxMC4xMkM4NC43OSAxMC4xMiA4NS44NSA5LjE4IDg1Ljg1IDcuNTZDODUuODUgNS45MyA4NC43OSA0Ljk5IDgzLjU5IDQuOTlDODIuNDAgNC45OSA4MS4zMyA1LjkzIDgxLjMzIDcuNTZDODEuMzMgOS4xOCA4Mi40MCAxMC4xMiA4My41OSAxMC4xMk04My41OSA5LjQzQzgyLjc1IDkuNDMgODIuMTggOC42OSA4Mi4xOCA3LjU2QzgyLjE4IDYuNDQgODIuNzUgNS42OCA4My41OSA1LjY4Qzg0LjQ0IDUuNjggODUuMDEgNi40NCA4NS4wMSA3LjU2Qzg1LjAxIDguNjkgODQuNDQgOS40MyA4My41OSA5LjQzTTg5LjA1IDEwLjEyQzkwLjI0IDEwLjEyIDkxLjMxIDkuMTggOTEuMzEgNy41NkM5MS4zMSA1LjkzIDkwLjI0IDQuOTkgODkuMDUgNC45OUM4Ny44NSA0Ljk5IDg2Ljc5IDUuOTMgODYuNzkgNy41NkM4Ni43OSA5LjE4IDg3Ljg1IDEwLjEyIDg5LjA1IDEwLjEyTTg5LjA1IDkuNDNDODguMjAgOS40MyA4Ny42MyA4LjY5IDg3LjYzIDcuNTZDODcuNjMgNi40NCA4OC4yMCA1LjY4IDg5LjA1IDUuNjhDODkuODkgNS42OCA5MC40NyA2LjQ0IDkwLjQ3IDcuNTZDOTAuNDcgOC42OSA4OS44OSA5LjQzIDg5LjA1IDkuNDNNOTIuNjAgMTBMOTMuNDEgMTBMOTMuNDEgOC43MUw5NC4zMyA3LjY0TDk1Ljc2IDEwTDk2LjY1IDEwTDk0LjgxIDcuMDhMOTYuNDQgNS4xMUw5NS41MiA1LjExTDkzLjQ1IDcuNjlMOTMuNDEgNy42OUw5My40MSAyLjg0TDkyLjYwIDIuODQiIGZpbGw9IiM1YTYzNWMiLz48L3N2Zz4=";
  // CJK brand as path SVG (no system-font dependency). Page numbers stay as extractable text.
  return `<div style="width:100%;font-size:9px;color:#5a635c;padding:0 24px;display:flex;justify-content:space-between;align-items:center;font-family:Arial,sans-serif;box-sizing:border-box;-webkit-print-color-adjust:exact">
  <img src="data:image/svg+xml;base64,${brand}" style="height:10px;width:auto" alt=""/>
  <span class="pageNumber"></span><span> / </span><span class="totalPages"></span>
</div>`;
}

/** Draft-only extractable markers — never used in the final reader PDF. */
function withDraftSectionMarkers(html: string): string {
  return html.replace(/<div data-pdfsec="([a-z0-9_]+)" hidden><\/div>/g, (_m, id) => {
    return `<div data-pdfsec="${id}" hidden></div><p class="sec-marker-draft">PDFSEC:${id}</p>`;
  });
}

async function renderPdf(html: string, outFile: string, withFooter = true) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle" });
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
  });
  const out = path.join(distDir, outFile);
  await page.pdf({
    path: out,
    format: "A4",
    printBackground: true,
    displayHeaderFooter: withFooter,
    headerTemplate: "<div></div>",
    footerTemplate: withFooter ? footerTemplateHtml() : "<div></div>",
    margin: { top: "12mm", bottom: "16mm", left: "10mm", right: "10mm" },
  });
  await browser.close();
  return out;
}

type SectionManifest = {
  generated_at: string;
  /** PR #25 merge on main — product content baseline for this repair series. */
  product_baseline_sha: string;
  /** Git HEAD when this PDF/render was generated (not a claimed "main tip"). */
  render_source_sha: string;
  total_pages: number;
  pages: Array<{ page: number; section: string }>;
  section_first_page: Record<string, number>;
  section_counts: Record<string, number>;
};

function buildSectionManifest(pdfPath: string): SectionManifest {
  const info = execSync(`pdfinfo "${pdfPath}"`, { encoding: "utf8" });
  const total = Number((info.match(/Pages:\s+(\d+)/) || [])[1] || 0);
  const pages: Array<{ page: number; section: string }> = [];
  const sectionFirst: Record<string, number> = {};
  const counts: Record<string, number> = {};
  let current = "front";
  for (let i = 1; i <= total; i++) {
    const text = execSync(`pdftotext -f ${i} -l ${i} -layout "${pdfPath}" -`, { encoding: "utf8" });
    const markers = [...text.matchAll(/PDFSEC:([a-z0-9_]+)/g)].map((m) => m[1]);
    if (markers.length) current = markers[markers.length - 1];
    pages.push({ page: i, section: current });
    if (!(current in sectionFirst)) sectionFirst[current] = i;
    counts[current] = (counts[current] || 0) + 1;
  }
  const PRODUCT_BASELINE_SHA = "fc7a2ff49f1ed2e32b4a10448daac4a16a13b73c"; // PR #25 merge
  let renderSource = "unknown";
  try {
    renderSource = execSync("git rev-parse HEAD", { encoding: "utf8", cwd: root }).trim();
  } catch {
    /* ignore */
  }
  return {
    generated_at: new Date().toISOString(),
    product_baseline_sha: PRODUCT_BASELINE_SHA,
    render_source_sha: renderSource,
    total_pages: total,
    pages,
    section_first_page: sectionFirst,
    section_counts: counts,
  };
}

function writeSectionManifest(manifest: SectionManifest) {
  const out = path.join(root, "docs/design-proof/pdf-section-manifest.json");
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(manifest, null, 2) + "\n");
  console.log(" - section manifest:", path.relative(root, out));
}

// Pass 1: draft WITH temporary PDFSEC markers (for TOC + section manifest only)
const draftHtml = withDraftSectionMarkers(wrapHtml("Korea Trip Textbook", buildHandbookBody(tocHtml({}))));
const draftPath = await renderPdf(draftHtml, "_handbook-draft.pdf");
const manifest = buildSectionManifest(draftPath);
const pageMap = { ...manifest.section_first_page };
delete (pageMap as any).front;
fs.unlinkSync(draftPath);

// Pass 2: final reader PDF — zero PDFSEC in extractable text / rendered pages
await renderPdf(wrapHtml("Korea Trip Textbook", buildHandbookBody(tocHtml(pageMap))), "korea-trip-handbook.pdf");
await renderPdf(wrapHtml("Emergency Pack", emergencyBody), "emergency-pack.pdf", false);

// Re-stamp total_pages from final handbook (should match draft structure)
try {
  const info = execSync(`pdfinfo "${path.join(distDir, "korea-trip-handbook.pdf")}"`, { encoding: "utf8" });
  const finalPages = Number((info.match(/Pages:\s+(\d+)/) || [])[1] || 0);
  if (finalPages !== manifest.total_pages) {
    console.warn(`Section manifest page count ${manifest.total_pages} != final ${finalPages}`);
  }
  manifest.total_pages = finalPages;
} catch {
  /* ignore */
}
writeSectionManifest(manifest);

console.log("PDF generation complete (Textbook Edition rendering repair):");
console.log(" - dist/korea-trip-handbook.pdf");
console.log(" - dist/emergency-pack.pdf");
console.log(" - TOC page map:", JSON.stringify(pageMap));
