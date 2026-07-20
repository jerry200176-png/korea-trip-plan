"use client";

import { useTripStore } from "@/store/useTripStore";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import SortableTimelineItem from "./SortableTimelineItem";

export default function Timeline() {
  const items = useTripStore((state) => state.items);
  const reorderItems = useTripStore((state) => state.reorderItems);

  const sensors = useSensors(
    useSensor(PointerSensor, { // Requires 8px movement before drag starts to allow buttons/scrolling
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      // Execute optimistic update on Zustand State
      reorderItems(active.id as string, over.id as string);
      console.log(`[DragEnd] Swapped ${active.id} with ${over.id}`);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 p-4">
      <div className="flex justify-between items-center mb-4 px-2">
        <h2 className="text-xl font-bold text-slate-800">行程時間軸</h2>
        <span className="text-sm font-medium text-slate-500 bg-slate-200 px-3 py-1 rounded-full">{items.length} 景點</span>
      </div>
      
      <div className="flex-1 overflow-y-auto pr-2 pb-10 custom-scrollbar">
        <div className="relative pl-6 border-l-[3px] border-slate-200 ml-4 space-y-2 h-full pb-10">
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={items.map(i => i.id)}
              strategy={verticalListSortingStrategy}
            >
              {items.map((item) => (
                <SortableTimelineItem key={item.id} item={item} />
              ))}
            </SortableContext>
          </DndContext>

          {items.length === 0 && (
             <div className="relative mt-8">
               <div className="absolute left-[6.5px] top-1 bg-slate-300 rounded-full w-4 h-4 border-4 border-white"></div>
               <div className="ml-8 border-2 border-dashed border-slate-300 rounded-xl p-4 flex items-center justify-center bg-slate-100/50 text-slate-400 h-28">
                 您的行程目前是空的
                 <br/>
                 請從待定沙盒加入景點！
               </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}

