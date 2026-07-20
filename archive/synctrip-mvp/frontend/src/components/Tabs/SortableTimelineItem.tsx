"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Clock } from "lucide-react";
import { ItineraryItem } from "@/store/useTripStore";
import { format } from "date-fns";

interface Props {
  item: ItineraryItem;
}

export default function SortableTimelineItem({ item }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
  };

  const startTimeStr = item.scheduledTime ? format(item.scheduledTime, 'h:mm a') : 'TBD';
  const durationStr = item.duration ? (item.duration / 60 >= 1 ? `${Math.floor(item.duration / 60)}h ${item.duration % 60}m` : `${item.duration}m`) : '';

  return (
    <div ref={setNodeRef} style={style} className={`relative pt-4 pb-2 ${isDragging ? "opacity-50" : ""}`}>
      {/* Timeline Line Connector */}
      <div className="absolute left-[8px] top-6 bg-blue-500 rounded-full w-4 h-4 border-4 border-white z-10 shadow-sm" />
      
      <div className={`ml-8 bg-white border ${isDragging ? 'border-blue-400 shadow-md' : 'border-gray-100'} rounded-2xl p-4 shadow-sm flex items-center gap-3 transition-colors`}>
        {/* Drag Handle */}
        <div 
          {...attributes} 
          {...listeners} 
          className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 p-2 -ml-2 rounded-lg hover:bg-gray-50 touch-none"
        >
          <GripVertical size={20} />
        </div>
        
        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center gap-2 text-xs font-medium text-blue-600 mb-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{startTimeStr} {durationStr ? `• ~${durationStr}` : ''}</span>
          </div>
          <h3 className="font-semibold text-gray-800 text-[15px]">{item.location.name}</h3>
        </div>
      </div>
    </div>
  );
}
