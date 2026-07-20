# Skill: Database Schema & Supabase Configuration

## 🎯 核心目標

確保所有資料庫 Schema 設計符合 MVP 範圍，並針對「即時協作」與「地理空間查詢」進行最佳化。本專案使用 Supabase 作為 Backend as a Service。

## ⚠️ 嚴格規範 (Strict Rules)

1. **命名慣例：** - Table 名稱使用 snake_case 且為複數 (e.g., `trips`, `itinerary_items`)。
   - 欄位名稱使用 snake_case。
   - Primary Key 統一命名為 `id`，型別設定為 `uuid`，並預設 `gen_random_uuid()`。

2. **Supabase 專屬設定：**
   - **RLS (Row Level Security)：** 所有建立的 Table 都「必須」強制開啟 RLS。Agent 必須同時生成對應的 Policy，確保只有 `trip_members` 裡的 user 可以讀寫該 trip 的資料。
   - **Realtime：** 必須針對 `itinerary_items` 和 `locations` (沙盒) 這兩張表開啟 Supabase Realtime 廣播功能 (Replica Identity Full)，以支援前端的即時協作。

3. **MVP Schema 核心關聯 (Entity Relationship)：**
   Agent 在設計 Table 時，必須包含且僅限於以下核心結構：
   - `profiles`: 延伸自 Supabase Auth 的 auth.users，儲存使用者名稱與頭像。
   - `trips`: 旅程主表 (包含 title, start_date, end_date)。
   - `trip_members`: 處理多對多關係 (trip_id, user_id, role)。
   - `locations`: 沙盒與地標庫 (包含 google_place_id, name, latitude, longitude, address)。
   - `itinerary_items`: 行程明細 (包含 trip_id, location_id, scheduled_time, duration_minutes, order_index)。

4. **禁止事項：**
   - 絕對不要建立任何與「記帳、花費 (expenses)」、「匯率」相關的 Table。
   - 絕對不要建立「社群貼文爬蟲」相關的暫存 Table。
