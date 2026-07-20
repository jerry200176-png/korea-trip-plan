import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import PDFDocument from "pdfkit";

const root = path.resolve(import.meta.dirname, "..");
const dist = path.join(root, "dist");
fs.mkdirSync(dist, { recursive: true });

function load<T>(file: string): T {
  return yaml.load(fs.readFileSync(path.join(root, "data", file), "utf8")) as T;
}

const trip = load<any>("trip.yaml");
const itinerary = load<{ days: any[] }>("itinerary.yaml");
const places = load<{ places: any[] }>("places.yaml").places;
const destinations = load<{ destinations: any[] }>("destinations.yaml").destinations;
const budget = load<any>("budget.yaml");
const sources = load<{ sources: any[] }>("sources.yaml").sources;

const placeMap = Object.fromEntries(places.map((p) => [p.id, p]));

function writePdf(
  filename: string,
  build: (doc: PDFKit.PDFDocument) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
      info: {
        Title: filename,
        Author: "Korea Trip Handbook",
      },
    });
    const stream = fs.createWriteStream(path.join(dist, filename));
    doc.pipe(stream);
    build(doc);
    doc.end();
    stream.on("finish", () => resolve());
    stream.on("error", reject);
  });
}

function addFooter(doc: PDFKit.PDFDocument) {
  const range = doc.bufferedPageRange();
  for (let i = 0; i < range.count; i++) {
    doc.switchToPage(range.start + i);
    doc
      .fontSize(8)
      .fillColor("#444")
      .text(
        `Korea Trip Handbook · page ${i + 1} of ${range.count} · status labels required`,
        50,
        doc.page.height - 40,
        { align: "center", width: doc.page.width - 100 }
      );
  }
}

await writePdf("korea-trip-handbook.pdf", (doc) => {
  doc.fontSize(22).fillColor("#111").text("Korea Trip Handbook", { align: "center" });
  doc.moveDown();
  doc.fontSize(12).text(trip.title, { align: "center" });
  doc.fontSize(10).fillColor("#333").text(`Route: ${trip.route_option} (${trip.route_status})`, {
    align: "center",
  });
  doc.text(`Dates: ${trip.target_month ?? "TBD"} (${trip.status})`, { align: "center" });
  doc.text("Success: " + trip.success_criterion, { align: "center" });
  doc.moveDown();
  doc.fontSize(11).fillColor("#111").text("Table of contents");
  doc.fontSize(10).fillColor("#222");
  doc.text("1. Overview");
  doc.text("2. Destinations");
  doc.text("3. Daily itinerary");
  doc.text("4. Budget placeholders");
  doc.text("5. Sources");
  doc.addPage();

  doc.fontSize(16).text("1. Overview");
  doc.fontSize(10).moveDown(0.5);
  doc.text(`Party size: ${trip.party_size}`);
  doc.text(`Daily window: ${trip.daily_out} – ${trip.daily_return}`);
  doc.text(
    `Preferences: no alcohol=${trip.preferences.no_alcohol}; avoid crustaceans=${trip.preferences.avoid_crustaceans}; spicy_ok=${trip.preferences.spicy_ok}; no jjimjilbang=${trip.preferences.no_jjimjilbang}; no rental car=${trip.preferences.no_rental_car}`
  );
  doc.moveDown();
  doc.text(
    "IMPORTANT: Cities/dates/flights are not Founder-locked. Content marked Provisional/Assumption must not be treated as booked."
  );

  doc.addPage();
  doc.fontSize(16).fillColor("#111").text("2. Destinations");
  doc.fontSize(10).moveDown(0.5);
  for (const d of destinations) {
    doc.text(
      `${d.name_zh} / ${d.name_ko} / ${d.name_en} — ${d.provisional_nights ?? "?"}N — ${d.status}`
    );
    doc.fillColor("#333").text(d.why);
    doc.fillColor("#111").moveDown(0.5);
  }

  for (const day of itinerary.days) {
    doc.addPage();
    doc.fontSize(16).text(`Day ${day.day_index}: ${day.theme}`);
    doc.fontSize(10).moveDown(0.3);
    doc.text(`Priority: ${day.one_priority}`);
    doc.text(
      `Out ${day.out_time} · Return ${day.return_by} · Energy ${day.energy} · Walk ${day.walking_level} · Status ${day.status}`
    );
    doc.text(`Areas: ${day.primary_areas.join(", ")}`);
    doc.text(`Rain: ${day.rain_plan}`);
    doc.text(`Low energy: ${day.low_energy_plan}`);
    doc.text(`Emergency return: ${day.emergency_return}`);
    doc.moveDown(0.5);
    for (const b of day.blocks) {
      const place = b.place_id ? placeMap[b.place_id] : null;
      doc.fillColor("#111").text(`${b.start}–${b.end} · ${b.title} [${b.kind}]`);
      if (place) {
        doc.fillColor("#333").text(`  ${place.name_zh} / ${place.name_ko}`);
        doc.text(`  Address: ${place.address}`);
        if (place.naver_map_url) {
          doc.fillColor("#0645AD").text(`  Naver: ${place.naver_map_url}`, {
            link: place.naver_map_url,
            underline: true,
          });
        }
      }
      if (b.map_url) {
        doc.fillColor("#0645AD").text(`  Map: ${b.map_url}`, {
          link: b.map_url,
          underline: true,
        });
      }
      if (b.plan_b) doc.fillColor("#333").text(`  Plan B: ${b.plan_b}`);
      if (b.droppable) doc.text("  (droppable)");
      doc.moveDown(0.3);
    }
  }

  doc.addPage();
  doc.fontSize(16).fillColor("#111").text("4. Budget placeholders");
  doc.fontSize(10).text(`Currency ${budget.currency} · status ${budget.status}`);
  doc.text(budget.notes);
  doc.moveDown(0.5);
  for (const c of budget.categories) {
    doc.text(
      `${c.name}: planned ${c.planned_twd} / spent ${c.spent_twd} (${c.status})`
    );
  }

  doc.addPage();
  doc.fontSize(16).text("5. Sources");
  doc.fontSize(9).moveDown(0.5);
  for (const s of sources) {
    doc.fillColor("#111").text(`${s.id} · ${s.name} · ${s.status} · checked ${s.checked_at}`);
    doc.fillColor("#0645AD").text(s.url, { link: s.url, underline: true });
    doc.moveDown(0.25);
  }

  addFooter(doc);
});

await writePdf("emergency-pack.pdf", (doc) => {
  doc.fontSize(20).text("Emergency Pack", { align: "center" });
  doc.fontSize(10).moveDown();
  doc.text("Offline essentials only. No secret booking codes in git.");
  doc.moveDown();

  doc.fontSize(14).text("Lodging (placeholders)");
  doc.fontSize(10).text("Seoul lodging Korean address: REPLACE_ME");
  doc.text("Busan lodging Korean address: REPLACE_ME");
  doc.moveDown();

  doc.fontSize(14).text("Airports & transit");
  doc.fontSize(10).text("Arrival airport: REPLACE_ME (see Open Decision D3)");
  doc.text("Departure airport: REPLACE_ME");
  doc.text("Airport official: https://www.airport.kr");
  doc.text("Korail: https://www.letskorail.com");
  doc.text("Naver Map: https://map.naver.com");
  doc.moveDown();

  doc.fontSize(14).text("Insurance");
  doc.fontSize(10).text("Provider: REPLACE_ME");
  doc.text("Emergency phone: REPLACE_ME (store offline)");
  doc.moveDown();

  doc.fontSize(14).text("Official help");
  doc.fontSize(10).text("Police 112 · Fire/Medical 119");
  doc.fillColor("#0645AD").text("Taipei Mission in Korea: https://www.roc-taiwan.org/kr", {
    link: "https://www.roc-taiwan.org/kr",
    underline: true,
  });
  doc.fillColor("#111").moveDown();

  doc.fontSize(14).text("Diet phrases");
  doc.fontSize(10).text("저희는 술을 마시지 않아요 (We do not drink alcohol)");
  doc.text("갑각류 해산은 빼 주실 수 있나요? (Please omit crustacean seafood)");
  doc.text("돼지국밥 하나 주세요 (One pork soup rice please)");
  doc.moveDown();

  doc.fontSize(14).text("Help phrases");
  doc.fontSize(10).text("도와주세요 (Please help)");
  doc.text("구급차를 불러 주세요 (Please call an ambulance)");
  doc.text("이 주소로 가 주세요 (Please go to this address)");
  doc.moveDown();

  doc.fontSize(14).text("Return to lodging");
  doc.fontSize(10).text("Show hotel address card to taxi driver. Prefer subway before last trains.");
  doc.moveDown();

  doc.fontSize(14).text("Flights / bookings");
  doc.fontSize(10).text("Outbound confirmation: REPLACE_ME");
  doc.text("Return confirmation: REPLACE_ME");
  doc.text("Never photograph QR tickets into this public-ready PDF source tree.");

  addFooter(doc);
});

console.log("PDF generation complete:");
console.log(" - dist/korea-trip-handbook.pdf");
console.log(" - dist/emergency-pack.pdf");
