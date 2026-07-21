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
  formatTargetMonth,
  kindZh,
  placeTypeZh,
  readerRefLabel,
  sanitizeReaderText,
  statusZh,
  transitModeZh,
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
  return mediaById[id].alt_zh;
}

function diagram(id: string, maxH = 150): string {
  return `<div class="media-frame"><img src="${mediaSrc(id)}" alt="${mediaById[id].alt_zh}" style="max-height:${maxH}pt;object-fit:contain;width:100%"/><p class="caption">${altCaption(id)}</p></div>`;
}

/** Extractable section marker for section-aware PDF budgets + TOC. */
function sec(id: string, eyebrow: string, title: string): string {
  return `<p class="sec-marker">PDFSEC:${id}</p><p class="eyebrow">${eyebrow}</p><h2>${title}</h2>`;
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
  return `<div class="day-header"><p class="eyebrow">Day ${day.day_index} · ${cityZh(day.city)}${cont}</p><h1>${sanitizeReaderText(day.theme)}</h1><p><strong>今天最重要：</strong>${sanitizeReaderText(day.one_priority)}</p><p class="meta-row">最晚回住宿 ${day.return_by} · 步行強度 ${walkingZh(day.walking_level)} · <span class="status">${statusZh(day.status)}</span></p><p class="meta-row">區域：${(day.primary_areas || []).map(areaZh).join("／")}</p></div>`;
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
  const marker = `<p class="sec-marker">PDFSEC:${sectionId}</p>`;

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
    : m.creator;
  const source = String(m.source_url || "").startsWith("http")
    ? "來源頁面見網站圖片出處"
    : isAi
      ? "本專案原創插畫"
      : m.source_platform || "本專案";
  const attrib = isAi
    ? `本專案 AI 原創插畫 · ${m.generation_date || ""}`
    : m.attribution;
  const license = String(m.license || "")
    .replace(/Original AI-generated illustration for this project/g, "本專案原創 AI 插畫授權")
    .replace(/AI-generated/g, "AI 原創");
  return `<li><strong>${m.alt_zh}</strong><br/>攝影者／生成方式：${creator}<br/>來源：${source}<br/>授權：${license}<br/>出處：${attrib}</li>`;
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

const monthLabel = formatTargetMonth(trip.target_month);

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
  <p class="sec-marker">PDFSEC:toc</p>
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
    <p class="sec-marker">PDFSEC:seoul_days</p>
    <p class="eyebrow">Chapter</p>
    <h1>首爾 · Seoul</h1>
    <p>四晚慢慢走：韓服、宮殿、購物、算命與城市節奏。</p>
  </div>
</div>

${seoulDays.map((d) => dayPages(d, dayMedia[d.day_index], "seoul_days")).join("\n")}

<div class="divider ktx">
  <img src="${mediaSrc("ktx-transition")}" alt="${mediaById["ktx-transition"].alt_zh}"/>
  <div class="divider-body">
    <p class="sec-marker">PDFSEC:transit_busan_days</p>
    <p class="eyebrow">Transit</p>
    <h1>首爾 → 釜山 · KTX</h1>
    <p>移動日以行李與體力為先，車窗風景留給兩個人。</p>
  </div>
</div>

${transitDays.map((d) => dayPages(d, dayMedia[d.day_index], "transit_busan_days")).join("\n")}

<div class="divider busan">
  <img src="${mediaSrc("busan-chapter")}" alt="${mediaById["busan-chapter"].alt_zh}"/>
  <div class="divider-body">
    <p class="sec-marker">PDFSEC:transit_busan_days</p>
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
  <p class="sec-marker">PDFSEC:food</p>
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
  <p class="sec-marker">PDFSEC:transport</p>
  <p class="eyebrow">Transport · 續</p>
  <h2>市區 · KTX · 救援</h2>
  ${diagram("transport-card-payment-guide", 110)}
  ${diagram("seoul-busan-ktx-journey", 110)}
  ${diagram("lost-wrong-train-recovery", 110)}
  <p>錯過列車：改下一班庫存，不硬闖危險轉乘。</p>
</section>

<section class="page compact">
  ${sec("shopping", "Shopping", "購物與退稅")}
  <p>明洞單區完成化妝品與衣服補齊。弘大 Optional；聖水不進 Day 3。</p>
  ${diagram("day3-myeongdong-route", 120)}
  ${diagram("korea-tax-refund-flow", 120)}
  <ul class="dense">
    <li>即時退稅需實體護照；一般退稅預留機場排隊</li>
    <li>排隊約超過 1 小時就先跳過</li>
  </ul>
</section>

<section class="page compact">
  ${sec("hanbok", "Hanbok &amp; Palace", "韓服與宮殿")}
  <p>Day 2 Core：租借 → 宮殿合照 → 低體力可刪北村長坡。</p>
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
  <p class="sec-marker">PDFSEC:photo</p>
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
  <p class="sec-marker">PDFSEC:before</p>
  <p class="eyebrow">Before · 行李</p>
  <h2>七天行李與離線文件</h2>
  ${diagram("packing-luggage-decision", 110)}
  ${diagram("offline-docs-checklist", 110)}
</section>

<section class="page compact">
  ${sec("emergency_short", "Emergency", "緊急離線（摘要）")}
  <p class="big">${emergency.korea.police} 警察 · ${emergency.korea.fire_ambulance} 消防／醫療</p>
  <p>${emergency.korea.mission_name} · ${emergency.korea.mission_phone_note}</p>
  <p>完整緊急卡、住宿韓文地址占位與離線口訣，請另開 <strong>Emergency／Quick Pack PDF</strong>（保持短小，不膨脹成旅行書）。</p>
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
  <p class="sec-marker">PDFSEC:credits</p>
  <p class="eyebrow">Credits · 1／3</p>
  <h2>圖片出處 · 插畫</h2>
  <p class="muted">封面與章節插畫的完整出處。AI 插畫不是景點證據。</p>
  <ol class="credits dense-credits">${creditIllustrations}</ol>
</section>

<section class="page compact credits-page">
  <p class="sec-marker">PDFSEC:credits</p>
  <p class="eyebrow">Credits · 2／3</p>
  <h2>圖片出處 · 照片</h2>
  <ol class="credits dense-credits" start="${photoListStart}">${creditPhotos}</ol>
</section>

<section class="page compact credits-page">
  <p class="sec-marker">PDFSEC:credits</p>
  <p class="eyebrow">Credits · 3／3</p>
  <h2>圖片出處 · 功能圖</h2>
  <ol class="credits dense-credits" start="${mapListStart}">${creditMaps}</ol>
  <p class="footer-note">Jerry 與 Nikita · 我們的韓國 · Textbook Edition · 非訂票憑證</p>
</section>
`;
}

const emergencyBody = `
<section class="emergency">
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
    footerTemplate:
      '<div style="width:100%;font-size:8px;color:#5a635c;padding:0 24px;display:flex;justify-content:space-between;font-family:sans-serif"><span>我們的韓國 · Textbook</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>',
    margin: { top: "12mm", bottom: "16mm", left: "10mm", right: "10mm" },
  });
  await browser.close();
  return out;
}

function mapSectionPages(pdfPath: string): Record<string, number> {
  const map: Record<string, number> = {};
  try {
    const info = execSync(`pdfinfo "${pdfPath}"`, { encoding: "utf8" });
    const pages = Number((info.match(/Pages:\s+(\d+)/) || [])[1] || 0);
    for (let i = 1; i <= pages; i++) {
      const text = execSync(`pdftotext -f ${i} -l ${i} -layout "${pdfPath}" -`, { encoding: "utf8" });
      const matches = [...text.matchAll(/PDFSEC:([a-z0-9_]+)/g)];
      for (const m of matches) {
        const id = m[1];
        if (!(id in map)) map[id] = i;
      }
    }
  } catch (e) {
    console.warn("TOC page map failed:", e);
  }
  return map;
}

// Pass 1: draft with empty TOC page numbers
const draftPath = await renderPdf(wrapHtml("Korea Trip Textbook", buildHandbookBody(tocHtml({}))), "_handbook-draft.pdf");
const pageMap = mapSectionPages(draftPath);
fs.unlinkSync(draftPath);

// Pass 2: final with TOC page numbers + footer
await renderPdf(wrapHtml("Korea Trip Textbook", buildHandbookBody(tocHtml(pageMap))), "korea-trip-handbook.pdf");
await renderPdf(wrapHtml("Emergency Pack", emergencyBody), "emergency-pack.pdf", false);

console.log("PDF generation complete (Textbook Edition restructure):");
console.log(" - dist/korea-trip-handbook.pdf");
console.log(" - dist/emergency-pack.pdf");
console.log(" - TOC page map:", JSON.stringify(pageMap));
