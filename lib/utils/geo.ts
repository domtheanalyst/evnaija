import type { GeoPoint } from "@/lib/types";

const EARTH_RADIUS_KM = 6371;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Great-circle distance between two points, in kilometres. */
export function haversineKm(a: GeoPoint, b: GeoPoint): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

/** Human-friendly distance label, e.g. "450 m" or "3.2 km". */
export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

/** Rough driving-time estimate assuming 24 km/h average city speed. */
export function estimateDriveMins(km: number): number {
  return Math.max(1, Math.round((km / 24) * 60));
}

export function isWithinBounds(
  point: GeoPoint,
  bounds: { north: number; south: number; east: number; west: number },
): boolean {
  return (
    point.lat <= bounds.north &&
    point.lat >= bounds.south &&
    point.lng <= bounds.east &&
    point.lng >= bounds.west
  );
}

/** Lagos Island — used as the fallback when geolocation is denied. */
export const DEFAULT_LOCATION: GeoPoint = { lat: 6.455, lng: 3.3841 };

export const NIGERIAN_CITIES: { name: string; state: string; location: GeoPoint }[] = [
  { name: "Lagos Island", state: "Lagos", location: { lat: 6.455, lng: 3.3841 } },
  { name: "Lekki", state: "Lagos", location: { lat: 6.4478, lng: 3.4723 } },
  { name: "Ikeja", state: "Lagos", location: { lat: 6.6018, lng: 3.3515 } },
  { name: "Yaba", state: "Lagos", location: { lat: 6.5095, lng: 3.3711 } },
  { name: "Abuja", state: "FCT", location: { lat: 9.0765, lng: 7.3986 } },
  { name: "Port Harcourt", state: "Rivers", location: { lat: 4.8156, lng: 7.0498 } },
];