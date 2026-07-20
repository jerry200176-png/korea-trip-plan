"use client";

import dynamic from "next/dynamic";

const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500">
      Loading OpenStreetMap...
    </div>
  ),
});

export default function MapArea() {
  return (
    <div className="w-full h-full">
      <LeafletMap />
    </div>
  );
}

