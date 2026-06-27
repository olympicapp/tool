"use client";

import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Olympic Hotel — IJsbaanpad 12, 1076 CV Amsterdam (geocoded via OpenStreetMap)
const OLYMPIC_HOTEL: [number, number] = [52.3413347, 4.8531032];

export default function AmsterdamMap() {
  return (
    <MapContainer
      center={OLYMPIC_HOTEL}
      zoom={14}
      scrollWheelZoom={false}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>-bijdragers'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <CircleMarker
        center={OLYMPIC_HOTEL}
        radius={10}
        pathOptions={{
          color: "#ffffff",
          weight: 3,
          fillColor: "#06b6d4",
          fillOpacity: 1,
        }}
      >
        <Popup>
          <strong>Olympic Hotel</strong>
          <br />
          IJsbaanpad 12, Amsterdam
        </Popup>
      </CircleMarker>
    </MapContainer>
  );
}
