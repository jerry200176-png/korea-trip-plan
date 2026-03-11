"use client";

import { useState } from "react";
import { usePlacesWidget } from "react-google-autocomplete";

export default function WishlistSandbox() {
  const [searchQuery, setSearchQuery] = useState("");

  const { ref: materialRef } = usePlacesWidget<HTMLInputElement>({
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY,
    onPlaceSelected: (place) => {
      if (place?.name) {
        setSearchQuery(place.name);
        // TODO: add place to Zustand store's wishlist
      }
    },
    options: {
      types: ["establishment", "geocode"],
    },
  });

  return (
    <div className="flex flex-col h-full bg-white p-4">
      <h2 className="text-xl font-bold mb-4">待定沙盒</h2>
      <div className="relative">
        <input 
          ref={materialRef}
          type="text" 
          placeholder="搜尋景點並加入沙盒..." 
          className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <div className="mt-6 flex-1 overflow-y-auto">
        <p className="text-gray-500 text-center mt-10">目前沙盒是空的。<br/>透過上方搜尋加入想去的地標吧！</p>
      </div>
    </div>
  );
}


