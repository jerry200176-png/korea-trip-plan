import fs from "node:fs";
import path from "node:path";
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

function creditLabel(m: any): string {
  if (m.type === "generated_illustration") return "AI 原創插畫";
  if (m.type === "photo") return "照片";
  return "圖示";
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
    ? `<p><strong>低體力優先刪除：</strong>${day.droppable_items.map((x: string) => sanitizeReaderText(String(x))).join("、")}</p>`
    : "";
  return `<div class="keep"><p><strong>雨備：</strong>${sanitizeReaderText(day.rain_plan)}</p><p><strong>低體力：</strong>${sanitizeReaderText(day.low_energy_plan)}</p><p><strong>回住宿：</strong>${sanitizeReaderText(day.emergency_return)}</p>${drop}</div>`;
}

function expectBox(day: any): string {
  return `<div class="editorial"><h3>這一天最期待</h3><p>${sanitizeReaderText(day.one_priority)}</p></div>`;
}

/** Prefer one page; Day 2 and Day 6 use meaningful two-page spreads. */
function dayPages(day: any, mediaId?: string): string {
  const blocks = day.blocks || [];
  const media = mediaId
    ? `<img class="day-media" src="${mediaSrc(mediaId)}" alt="${mediaById[mediaId].alt_zh}"/><p class="caption">${altCaption(mediaId)}</p>`
    : "";

  // Day 2: morning experience / afternoon free
  if (day.day_index === 2 && blocks.length >= 5) {
    const morning = blocks.slice(0, 3).map(blockHtml).join("\n");
    const afternoon = blocks.slice(3).map(blockHtml).join("\n");
    return `
<section class="page day compact">
  ${dayHeader(day, false)}
  ${media}
  ${morning}
  ${expectBox(day)}
</section>
<section class="page day compact">
  ${dayHeader(day, true)}
  ${afternoon}
  ${dayClosing(day)}
</section>`;
  }

  // Day 6: coast morning / optional afternoon + closing (avoid orphan rain block)
  if (day.day_index === 6 && blocks.length >= 4) {
    const first = blocks.slice(0, 2).map(blockHtml).join("\n");
    const second = blocks.slice(2).map(blockHtml).join("\n");
    return `
<section class="page day compact">
  ${dayHeader(day, false)}
  ${media}
  ${first}
  ${expectBox(day)}
</section>
<section class="page day compact">
  ${dayHeader(day, true)}
  ${second}
  ${dayClosing(day)}
</section>`;
  }

  return `
<section class="page day compact">
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
  .slice(0, 4);

const dayMedia: Record<number, string | undefined> = {
  2: "seoul-palace-gate",
  6: "busan-haeundae",
};

const creditsItems = mediaDoc.media
  .filter((m) => m.status === "Approved" && (m.type === "photo" || m.type === "generated_illustration"))
  .map((m) => {
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
    return `<li><strong>${m.alt_zh}</strong><br/>名稱：${m.id}<br/>攝影者／生成方式：${creator}<br/>來源：${source}<br/>License：${m.license}<br/>Attribution：${attrib}</li>`;
  })
  .join("");

const monthLabel = formatTargetMonth(trip.target_month);

const handbookBody = `
<div class="cover">
  <img class="cover-media" src="${mediaSrc("cover-hero")}" alt="${mediaById["cover-hero"].alt_zh}"/>
  <div class="cover-body">
    <p class="eyebrow">我們的韓國 · 旅行規劃預覽版</p>
    <h1>${trip.title}</h1>
    <p class="lede">${trip.success_criterion}</p>
    <p class="meta">首爾四晚 · 釜山兩晚 · ${monthLabel}</p>
    <p class="meta muted">目前是規劃預覽，不是已完成預訂。</p>
  </div>
</div>

<section class="page intro compact">
  <p class="eyebrow">Intro</p>
  <h2>我們想留下的回憶</h2>
  <p>這是我們第一次一起出國。成功標準只有一句：${trip.success_criterion}。</p>
  <p>女友期待：GOT7、海景、韓服、購物、美食、韓國算命。Jerry 希望順暢、不要太累、不要排太滿。兩人照與拍立得很重要。</p>
  <div class="route-line">
    <strong>TPE → ICN</strong> · 首爾四晚 · <strong>KTX</strong> · 釜山兩晚 · <strong>PUS → TPE</strong>
  </div>
  <p><strong>目前方案：</strong>首爾四晚 + 釜山兩晚 · ${monthLabel}</p>
  <ol class="dense">
    ${days.map((d) => `<li><strong>Day ${d.day_index}</strong> · ${sanitizeReaderText(d.theme)} <span class="muted">（${cityZh(d.city)}）</span></li>`).join("")}
  </ol>
  <p class="muted">這本旅行書是規劃預覽版，不是訂票憑證。</p>
</section>

<div class="divider seoul">
  <img src="${mediaSrc("seoul-chapter")}" alt="${mediaById["seoul-chapter"].alt_zh}"/>
  <div class="divider-body">
    <p class="eyebrow">Chapter</p>
    <h1>首爾 · Seoul</h1>
    <p>四晚慢慢走：韓服、宮殿、購物、算命與城市節奏。</p>
  </div>
</div>

${seoulDays.map((d) => dayPages(d, dayMedia[d.day_index])).join("\n")}

<div class="divider ktx">
  <img src="${mediaSrc("ktx-transition")}" alt="${mediaById["ktx-transition"].alt_zh}"/>
  <div class="divider-body">
    <p class="eyebrow">Transit</p>
    <h1>首爾 → 釜山 · KTX</h1>
    <p>移動日以行李與體力為先，車窗風景留給兩個人。</p>
  </div>
</div>

${transitDays.map((d) => dayPages(d)).join("\n")}

<div class="divider busan">
  <img src="${mediaSrc("busan-chapter")}" alt="${mediaById["busan-chapter"].alt_zh}"/>
  <div class="divider-body">
    <p class="eyebrow">Chapter</p>
    <h1>釜山 · Busan</h1>
    <p>兩晚海邊收尾：海雲台、橋的節奏、慢慢走路。</p>
  </div>
</div>

${busanMain.map((d) => dayPages(d, dayMedia[d.day_index])).join("\n")}

<section class="page compact">
  ${day7 ? dayHeader(day7, false) : ""}
  ${day7 ? (day7.blocks || []).map(blockHtml).join("\n") : ""}
  ${day7 ? dayClosing(day7) : ""}
  <div class="editorial" style="margin-top:8pt">
    <h3>一起決定</h3>
    <ul class="dense">
      ${openDecisions.map((d) => `<li><strong>${d.title_zh}</strong> · ${statusZh(d.status)}</li>`).join("")}
    </ul>
  </div>
  <div class="editorial" style="margin-top:8pt">
    <h3>出發前</h3>
    <ul class="dense">
      <li>護照效期、K-ETA／入境規定出發前再查官網</li>
      <li>住宿確認後填入緊急卡地址</li>
      <li>出發前下載離線版 PDF 存入手機</li>
      <li>保險與私人電話僅離線保存</li>
      <li>無酒精、避免甲殼海鮮偏好隨身記得</li>
    </ul>
  </div>
  <p class="meta-row" style="margin-top:10pt">最期待：韓服 · 宮殿 · 海景 · 美食 · 購物 · 算命</p>
  <p class="footer-note">我們的韓國 · 旅行規劃預覽版 · 非訂票憑證</p>
</section>

<section class="page compact">
  <p class="eyebrow">Credits</p>
  <h2>Image Credits</h2>
  <p class="muted">封面、章節與每日正文不放技術出處；完整 attribution 如下。AI 插畫不是景點證據。</p>
  <ol class="credits">${creditsItems}</ol>
</section>
`;

const emergencyBody = `
<section class="emergency">
  <p class="eyebrow">緊急卡</p>
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
  <p class="muted">${sanitizeReaderText(emergency.offline_note)}</p>
</section>
`;

async function renderPdf(html: string, outFile: string) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle" });
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
  });
  await page.waitForTimeout(800);
  await page.pdf({
    path: path.join(distDir, outFile),
    format: "A4",
    printBackground: true,
    margin: { top: "8mm", bottom: "10mm", left: "8mm", right: "8mm" },
  });
  await browser.close();
}

await renderPdf(wrapHtml("Korea Trip Handbook", handbookBody), "korea-trip-handbook.pdf");
await renderPdf(wrapHtml("Emergency Pack", emergencyBody), "emergency-pack.pdf");

console.log("PDF generation complete (publication quality fix):");
console.log(" - dist/korea-trip-handbook.pdf");
console.log(" - dist/emergency-pack.pdf");
