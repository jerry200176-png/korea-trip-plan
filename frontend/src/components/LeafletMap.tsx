"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useTripStore } from "@/store/useTripStore";

// 修復 Next.js SSR 中 Leaflet 載入預設 Icon 的問題
// https://github.com/PaulLeCam/react-leaflet/issues/453
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// 一個偵聽中心點改變的小元件，用來讓地圖跟著焦點移動 (非本次必選但增加體驗)
function MapFocus() {
  const items = useTripStore((state) => state.items);
  const map = useMap();
  
  useEffect(() => {
    if (items.length > 0 && items[0].location.lat && items[0].location.lng) {
        map.setView([items[0].location.lat, items[0].location.lng], 13);
    }
  }, [items, map]);
  return null;
}

export default function LeafletMap() {
  const items = useTripStore((state) => state.items);
  const defaultCenter: L.LatLngExpression = [25.0478, 121.5170]; // 台北車站預設

  return (
    <MapContainer 
      center={defaultCenter} 
      zoom={13} 
      scrollWheelZoom={true} 
      style={{ height: "100%", width: "100%", zIndex: 0 }}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {items.map((item) => {
          if (!item.location.lat || !item.location.lng) return null;
          return (
            <Marker key={item.id} position={[item.location.lat, item.location.lng]}>
              <Popup>{item.location.name}</Popup>
            </Marker>
          )
      })}
      <MapFocus />
    </MapContainer>
  );
}
