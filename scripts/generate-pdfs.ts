import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { chromium } from "playwright";
import { distDir, root } from "./lib/root.ts";
import { wrapHtml, fileUrl } from "./lib/pdf-html.ts";

fs.mkdirSync(distDir, { recursive: true });

function load<T>(file: string): T {
  return yaml.load(fs.readFileSync(path.join(root, "data", file), "utf8")) as T;
}

const trip = load<any>("trip.yaml");
const itinerary = load<{ days: any[] }>("itinerary.yaml");
const places = load<{ places: any[] }>("places.yaml").places;
const emergency = load<any>("emergency-public.yaml");
const decisions = load<{ decisions: any[] }>("founder-decisions.yaml").decisions;
const mediaDoc = load<{ media: any[] }>("media.yaml");
const placeMap = Object.fromEntries(places.map((p) => [p.id, p]));
const mediaById = Object.fromEntries(mediaDoc.media.map((m) => [m.id, m]));

function mediaSrc(id: string): string {
  const m = mediaById[id];
  if (!m?.pdf_path || !m.license) {
    throw new Error(`PDF media ${id} missing pdf_path or license`);
  }
  return fileUrl(path.join(root, m.pdf_path));
}

function caption(id: string): string {
  const m = mediaById[id];
  return `${m.alt_zh} · ${m.attribution}`;
}

function dayHtml(day: any, mediaId?: string): string {
  const blocks = day.blocks
    .map((b: any) => {
      const place = b.place_id ? placeMap[b.place_id] : null;
      const placeLine = place
        ? `<p><strong>${place.name_zh}</strong> · <span lang="ko">${place.name_ko}</span></p>`
        : "";
      return `<div class="block"><div class="time">${b.start} – ${b.end}</div><strong>${b.title}</strong><p class="muted">${b.kind}</p>${placeLine}${b.plan_b ? `<p><strong>備案：</strong>${b.plan_b}</p>` : ""}</div>`;
    })
    .join("\n");
  const media = mediaId
    ? `<img class="day-media" src="${mediaSrc(mediaId)}" alt="${mediaById[mediaId].alt_zh}"/><p class="caption">${caption(mediaId)}</p>`
    : "";
  return `<section class="page day"><p class="eyebrow">Day ${day.day_index} · ${day.city}</p><h1>${day.theme}</h1><p><strong>今天最重要：</strong>${day.one_priority}</p><p><span class="status">暫定</span></p>${media}${blocks}<p><strong>雨天：</strong>${day.rain_plan}</p></section>`;
}

const days = [...itinerary.days].sort((a, b) => a.day_index - b.day_index);
const seoulDays = days.filter((d) => d.city === "Seoul");
const transitDays = days.filter((d) => d.city === "Transit");
const busanDays = days.filter((d) => d.city === "Busan");
const openDecisions = decisions.filter((d) => d.status === "DecisionRequired" || d.status === "Provisional").slice(0, 3);

const dayMedia: Record<number, string | undefined> = {
  2: "seoul-palace-gate",
  6: "busan-haeundae",
};

const experienceIcons = ["icon-hanbok", "icon-palace", "icon-beach", "icon-food", "icon-shop", "icon-fortune"]
  .map((id) => {
    const m = mediaById[id];
    const src = fileUrl(path.join(root, m.local_path));
    return `<div class="icon-item"><img src="${src}" alt="${m.alt_zh}"/><div>${m.alt_zh.replace("圖示", "")}</div></div>`;
  })
  .join("");

const creditsItems = mediaDoc.media
  .filter((m) => m.status === "Approved" && (m.type === "photo" || m.type === "generated_illustration"))
  .map((m) => {
    const kind = m.type === "generated_illustration" ? "AI 原創插畫" : "照片";
    return `<li><strong>${m.id}</strong> · ${kind}<br/>${m.attribution}<br/><span class="muted">${m.source_url}</span><br/>License: ${m.license}</li>`;
  })
  .join("");

const handbookBody = `
<div class="cover">
  <img class="cover-media" src="${mediaSrc("cover-hero")}" alt="${mediaById["cover-hero"].alt_zh}"/>
  <div class="cover-body">
    <p class="eyebrow">Our First Korea</p>
    <h1>${trip.title}</h1>
    <p class="lede">${trip.success_criterion}</p>
    <p>首爾四晚 · 釜山兩晚 · ${trip.target_month ?? "日期待決"}</p>
    <p class="caption">${caption("cover-hero")}</p>
  </div>
</div>

<section class="page intro">
  <p class="eyebrow">Intro</p>
  <h2>我們想留下的回憶</h2>
  <p>這是我們第一次一起出國。不是把行程填滿，而是留下會想再翻開的畫面：韓服與宮殿、KTX 窗外、釜山海邊、一起決定要買什麼、一起吃什麼。</p>
  <p>目前方案：<strong>Seoul 4N + Busan 2N</strong>。目標月份：${trip.target_month ?? "待確認"}。日期與訂房仍待一起決定。</p>
  <div class="route-line">
    <strong>TPE → ICN</strong> · 首爾四晚 · <strong>KTX</strong> · 釜山兩晚 · <strong>PUS → TPE</strong>
  </div>
  <p class="muted">這本旅行書是 Couple Preview，不是訂票憑證。</p>
</section>

<section class="page">
  <p class="eyebrow">Route</p>
  <h2>路線一覽</h2>
  <ol>
    ${days.map((d) => `<li><strong>Day ${d.day_index}</strong> · ${d.theme} <span class="muted">（${d.city}）</span></li>`).join("")}
  </ol>
  <p>成功標準：${trip.success_criterion}</p>
</section>

<div class="divider seoul">
  <img src="${mediaSrc("seoul-chapter")}" alt="${mediaById["seoul-chapter"].alt_zh}"/>
  <div class="divider-body">
    <p class="eyebrow">Chapter</p>
    <h1>首爾 · Seoul</h1>
    <p>四晚慢慢走：韓服、宮殿、購物、算命與城市節奏。</p>
    <p class="caption">${caption("seoul-chapter")}</p>
  </div>
</div>

<section class="page">
  <h2>首爾主視覺</h2>
  <div class="media-frame"><img src="${mediaSrc("seoul-palace-roof")}" alt="${mediaById["seoul-palace-roof"].alt_zh}"/></div>
  <p class="caption">${caption("seoul-palace-roof")}</p>
  <p>真實宮殿屋頂質感，提醒我們 Day 2 想留下的合照氣氛——之後用我們自己的照片替換。</p>
</section>

${seoulDays.map((d) => dayHtml(d, dayMedia[d.day_index])).join("\n")}

<div class="divider ktx">
  <img src="${mediaSrc("ktx-transition")}" alt="${mediaById["ktx-transition"].alt_zh}"/>
  <div class="divider-body">
    <p class="eyebrow">Transit</p>
    <h1>首爾 → 釜山 · KTX</h1>
    <p>移動日以行李與體力為先，車窗風景留給兩個人。</p>
    <p class="caption">${caption("ktx-transition")}</p>
  </div>
</div>

${transitDays.map((d) => dayHtml(d)).join("\n")}

<div class="divider busan">
  <img src="${mediaSrc("busan-chapter")}" alt="${mediaById["busan-chapter"].alt_zh}"/>
  <div class="divider-body">
    <p class="eyebrow">Chapter</p>
    <h1>釜山 · Busan</h1>
    <p>兩晚海邊收尾：海雲台、橋的節奏、慢慢走路。</p>
    <p class="caption">${caption("busan-chapter")}</p>
  </div>
</div>

<section class="page">
  <h2>釜山主視覺</h2>
  <div class="media-frame"><img src="${mediaSrc("busan-haeundae")}" alt="${mediaById["busan-haeundae"].alt_zh}"/></div>
  <p class="caption">${caption("busan-haeundae")}</p>
  <div class="media-frame" style="margin-top:14pt"><img src="${mediaSrc("busan-gwangan")}" alt="${mediaById["busan-gwangan"].alt_zh}"/></div>
  <p class="caption">${caption("busan-gwangan")}</p>
</section>

${busanDays.map((d) => dayHtml(d, dayMedia[d.day_index])).join("\n")}

<section class="page">
  <p class="eyebrow">Experiences</p>
  <h2>最期待的體驗</h2>
  <div class="icon-strip">${experienceIcons}</div>
  <h3 style="margin-top:22pt">美食</h3>
  <div class="media-frame"><img src="${mediaSrc("seoul-street-food")}" alt="${mediaById["seoul-street-food"].alt_zh}"/></div>
  <p class="caption">${caption("seoul-street-food")}</p>
  <h3>購物</h3>
  <div class="media-frame"><img src="${mediaSrc("shopping-atmosphere")}" alt="${mediaById["shopping-atmosphere"].alt_zh}"/></div>
  <p class="caption">${caption("shopping-atmosphere")}</p>
</section>

<section class="page">
  <p class="eyebrow">Together</p>
  <h2>一起決定</h2>
  <ul>
    ${openDecisions.map((d) => `<li><strong>${d.title_zh}</strong> · ${d.status === "DecisionRequired" ? "待一起決定" : "暫定"}</li>`).join("")}
  </ul>
  <p class="muted">完整選項見網站「決策」頁。本頁只提醒我們還要一起談的事。</p>
</section>

<section class="page">
  <p class="eyebrow">Before departure</p>
  <h2>出發前</h2>
  <ul>
    <li>護照效期、K-ETA／入境規定出發前再查官網</li>
    <li>住宿確認後填入緊急卡地址</li>
    <li>出發前下載離線版 PDF 存入手機</li>
    <li>保險與私人電話僅離線保存</li>
    <li>無酒精、避免甲殼海鮮偏好隨身記得</li>
  </ul>
  <p class="footer-note">我們的韓國 · Couple Preview Media Edition · 非訂票憑證</p>
</section>

<section class="page">
  <p class="eyebrow">Credits</p>
  <h2>Image credits</h2>
  <p class="muted">正文不插入 attribution；完整出處如下。AI 插畫不作為景點證據。</p>
  <ol class="credits">${creditsItems}</ol>
</section>
`;

const emergencyBody = `
<section class="emergency">
  <p class="eyebrow">緊急卡</p>
  <h1>緊急協助</h1>
  <p class="big">${emergency.korea.police} 警察 · ${emergency.korea.fire_ambulance} 消防／醫療</p>
  <p><a href="${emergency.korea.mission_url}">${emergency.korea.mission_name}</a></p>
  <p>${emergency.korea.mission_phone_note}</p>
  <h2>住宿地址</h2>
  <p>首爾：${emergency.lodging_placeholders.seoul_address_ko}</p>
  <p>釜山：${emergency.lodging_placeholders.busan_address_ko}</p>
  <h2>保險</h2>
  <p>保險公司：${emergency.insurance.provider}</p>
  <p>緊急電話：${emergency.insurance.emergency_phone}</p>
  <p class="muted">${emergency.insurance.note}</p>
  <h2>韓文短句</h2>
  <p lang="ko">${emergency.phrases_ko.no_alcohol}</p>
  <p lang="ko">${emergency.phrases_ko.no_crustaceans}</p>
  <p lang="ko">${emergency.phrases_ko.help}</p>
  <p lang="ko">${emergency.phrases_ko.ambulance}</p>
  <p lang="ko">${emergency.phrases_ko.taxi_address}</p>
  <p class="muted">${emergency.offline_note}</p>
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
    margin: { top: "10mm", bottom: "14mm", left: "10mm", right: "10mm" },
  });
  await browser.close();
}

await renderPdf(wrapHtml("Korea Trip Handbook", handbookBody), "korea-trip-handbook.pdf");
await renderPdf(wrapHtml("Emergency Pack", emergencyBody), "emergency-pack.pdf");

console.log("PDF generation complete (Couple Preview Media Edition):");
console.log(" - dist/korea-trip-handbook.pdf");
console.log(" - dist/emergency-pack.pdf");
