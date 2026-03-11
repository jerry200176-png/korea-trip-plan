# 🗺️ SyncTrip 旅遊協作平台 (MVP v1.0)

> **專為雙人或小型群組打造的「即時地圖與行程協作白板」。**
> 消除跨平台收集資訊的碎片化，以及通訊軟體上來回討論行程的溝通摩擦。

## ⚠️ 給 Antigravity Agent 的最高指導原則 (Agent Rules)

1. **嚴守 MVP 範圍：** 本專案目前處於 v1.0 (MVP) 階段。任何架構決策與程式碼生成，**絕對不得**超出 `docs/PRD_v1.md` 所定義的範圍。
2. **禁止過度工程：** - ❌ 不實作 IG/小紅書爬蟲。
   - ❌ 不實作多幣別公費拆帳系統。
   - ❌ 不實作自動交通時間計算與路線最佳化演算法。
3. **技術棧一致性：** 遵循下方 [Tech Stack](#-tech-stack) 定義的技術選型，前端狀態管理需嚴格處理「樂觀 UI 更新 (Optimistic UI Updates)」。

---

## 🚀 核心功能 (Core Features)

- **無縫邀請與共編：** 建立專屬旅程，透過連結一鍵邀請旅伴加入。
- **靈感沙盒 (Sandbox)：** 串接 Google Places API，在地圖上搜尋並釘選感興趣的景點，收納至待定清單。
- **即時時間軸 (Real-time Timeline)：** - 支援直覺的 Drag & Drop 拖曳排程。
  - 類似 Google Docs 的即時協作體驗（WebSocket / Realtime Database），確保雙方畫面零延遲同步。

---

## 🛠️ 技術棧 (Tech Stack)

### Frontend

- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS
- **State Management:** Zustand (負責處理拖曳狀態與樂觀更新)
- **Maps:** Google Maps API (Maps JavaScript API, Places API)

### Backend & Database

- **BaaS:** Supabase (提供快速的身份驗證與即時資料庫訂閱)
- **Database:** PostgreSQL + PostGIS (處理空間座標資料)
- **Realtime:** Supabase Realtime (處理多人協作狀態廣播)

---

## 📂 專案結構 (Directory Structure)

```text
├── docs/                # 專案規格文件 (PRD, API 規格等)
│   └── PRD_v1.md        # 核心產品需求文件 
├── .antigravity/        # AI Agent 技能與規範設定檔
│   └── skills/
├── src/
│   ├── app/             # Next.js App Router
│   ├── components/      # 共用 UI 元件 (地圖、抽屜、卡片)
│   ├── lib/             # 共用函式 (API fetcher, Supabase client)
│   └── store/           # Zustand 狀態管理
└── README.md
