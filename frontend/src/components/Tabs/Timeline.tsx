"use client";

import { Clock } from "lucide-react";

export default function Timeline() {
  return (
    <div className="flex flex-col h-full bg-white p-4">
      <h2 className="text-xl font-bold mb-4">行程時間軸</h2>
      
      <div className="flex-1 overflow-y-auto pr-2 pb-10">
        <div className="relative pl-6 border-l-2 border-gray-200 ml-4 space-y-6">
          
          {/* Mock Timeline Item */}
          <div className="relative">
            <div className="absolute -left-[35px] top-1 bg-blue-500 rounded-full w-4 h-4 border-4 border-white"></div>
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 shadow-sm">
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <Clock className="w-4 h-4 mr-1" />
                <span>10:00 AM - 12:00 PM</span>
              </div>
              <h3 className="font-semibold text-gray-800 text-lg">台北 101 觀景台</h3>
              <p className="text-gray-500 text-sm mt-1">停留約 120 分鐘</p>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-[35px] top-1 bg-gray-300 rounded-full w-4 h-4 border-4 border-white"></div>
            <div className="border border-dashed border-gray-300 rounded-xl p-4 flex items-center justify-center bg-gray-50 text-gray-400 h-24">
              拖曳景點卡片至此
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
