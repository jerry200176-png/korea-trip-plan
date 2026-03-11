import { create } from "zustand";

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
  duration?: number;
  orderIndex: number;
}

interface TripState {
  items: ItineraryItem[];
  wishlist: Location[];
  isEditingId: string | null;

  // Actions
  setEditingId: (id: string | null) => void;
  
  // 1. 本地樂觀更新 (Optimistic UI Update)
  optimisticMoveItem: (itemId: string, newTime: Date) => void;
  
  // 2. 實際發送 API (背景同步與 rollback)
  syncItemToServer: (itemId: string, newTime: Date) => Promise<void>;
  
  // 3. 接收 Socket.io 的更新事件
  receiveWebSocketUpdate: (payload: { type: string, item: ItineraryItem }) => void;
}

export const useTripStore = create<TripState>((set, get) => ({
  items: [],
  wishlist: [],
  isEditingId: null,

  setEditingId: (id) => set({ isEditingId: id }),

  // 1. 本地瞬間變更 UI
  optimisticMoveItem: (itemId, newTime) => {
    set((state) => {
      const newItems = state.items.map(item => 
        item.id === itemId ? { ...item, scheduledTime: newTime } : item
      );
      // Ensure we sort by time or orderIndex visually if needed
      return { items: newItems };
    });
  },

  // 2. 打 API 到 Node.js Backend 進行寫入 (若失敗 rollback)
  syncItemToServer: async (itemId, newTime) => {
    // 建立還原點備份
    const previousItems = get().items;
    
    try {
      // 模擬 fetch API (待實際串接)
      const res = await fetch(`/api/trips/items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduledTime: newTime }),
      });
      
      if (!res.ok) throw new Error("Sync failed");
      
    } catch (error) {
      console.error("Optimistic UI failed, rolling back:", error);
      // Step 3 (Rollback on Error)
      set({ items: previousItems });
      // TODO: Trigger Toast Notification "同步失敗，這筆資料已還原"
      alert("同步失敗，這筆資料已還原");
    }
  },

  // 3. Socket.io Listener
  receiveWebSocketUpdate: (payload) => {
    const { isEditingId } = get();
    // 避免其他人的廣播覆蓋了自己正在拖曳的項目
    if (payload.item.id === isEditingId) return;

    set((state) => {
      // 依照 payload 類別進行更新
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
