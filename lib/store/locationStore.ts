"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GeoPoint } from "@/lib/types";
import { DEFAULT_LOCATION } from "@/lib/utils/geo";

export type LocationSource = "gps" | "manual" | "fallback";

interface LocationState {
  location: GeoPoint;
  label: string;
  source: LocationSource;
  permission: "unknown" | "granted" | "denied";
  setLocation: (location: GeoPoint, label: string, source: LocationSource) => void;
  setPermission: (permission: LocationState["permission"]) => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      location: DEFAULT_LOCATION,
      label: "Lagos Island",
      source: "fallback",
      permission: "unknown",
      setLocation: (location, label, source) => set({ location, label, source }),
      setPermission: (permission) => set({ permission }),
    }),
    {
      name: "evnaija-location",
      partialize: (state) => ({
        location: state.location,
        label: state.label,
        source: state.source,
      }),
    },
  ),
);