"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import WishlistSandbox from "./Tabs/WishlistSandbox";
import Timeline from "./Tabs/Timeline";
import { GripHorizontal } from "lucide-react";

export default function BottomSheet() {
  const [activeTab, setActiveTab] = useState<"sandbox" | "timeline">("sandbox");

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.05}
      className="absolute bottom-0 w-full h-[60%] bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] flex flex-col pt-2 pb-6 z-10"
    >
      {/* Drag Handle */}
      <div className="w-full flex justify-center pb-2 cursor-grab active:cursor-grabbing">
        <GripHorizontal className="text-gray-300" />
      </div>

      {/* Tabs Header */}
      <div className="flex border-b border-gray-100 px-4">
        <button
          onClick={() => setActiveTab("sandbox")}
          className={`flex-1 py-3 text-center font-semibold transition-colors ${
            activeTab === "sandbox" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-400"
          }`}
        >
          待定沙盒
        </button>
        <button
          onClick={() => setActiveTab("timeline")}
          className={`flex-1 py-3 text-center font-semibold transition-colors ${
            activeTab === "timeline" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-400"
          }`}
        >
          時間軸
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {activeTab === "sandbox" ? (
            <motion.div
              key="sandbox"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <WishlistSandbox />
            </motion.div>
          ) : (
            <motion.div
              key="timeline"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <Timeline />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
