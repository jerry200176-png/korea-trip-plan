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
.cover {
  min-height: 90vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 48pt;
  page-break-after: always;
}
.cover h1 { font-size: 28pt; margin: 0 0 12pt; }
.cover .lede { font-size: 13pt; color: var(--color-ink-muted); max-width: 32em; }
.toc { page-break-after: always; padding: 48pt; }
.toc h2 { margin-top: 0; }
.toc li { margin: 8pt 0; border-bottom: 1px solid var(--color-border); padding-bottom: 6pt; }
.day {
  padding: 40pt 48pt;
  page-break-before: always;
}
.day h1 { font-size: 20pt; color: var(--color-primary); }
.status {
  display: inline-block;
  font-size: 9pt;
  border: 1px solid var(--color-accent-warm);
  padding: 2pt 8pt;
  border-radius: 999px;
  color: var(--color-accent-warm);
}
.block {
  margin: 10pt 0;
  padding-left: 12pt;
  border-left: 2pt solid var(--color-primary);
}
.time { font-size: 10pt; color: var(--color-accent-warm); font-weight: 600; }
.footer {
  position: fixed;
  bottom: 24pt;
  left: 48pt;
  right: 48pt;
  font-size: 8pt;
  color: var(--color-ink-muted);
  text-align: center;
}
.emergency { padding: 48pt; page-break-after: always; }
.emergency h1 { color: #9b2c2c; }
.big { font-size: 18pt; font-family: var(--font-serif); }
`;

export function wrapHtml(title: string, body: string): string {
  return `<!DOCTYPE html><html lang="zh-Hant"><head><meta charset="utf-8"/><title>${title}</title><style>${pdfPrintCss}</style></head><body>${body}</body></html>`;
}
