"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useState } from "react";
import L from "leaflet";
import { fetchLocationData } from "../../utils/LocationFetcher";

interface MapProps {
  onLocationSelect: (postcode: string, suburb: string, state: string) => void;
}

const customIcon = new L.Icon({
  iconUrl: "/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const MapComponent: React.FC<MapProps> = ({ onLocationSelect }) => {
  const [position, setPosition] = useState<[number, number] | null>(null);

  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);

      // Use the extracted fetchLocationData function
      const data = await fetchLocationData(lat, lng);

      // Extract relevant address components
      const address = data.display_name || "Unknown location";
      const addressParts = address.split(",");
      const postcode = addressParts[addressParts.length - 2]?.trim() || "";
      const state = addressParts[addressParts.length - 3]?.trim() || "";
      const suburb = addressParts[addressParts.length - 4]?.trim() || "";
      // Pass extracted values to parent component
      onLocationSelect(postcode, suburb, state);
    },
  });

  return position ? <Marker position={position} icon={customIcon} /> : null;
};

const Map = ({ onLocationSelect }: MapProps) => {
  return (
    <MapContainer center={[-33.8688, 151.2093]} zoom={12} style={{ height: "300px", width: "100%" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <MapComponent onLocationSelect={onLocationSelect} data-testid="map" />
    </MapContainer>
  );
};

export default Map;
