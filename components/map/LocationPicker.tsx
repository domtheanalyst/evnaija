"use client";

import { useState } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useLocationStore } from "@/lib/store/locationStore";
import { NIGERIAN_CITIES } from "@/lib/utils/geo";
import { cn } from "@/lib/utils/misc";

interface LocationPickerProps {
  open: boolean;
  onClose: () => void;
}

/** Lets the user override GPS with a known city or manual coordinates. */
export function LocationPicker({ open, onClose }: LocationPickerProps) {
  const { location, label, setLocation } = useLocationStore();
  const [lat, setLat] = useState(String(location.lat));
  const [lng, setLng] = useState(String(location.lng));

  const applyManual = () => {
    const parsedLat = Number(lat);
    const parsedLng = Number(lng);
    if (Number.isNaN(parsedLat) || Number.isNaN(parsedLng)) return;
    setLocation({ lat: parsedLat, lng: parsedLng }, "Custom location", "manual");
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title="Set your location">
      <p className="mb-3 text-sm text-ink-500">
        Currently showing <span className="font-semibold text-ink-800">{label}</span>. Pick a city or
        enter coordinates.
      </p>

      <div className="grid grid-cols-2 gap-2">
        {NIGERIAN_CITIES.map((city) => {
          const active = city.name === label;
          return (
            <button
              key={city.name}
              onClick={() => {
                setLocation(city.location, city.name, "manual");
                onClose();
              }}
              className={cn(
                "rounded-xl border px-3 py-2.5 text-left text-sm transition-colors",
                active
                  ? "border-brand-600 bg-brand-50 text-brand-700"
                  : "border-ink-200 bg-white text-ink-700 hover:border-ink-300",
              )}
            >
              <span className="block font-semibold">{city.name}</span>
              <span className="text-xs text-ink-400">{city.state}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-5 border-t border-ink-100 pt-4">
        <p className="mb-2 text-sm font-medium text-ink-700">Or enter coordinates</p>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Latitude" value={lat} onChange={(e) => setLat(e.target.value)} inputMode="decimal" />
          <Input label="Longitude" value={lng} onChange={(e) => setLng(e.target.value)} inputMode="decimal" />
        </div>
        <Button fullWidth className="mt-3" onClick={applyManual}>
          Use these coordinates
        </Button>
      </div>
    </Sheet>
  );
}