/** Shared print styles aligned with site/src/styles/tokens.css */
export const pdfPrintCss = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;600&family=Noto+Sans+TC:wght@400;600&family=Noto+Serif+TC:wght@600&display=swap');
:root {
  --color-canvas: #f7f4ed;
  --color-surface: #fffdf8;
  --color-ink: #1c2420;
  --color-ink-muted: #5a635c;
  --color-border: #ddd4c4;
  --color-primary: #2d6a4f;
  --color-accent-warm: #c96d3b;
  --color-seoul: #4a6fa5;
  --color-busan: #4a7c7c;
  --font-serif: "Noto Serif TC", Georgia, serif;
  --font-sans: "Noto Sans TC", "Noto Sans KR", sans-serif;
}
* { box-sizing: border-box; }
html, body {
  margin: 0;
  font-family: var(--font-sans);
  font-size: 10.5pt;
  line-height: 1.4;
  color: var(--color-ink);
  background: var(--color-canvas);
  orphans: 3;
  widows: 3;
}
h1, h2, h3 { font-family: var(--font-serif); font-weight: 600; line-height: 1.2; break-after: avoid; page-break-after: avoid; }
.eyebrow { font-size: 8.5pt; letter-spacing: 0.06em; color: var(--color-ink-muted); margin: 0 0 4pt; break-after: avoid; page-break-after: avoid; }
.page {
  padding: 26pt 32pt;
  break-before: page;
  page-break-before: always;
  break-after: auto;
  page-break-after: auto;
}
.page:first-child,
.cover {
  break-before: auto;
  page-break-before: auto;
}
.page.compact { padding-top: 24pt; padding-bottom: 24pt; }
.cover {
  box-sizing: border-box;
  width: 100%;
  height: 250mm;
  display: block;
  padding: 0;
  break-after: page;
  page-break-after: always;
  break-before: auto;
  page-break-before: auto;
  position: relative;
  overflow: hidden;
  background: var(--color-canvas);
}
.cover-media {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 68%;
  object-fit: cover;
  object-position: center;
}
.cover-body {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 28pt 34pt 36pt;
  background: linear-gradient(180deg, transparent, var(--color-canvas) 28%);
}
.cover h1 { font-size: 24pt; margin: 0 0 8pt; }
.cover .lede { font-size: 11pt; color: var(--color-ink-muted); max-width: 30em; margin: 0 0 8pt; }
.cover .meta { margin: 0; font-size: 10.5pt; }
.intro h2, .toc h2 { margin-top: 0; }
.toc-list { list-style: none; padding: 0; margin: 8pt 0 0; }
.toc-list li {
  display: flex;
  justify-content: space-between;
  gap: 10pt;
  margin: 5pt 0;
  border-bottom: 1px dotted var(--color-border);
  padding-bottom: 4pt;
  break-inside: avoid;
  page-break-inside: avoid;
}
.toc-title { flex: 1; }
.toc-page { font-variant-numeric: tabular-nums; color: var(--color-ink-muted); min-width: 1.5em; text-align: right; }
/* Section identity is data-pdfsec + pdf-section-manifest.json — never visible PDFSEC text in final PDF. */
[data-pdfsec][hidden] { display: none !important; }
/* Draft-only markers: extractable for manifest; never included in final HTML. */
.sec-marker-draft {
  font-size: 6.5pt;
  line-height: 1;
  margin: 0 0 2pt;
  color: #cfc6b6;
  font-family: var(--font-sans);
}
.guide-page h2 { margin-top: 0; }
.divider {
  box-sizing: border-box;
  width: 100%;
  height: 250mm;
  display: block;
  break-before: page;
  page-break-before: always;
  break-after: page;
  page-break-after: always;
  position: relative;
  overflow: hidden;
  background: var(--color-canvas);
}
.divider img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 42%;
}
.divider.busan img { object-position: center 48%; }
.divider-body {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 28pt 34pt 36pt;
  background: linear-gradient(180deg, transparent, rgba(247,244,237,0.96) 38%);
}
.divider.seoul .divider-body h1 { color: var(--color-seoul); }
.divider.busan .divider-body h1 { color: var(--color-busan); }
.divider.ktx .divider-body h1 { color: var(--color-accent-warm); }
.day { break-inside: auto; }
.day-header { break-inside: avoid; page-break-inside: avoid; break-after: avoid; page-break-after: avoid; margin-bottom: 6pt; }
.day h1 { font-size: 16pt; color: var(--color-primary); margin: 2pt 0 6pt; }
.day-media {
  width: 100%;
  max-height: 110pt;
  object-fit: cover;
  object-position: center;
  border-radius: 3pt;
  margin: 4pt 0 6pt;
  break-inside: avoid;
  page-break-inside: avoid;
}
.caption {
  font-size: 8pt;
  color: var(--color-ink-muted);
  margin: -4pt 0 8pt;
  break-inside: avoid;
  page-break-inside: avoid;
}
.status {
  display: inline-block;
  font-size: 8.5pt;
  border: 1px solid var(--color-accent-warm);
  padding: 1pt 7pt;
  border-radius: 999px;
  color: var(--color-accent-warm);
}
.block {
  margin: 5pt 0;
  padding: 4pt 0 4pt 9pt;
  border-left: 2pt solid var(--color-primary);
  break-inside: avoid;
  page-break-inside: avoid;
  orphans: 3;
  widows: 3;
}
.block p { margin: 2pt 0; }
.time { font-size: 9pt; color: var(--color-accent-warm); font-weight: 600; }
.meta-row { font-size: 9pt; color: var(--color-ink-muted); margin: 3pt 0; }
.editorial {
  margin: 8pt 0 0;
  padding: 8pt 10pt;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 4pt;
  break-inside: avoid;
  page-break-inside: avoid;
}
.editorial h3 { margin: 0 0 4pt; font-size: 11pt; color: var(--color-primary); }
.icon-strip { display: flex; flex-wrap: wrap; gap: 10pt; margin-top: 8pt; break-inside: avoid; page-break-inside: avoid; }
.icon-item { width: 28%; text-align: center; font-size: 8.5pt; break-inside: avoid; page-break-inside: avoid; }
.icon-item img { width: 32pt; height: 32pt; }
.media-frame { break-inside: avoid; page-break-inside: avoid; margin: 6pt 0; }
.media-frame img {
  width: 100%;
  max-height: 160pt;
  object-fit: cover;
  border-radius: 3pt;
}
.credits li { margin: 5pt 0; font-size: 9pt; break-inside: avoid; page-break-inside: avoid; }
.credits-page h2 { margin-bottom: 6pt; }
.dense-credits { margin: 8pt 0 0; padding-left: 1.2em; }
.dense-credits li {
  margin: 7pt 0;
  padding: 6pt 8pt;
  font-size: 9pt;
  line-height: 1.35;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 4pt;
  list-style-position: inside;
}
.muted { color: var(--color-ink-muted); }
.route-line {
  margin: 10pt 0;
  padding: 10pt 12pt;
  border: 1px solid var(--color-border);
  border-radius: 5pt;
  background: var(--color-surface);
  break-inside: avoid;
  page-break-inside: avoid;
}
.route-line strong { color: var(--color-primary); }
.keep { break-inside: avoid; page-break-inside: avoid; }
.stack- Tight > * + * { margin-top: 6pt; }
.footer-note {
  font-size: 8pt;
  color: var(--color-ink-muted);
  margin-top: 14pt;
  text-align: center;
}
.emergency { padding: 28pt 32pt; }
.emergency.compact-emergency { padding: 22pt 28pt 18pt; }
.emergency.compact-emergency h1 { font-size: 20pt; margin: 2pt 0 6pt; }
.emergency.compact-emergency h2 { font-size: 12pt; margin: 8pt 0 4pt; }
.emergency.compact-emergency p { margin: 2pt 0; font-size: 10pt; }
.emergency.compact-emergency .big { font-size: 14pt; margin: 4pt 0; }
.emergency.compact-emergency .eyebrow { margin-bottom: 2pt; }
.emergency h1 { color: #9b2c2c; }
.big { font-size: 16pt; font-family: var(--font-serif); }
ul.dense li, ol.dense li { margin: 4pt 0; break-inside: avoid; page-break-inside: avoid; }
`;

export function wrapHtml(title: string, body: string): string {
  return `<!DOCTYPE html><html lang="zh-Hant"><head><meta charset="utf-8"/><title>${title}</title><style>${pdfPrintCss}</style></head><body>${body}</body></html>`;
}

export function fileUrl(absPath: string): string {
  return `file://${absPath}`;
}
