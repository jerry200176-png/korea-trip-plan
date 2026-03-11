"use client";

import { useState, useRef } from "react";
import { Autocomplete, useLoadScript } from "@react-google-maps/api";

const libraries: ("places" | "geometry" | "drawing" | "visualization")[] = ["places"];

export default function WishlistSandbox() {
  const [searchQuery, setSearchQuery] = useState("");
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "",
    libraries,
  });

  const onLoad = (autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete;
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current !== null) {
      const place = autocompleteRef.current.getPlace();
      if (place.name) {
        setSearchQuery(place.name);
        // TODO: add place to Zustand store's wishlist
      }
    } else {
      console.log("Autocomplete is not loaded yet!");
    }
  };

  return (
    <div className="flex flex-col h-full bg-white p-4">
      <h2 className="text-xl font-bold mb-4">待定沙盒</h2>
      <div className="relative">
        {isLoaded ? (
          <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
            <input 
              type="text" 
              placeholder="搜尋景點並加入沙盒..." 
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Autocomplete>
        ) : (
          <input 
            type="text" 
            placeholder="載入搜尋中..." 
            disabled
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm bg-gray-50"
          />
        )}
      </div>
      
      <div className="mt-6 flex-1 overflow-y-auto">
        <p className="text-gray-500 text-center mt-10">目前沙盒是空的。<br/>透過上方搜尋加入想去的地標吧！</p>
      </div>
    </div>
  );
}

