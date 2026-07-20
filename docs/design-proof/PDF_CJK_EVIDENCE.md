# PDF CJK / font evidence

Generated with Playwright Chromium `page.pdf()` from HTML using Google Fonts:

- Noto Serif TC
- Noto Sans TC
- Noto Sans KR

Binary checks (`npm run verify:pdf`):

- `%PDF` header
- `/Font` markers present
- `ToUnicode` cmap entries present (handbook ≈ 60, emergency ≈ 24) — required for extractable CJK

Visual checks (`docs/design-proof/pdf-*.png`):

- Cover renders Traditional Chinese title + route nights
- Emergency page renders「緊急協助」and Korean「도와주세요」
