"use client";

import { useState, useEffect } from "react";

interface NominatimResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
}

export default function WishlistSandbox() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 1. Debounce Logic: 800ms delay
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 800);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchQuery]);

  // 2. Fetch from OSM Nominatim API
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }

    const fetchPlaces = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(debouncedQuery)}&limit=5`, {
          headers: {
            "Accept-Language": "zh-TW,zh;q=0.9,en;q=0.8",
          }
        });
        if (!res.ok) throw new Error("Search API failed");
        
        const data: NominatimResult[] = await res.json();
        setResults(data);
      } catch (error) {
        console.error("OSM Search Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaces();
  }, [debouncedQuery]);

  const handleSelectPlace = (place: NominatimResult) => {
    setSearchQuery(place.display_name);
    setResults([]);
    // TODO: add place to Zustand store's wishlist
    console.log("Selected Place:", place);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 p-4">
      <h2 className="text-xl font-bold mb-4 text-slate-800">待定沙盒</h2>
      <div className="relative">
        <input 
          type="text" 
          placeholder="搜尋景點 (OpenStreetMap) 並加入沙盒..." 
          className="w-full p-3 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-700"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        
        {/* Loading Indicator */}
        {isLoading && (
          <div className="absolute right-3 top-3.5 w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        )}

        {/* Dropdown Results */}
        {results.length > 0 && (
          <ul className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
            {results.map((place) => (
              <li 
                key={place.place_id} 
                className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0 text-sm text-slate-700 line-clamp-2"
                onClick={() => handleSelectPlace(place)}
              >
                {place.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>
      
      <div className="mt-6 flex-1 overflow-y-auto">
        <p className="text-slate-400 text-center mt-10">目前沙盒是空的。<br/>透過上方搜尋加入想去的地標吧！</p>
      </div>
    </div>
  );
}



