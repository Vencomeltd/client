import { useState } from "react";
import Accordion from "./Accordion";

// Offset coordinates by ~500m in a random direction to protect exact location
function approximateCoords(lat, lng) {
  const offsetLat = (Math.random() - 0.5) * 0.008;
  const offsetLng = (Math.random() - 0.5) * 0.008;
  return {
    lat: parseFloat((lat + offsetLat).toFixed(6)),
    lng: parseFloat((lng + offsetLng).toFixed(6)),
  };
}

export default function PropertyLocation({ data }) {
  const [showMap, setShowMap] = useState(false);
  const lat = data?.latitude ?? data?.lat;
  const lng = data?.longitude ?? data?.lng;
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!lat || !lng) return null;

  // Use approximate coordinates to protect exact address
  const { lat: approxLat, lng: approxLng } = approximateCoords(lat, lng);

  const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${approxLat},${approxLng}&zoom=13&size=800x500&scale=2&style=feature:poi|visibility:off&key=${apiKey}`;
  const embedUrl = `https://maps.google.com/maps?q=${approxLat},${approxLng}&z=13&output=embed`;

  return (
    <Accordion title="Where you'll be" openState={true}>
      <p style={{ fontSize: "13px", color: "#6B7280", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="#6B7280" strokeWidth="1.5"/><path d="M7 4V7L9 9" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round"/></svg>
        Exact address shared after booking is confirmed
      </p>
      {showMap ? (
        <iframe
          src={embedUrl}
          className="w-full h-[500px] rounded-lg border-0"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      ) : (
        <div
          className="relative w-full h-[500px] rounded-lg overflow-hidden cursor-pointer group"
          onClick={() => setShowMap(true)}
        >
          <img
            src={staticMapUrl}
            alt="Approximate property location"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-white text-gray-800 font-medium text-sm px-5 py-2.5 rounded-full shadow-lg">
              Click to interact
            </div>
          </div>
          {/* Approximate location badge */}
          <div style={{ position: "absolute", bottom: "16px", left: "16px", background: "rgba(255,255,255,0.95)", borderRadius: "8px", padding: "8px 12px", fontSize: "12px", color: "#374151", fontWeight: "600", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
            📍 Approximate location
          </div>
        </div>
      )}
    </Accordion>
  );
}
