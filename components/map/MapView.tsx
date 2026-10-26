"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { GeoPoint } from "@/lib/types";

export interface MapMarker {
  id: string;
  location: GeoPoint;
  kind: "station" | "parking" | "user" | "emergency";
  emoji: string;
  title: string;
  subtitle?: string;
  onSelect?: () => void;
}

interface MapViewProps {
  center: GeoPoint;
  markers: MapMarker[];
  zoom?: number;
  className?: string;
  /** When set, the map pans to this point whenever it changes. */
  focus?: GeoPoint | null;
  interactive?: boolean;
}

function pinIcon(kind: MapMarker["kind"], emoji: string): L.DivIcon {
  return L.divIcon({
    className: "",
    html: `<div class="marker-pin marker-pin--${kind}"><span>${emoji}</span></div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -32],
  });
}

/** Imperatively recentres the map when `focus` changes. */
function Recenter({ focus, zoom }: { focus: GeoPoint | null; zoom?: number }) {
  const map = useMap();

  useEffect(() => {
    if (focus) map.setView([focus.lat, focus.lng], zoom ?? map.getZoom(), { animate: true });
  }, [focus, map, zoom]);

  return null;
}

export default function MapView({
  center,
  markers,
  zoom = 13,
  className,
  focus,
  interactive = true,
}: MapViewProps) {
  const icons = useMemo(() => {
    const cache = new Map<string, L.DivIcon>();
    markers.forEach((m) => {
      const key = `${m.kind}:${m.emoji}`;
      if (!cache.has(key)) cache.set(key, pinIcon(m.kind, m.emoji));
    });
    return cache;
  }, [markers]);

  return (
    <div className={className}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={zoom}
        scrollWheelZoom={interactive}
        dragging={interactive}
        zoomControl={interactive}
        attributionControl
        className="h-full w-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          maxZoom={19}
        />

        {markers.map((m) => (
          <Marker
            key={m.id}
            position={[m.location.lat, m.location.lng]}
            icon={icons.get(`${m.kind}:${m.emoji}`)}
            eventHandlers={m.onSelect ? { click: m.onSelect } : undefined}
          >
            <Popup>
              <div className="min-w-[10rem]">
                <p className="text-sm font-semibold text-ink-900">{m.title}</p>
                {m.subtitle && <p className="mt-0.5 text-xs text-ink-500">{m.subtitle}</p>}
              </div>
            </Popup>
          </Marker>
        ))}

        <Recenter focus={focus ?? null} zoom={zoom} />
      </MapContainer>
    </div>
  );
}