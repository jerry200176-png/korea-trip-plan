import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { chromium } from "playwright";
import { distDir, root } from "./lib/root.ts";
import { wrapHtml } from "./lib/pdf-html.ts";

fs.mkdirSync(distDir, { recursive: true });

function load<T>(file: string): T {
  return yaml.load(fs.readFileSync(path.join(root, "data", file), "utf8")) as T;
}

const trip = load<any>("trip.yaml");
const itinerary = load<{ days: any[] }>("itinerary.yaml");
const places = load<{ places: any[] }>("places.yaml").places;
const emergency = load<any>("emergency-public.yaml");
const placeMap = Object.fromEntries(places.map((p) => [p.id, p]));

function dayHtml(day: any): string {
  const blocks = day.blocks
    .map((b: any) => {
      const place = b.place_id ? placeMap[b.place_id] : null;
      const placeLine = place
        ? `<p><strong>${place.name_zh}</strong> · <span lang="ko">${place.name_ko}</span><br/><span class="muted">${place.address ?? ""}</span></p>`
        : "";
      return `<div class="block"><div class="time">${b.start} – ${b.end}</div><strong>${b.title}</strong> <span class="status">暫定</span><p>${b.kind}</p>${placeLine}${b.plan_b ? `<p><strong>Plan B：</strong>${b.plan_b}</p>` : ""}</div>`;
    })
    .join("\n");
  return `<section class="day"><p class="eyebrow">Day ${day.day_index}</p><h1>${day.theme}</h1><p><strong>今天最重要：</strong>${day.one_priority}</p><p class="status">狀態：暫定</p>${blocks}<p><strong>雨天：</strong>${day.rain_plan}</p></section>`;
}

const day2 = itinerary.days.find((d) => d.day_index === 2)!;
const day5 = itinerary.days.find((d) => d.day_index === 5)!;

const handbookBody = `
<div class="cover">
  <p class="eyebrow">Our First Korea</p>
  <h1>${trip.title}</h1>
  <p class="lede">${trip.success_criterion}</p>
  <p>首爾四晚 · 釜山兩晚 · ${trip.target_month ?? "日期待決"}</p>
  <p>路線 ${trip.route_option}（${trip.route_status}）</p>
</div>
<section class="toc">
  <h2>目錄</h2>
  <ol>
    <li>封面</li>
    <li>Day 2 — ${day2.theme}</li>
    <li>Day 5 — ${day5.theme}</li>
    <li>更多日程（完整版持續擴充）</li>
  </ol>
</section>
${dayHtml(day2)}
${dayHtml(day5)}
<div class="footer">我們的韓國 · 旅行書 · 非訂票憑證</div>
`;

const emergencyBody = `
<section class="emergency">
  <p class="eyebrow">Emergency</p>
  <h1>緊急協助</h1>
  <p class="big">${emergency.korea.police} 警察 · ${emergency.korea.fire_ambulance} 消防／醫療</p>
  <p><a href="${emergency.korea.mission_url}">${emergency.korea.mission_name}</a></p>
  <p>${emergency.korea.mission_phone_note}</p>
  <h2>住宿占位</h2>
  <p lang="ko">首爾：${emergency.lodging_placeholders.seoul_address_ko}</p>
  <p lang="ko">釜山：${emergency.lodging_placeholders.busan_address_ko}</p>
  <h2>韓文</h2>
  <p lang="ko">${emergency.phrases_ko.no_alcohol}</p>
  <p lang="ko">${emergency.phrases_ko.no_crustaceans}</p>
  <p lang="ko">${emergency.phrases_ko.help}</p>
  <p lang="ko">${emergency.phrases_ko.ambulance}</p>
  <p class="muted">${emergency.offline_note}</p>
</section>
`;

async function renderPdf(html: string, outFile: string) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle" });
  // Ensure webfonts applied for CJK embedding
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
  });
  await page.waitForTimeout(500);
  await page.pdf({
    path: path.join(distDir, outFile),
    format: "A4",
    printBackground: true,
    margin: { top: "12mm", bottom: "16mm", left: "14mm", right: "14mm" },
  });
  await browser.close();
}

await renderPdf(wrapHtml("Korea Trip Handbook", handbookBody), "korea-trip-handbook.pdf");
await renderPdf(wrapHtml("Emergency Pack", emergencyBody), "emergency-pack.pdf");

console.log("PDF generation complete (HTML print pipeline):");
console.log(" - dist/korea-trip-handbook.pdf");
console.log(" - dist/emergency-pack.pdf");
