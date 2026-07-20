# Media Policy — Couple Preview Media Edition

本文件定義旅行書／公開 Preview 的圖片治理。每一張進入網站或 PDF 的圖，都必須能在 `data/media.yaml` 逐張追溯。

## 目標

- 讓 Jerry 可以把手機網址與 PDF 傳給女友，有旅程期待感
- 來源可追溯、授權可解釋
- 不假裝有兩人合照；不生成真實人物長相
- 不把「網路圖片」當來源說明

## 來源優先順序

### A. User-owned photos

Jerry 與女友的私人照片。目前沒有，不得生成或假裝他們的長相。

### B. Unsplash / Pexels

可用於一般韓國景色與旅遊氣氛。

要求：

- 逐張記錄原始頁面與攝影者
- 優先無清楚人臉、商標與車牌
- 不 hotlink；下載後進入 repo-controlled `media/` pipeline
- 網站：WebP（JPEG fallback）
- PDF：列印用 JPEG（約 1800–2400px 寬）
- 即使 attribution 非強制，仍在 Credits 列出

### C. Openverse / Wikimedia Commons

第一版只允許：

- Public Domain / CC0
- CC BY

暫不使用 CC BY-SA、NC、ND 或 license 不清楚的圖片。

### D. Korea Tourism Organization（候選）

只建立候選清單。不自行建立帳號、不送申請、不下載需要授權的圖片。

若標示 KOGL：記錄 Type、可否商用、可否修改、attribution 格式；需 Jerry 手動申請時列為 Founder Action。

### E. 禁止直接使用

Google Images、Instagram、Pinterest、部落格、新聞媒體、旅行社圖片。

## AI-generated illustration

允許原創插畫（標記 `generated_illustration`），必須保存：

- prompt
- model / tool
- generation date

不得：

- 作為景點證據
- 模仿特定在世藝術家風格
- 生成 Jerry／女友的臉
- 生成 GOT7 成員、三眼怪或其他受保護角色
- 宣稱是真實照片

若環境無 image generation tool，改用原創 SVG route illustration，不得假裝已生成。

## 數量控制（第一版）

最多：

- Cover illustration：1
- Seoul chapter：1–2
- KTX transition：1
- Busan chapter：1–2
- Experience strip：最多 6 個簡潔 icon
- Food：1
- Shopping：1

總照片／大型插畫控制在 8–10 張。

每張必須能回答：改善哪個情緒／資訊問題、沒有它是否仍可理解、是否喧賓奪主、手機與 PDF 裁切是否正常。

## Media record 欄位

每個 media item 必須有：

`id`, `type`, `subject`, `usage_scope`, `local_path`, `source_url`, `source_platform`, `creator`, `license`, `attribution`, `downloaded_at`, `checked_at`, `modification_notes`, `alt_zh`, `alt_en`, `focal_point`, `status`

`type` ∈ `photo` | `generated_illustration` | `icon` | `map`

禁止把來源只寫成「網路圖片」。

## Pipeline

```text
media/original/     # 下載原檔或生成原檔
media/illustrations/
media/prompts/      # AI prompt 紀錄
media/web/          # WebP / JPEG for site
media/pdf/          # print-ready JPEG
media/icons/        # SVG icons
site/public/media/  # published copies for GitHub Pages
data/media.yaml     # catalog
scripts/check-media.ts
```

## Credits

網站與 PDF 皆有 Image Credits。Attribution 不插入正文干擾閱讀。

## CI

`npm run check:media` 驗證 schema、必填欄位、本機檔案存在、禁止含糊來源、PDF 不得引用無 license 的圖。
