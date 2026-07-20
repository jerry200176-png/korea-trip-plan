import { create } from "zustand";
import { arrayMove } from "@dnd-kit/sortable";

export interface Location {
  id: string;
  name: string;
  placeId?: string;
  lat?: number;
  lng?: number;
  address?: string;
}

export interface ItineraryItem {
  id: string;
  tripId: string;
  locationId: string;
  location: Location;
  scheduledTime?: Date;
  duration?: number; // 分鐘
  orderIndex: number;
}

interface TripState {
  items: ItineraryItem[];
  wishlist: Location[];
  isEditingId: string | null;

  // Actions
  setEditingId: (id: string | null) => void;
  
  // 1. 本地樂觀更新 (Optimistic UI Update) - for Dnd-Kit ordering
  reorderItems: (activeId: string, overId: string) => void;
  
  // 2. 實際發送 API (背景同步與 rollback)
  syncItemToServer: (activeId: string, overId: string) => Promise<void>;
  
  // 3. 接收 Socket.io 的更新事件
  receiveWebSocketUpdate: (payload: { type: string, item: ItineraryItem }) => void;
}

// --- Mock Data ---
const mockItems: ItineraryItem[] = [
  {
    id: "item-1", tripId: "trip-1", locationId: "loc-1", orderIndex: 0,
    location: { id: "loc-1", name: "台北車站" },
    scheduledTime: new Date(new Date().setHours(9, 0, 0, 0)), duration: 30
  },
  {
    id: "item-2", tripId: "trip-1", locationId: "loc-2", orderIndex: 1,
    location: { id: "loc-2", name: "鼎泰豐 信義店" },
    scheduledTime: new Date(new Date().setHours(12, 0, 0, 0)), duration: 90
  },
  {
    id: "item-3", tripId: "trip-1", locationId: "loc-3", orderIndex: 2,
    location: { id: "loc-3", name: "台北 101 觀景台" },
    scheduledTime: new Date(new Date().setHours(14, 0, 0, 0)), duration: 120
  }
];

export const useTripStore = create<TripState>((set, get) => ({
  items: mockItems,
  wishlist: [],
  isEditingId: null,

  setEditingId: (id) => set({ isEditingId: id }),

  // 1. 本地瞬間變更 UI (Drag & Drop Reorder)
  reorderItems: (activeId, overId) => {
    set((state) => {
      const oldIndex = state.items.findIndex((item) => item.id === activeId);
      const newIndex = state.items.findIndex((item) => item.id === overId);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        // 使用 @dnd-kit/sortable 提供的 arrayMove 進行安全互換
        const newItems = arrayMove(state.items, oldIndex, newIndex);
        console.log(`[Optimistic Reorder] Moved item ${activeId} from index ${oldIndex} to ${newIndex}`);
        return { items: newItems };
      }
      return state;
    });
  },

  // 2. 打 API 到 Node.js Backend 進行寫入 (若失敗 rollback)
  syncItemToServer: async (activeId, _overId) => {
    // 建立還原點備份
    const previousItems = get().items;
    
    try {
      console.log(`[Background Sync] Sending reorder event for ${activeId} to API... (Mock)`);
      // 模擬 fetch API
      // const res = await fetch(`/api/trips/items/reorder`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ activeId, overId }),
      // });
      // if (!res.ok) throw new Error("Sync failed");
      
    } catch (error) {
      console.error("Optimistic UI failed, rolling back:", error);
      // Step 3 (Rollback on Error)
      set({ items: previousItems });
      alert("同步失敗，這筆資料已還原");
    }
  },

  // 3. Socket.io Listener
  receiveWebSocketUpdate: (payload) => {
    const { isEditingId } = get();
    // 避免其他人的廣播覆蓋了自己正在拖曳的項目
    if (payload.item.id === isEditingId) return;

    set((state) => {
      if (payload.type === "UPDATE") {
        return {
          items: state.items.map(i => i.id === payload.item.id ? payload.item : i)
        };
      } else if (payload.type === "INSERT") {
        return {
          items: [...state.items, payload.item]
        };
      } else if (payload.type === "DELETE") {
        return {
          items: state.items.filter(i => i.id !== payload.item.id)
        };
      }
      return state;
    });
  }
}));

