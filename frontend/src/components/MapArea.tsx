"use client";

import { useLoadScript, GoogleMap } from "@react-google-maps/api";
import { useMemo } from "react";

const libraries: ("places" | "geometry" | "drawing" | "visualization")[] = ["places"];

export default function MapArea() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "",
    libraries,
  });

  const center = useMemo(() => ({ lat: 25.0330, lng: 121.5654 }), []); // Default to Taipei 101

  if (loadError) return <div className="w-full h-full flex items-center justify-center bg-gray-100 text-red-500 p-4 text-center">Map Error: {loadError.message}</div>;
  if (!isLoaded) return <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500">Loading Map...</div>;

  return (
    <div className="w-full h-full">
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100%" }}
        center={center}
        zoom={13}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
        }}
      >
        {/* Markers will go here later */}
      </GoogleMap>
    </div>
  );
}
