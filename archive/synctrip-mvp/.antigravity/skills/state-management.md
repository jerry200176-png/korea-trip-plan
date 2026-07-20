# Skill: Frontend State Management (Zustand) & Optimistic UI

## 🎯 核心目標

本專案的行程時間軸需要極度流暢的 Drag & Drop 體驗。前端狀態管理統一使用 `Zustand`，並嚴格執行「樂觀 UI 更新」策略來處理 Supabase 的非同步操作。

## ⚠️ 嚴格規範 (Strict Rules)

1. **狀態管理工具限定：**
   - 僅允許使用 `Zustand` 建立 Global Store (例如 `useTripStore`)。
   - 禁止引入 Redux 或 Context API 來處理高頻率的拖曳狀態。

2. **樂觀 UI 更新模式 (Optimistic UI Pattern) 必備流程：**
   當實作任何拖曳 (Drag & Drop) 或修改行程時間的行為時，Agent 生成的程式碼必須遵守以下三步驟：
   - **Step 1 (UI First):** 攔截使用者的拖曳動作，立刻在 Zustand store 中更新本地端資料，讓 UI 瞬間變化。不要等待 API 回應。
   - **Step 2 (Background Sync):** 在背景呼叫 Supabase API 進行 `UPDATE` 或 `INSERT`。
   - **Step 3 (Rollback on Error):** 如果 Supabase API 回傳錯誤，必須捕捉該錯誤 (Catch)，並將 Zustand store 裡的狀態「回滾 (Rollback)」到 Step 1 之前的狀態，同時觸發 Toast 提示使用者「同步失敗」。

3. **Supabase Realtime 監聽處理：**
   - 必須在元件掛載 (Mount) 時，透過 Supabase Client 訂閱 `itinerary_items` 的 `INSERT`, `UPDATE`, `DELETE` 事件。
   - 當收到 WebSocket 廣播事件時，必須比對 payload 的資料與本地 Zustand store 的資料。若是由「其他協作者」觸發的變更，則更新 Zustand store 以同步畫面。
   - **防衝突機制：** 如果當下本地使用者正在拖曳/編輯該項目 (isEditing 狀態為 true)，請忽略接收到的遠端更新，避免畫面跳動。

4. **UI 反饋：**
   - 執行非同步操作時，不需要鎖死整個畫面 (No full-screen loaders)，應使用微小的狀態指示器 (如卡片角落的 loading spinner 或 saving text)。
