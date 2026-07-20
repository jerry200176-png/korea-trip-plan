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
body {
  margin: 0;
  font-family: var(--font-sans);
  font-size: 11pt;
  line-height: 1.45;
  color: var(--color-ink);
  background: var(--color-canvas);
}
h1, h2, h3 { font-family: var(--font-serif); font-weight: 600; line-height: 1.2; }
.eyebrow { font-size: 9pt; letter-spacing: 0.08em; text-transform: uppercase; color: var(--color-ink-muted); }
.page { padding: 36pt 42pt; page-break-after: always; }
.page:last-child { page-break-after: auto; }
.cover {
  min-height: 90vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 0;
  page-break-after: always;
  position: relative;
  overflow: hidden;
  background: var(--color-canvas);
}
.cover-media {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 62%;
  object-fit: cover;
  object-position: center;
}
.cover-body {
  position: relative;
  margin-top: auto;
  padding: 36pt 42pt 48pt;
  background: linear-gradient(180deg, transparent, var(--color-canvas) 28%);
}
.cover h1 { font-size: 26pt; margin: 0 0 10pt; }
.cover .lede { font-size: 12pt; color: var(--color-ink-muted); max-width: 28em; }
.toc h2, .intro h2 { margin-top: 0; }
.toc li { margin: 7pt 0; border-bottom: 1px solid var(--color-border); padding-bottom: 5pt; }
.divider {
  min-height: 85vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  page-break-after: always;
  position: relative;
  overflow: hidden;
}
.divider img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.divider-body {
  position: relative;
  padding: 36pt 42pt 48pt;
  background: linear-gradient(180deg, transparent, rgba(247,244,237,0.96) 40%);
}
.divider.seoul .divider-body h1 { color: var(--color-seoul); }
.divider.busan .divider-body h1 { color: var(--color-busan); }
.divider.ktx .divider-body h1 { color: var(--color-accent-warm); }
.day h1 { font-size: 18pt; color: var(--color-primary); margin: 4pt 0 8pt; }
.day-media {
  width: 100%;
  max-height: 180pt;
  object-fit: cover;
  border-radius: 4pt;
  margin: 8pt 0 12pt;
}
.caption {
  font-size: 8.5pt;
  color: var(--color-ink-muted);
  margin: -6pt 0 12pt;
}
.status {
  display: inline-block;
  font-size: 9pt;
  border: 1px solid var(--color-accent-warm);
  padding: 2pt 8pt;
  border-radius: 999px;
  color: var(--color-accent-warm);
}
.block {
  margin: 8pt 0;
  padding-left: 10pt;
  border-left: 2pt solid var(--color-primary);
}
.time { font-size: 9.5pt; color: var(--color-accent-warm); font-weight: 600; }
.icon-strip { display: flex; flex-wrap: wrap; gap: 12pt; margin-top: 12pt; }
.icon-item { width: 28%; text-align: center; font-size: 9pt; }
.icon-item img { width: 36pt; height: 36pt; }
.media-frame img {
  width: 100%;
  max-height: 220pt;
  object-fit: cover;
  border-radius: 4pt;
}
.credits li { margin: 6pt 0; font-size: 9.5pt; }
.muted { color: var(--color-ink-muted); }
.route-line {
  margin: 16pt 0;
  padding: 14pt;
  border: 1px solid var(--color-border);
  border-radius: 6pt;
  background: var(--color-surface);
}
.route-line strong { color: var(--color-primary); }
.emergency { padding: 42pt; }
.emergency h1 { color: #9b2c2c; }
.big { font-size: 18pt; font-family: var(--font-serif); }
.footer-note {
  font-size: 8pt;
  color: var(--color-ink-muted);
  margin-top: 24pt;
  text-align: center;
}
`;

export function wrapHtml(title: string, body: string): string {
  return `<!DOCTYPE html><html lang="zh-Hant"><head><meta charset="utf-8"/><title>${title}</title><style>${pdfPrintCss}</style></head><body>${body}</body></html>`;
}

export function fileUrl(absPath: string): string {
  return `file://${absPath}`;
}
