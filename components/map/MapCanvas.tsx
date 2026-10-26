"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/Skeleton";
import type { MapMarker } from "@/components/map/MapView";
import type { GeoPoint } from "@/lib/types";

/**
 * Leaflet touches `window` at import time, so the map must never be
 * server-rendered. This wrapper is the only thing pages should import.
 */
const MapView = dynamic(() => import("@/components/map/MapView"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full rounded-none" />,
});

export interface MapCanvasProps {
  center: GeoPoint;
  markers: MapMarker[];
  zoom?: number;
  className?: string;
  focus?: GeoPoint | null;
  interactive?: boolean;
}

export function MapCanvas(props: MapCanvasProps) {
  return <MapView {...props} />;
}

export type { MapMarker };