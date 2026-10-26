"use client";

import { useState } from "react";
import { useLocationStore } from "@/lib/store/locationStore";
import { useGeolocation } from "@/lib/hooks/useGeolocation";
import { LocationPicker } from "@/components/map/LocationPicker";

/** Compact location bar shown at the top of discovery screens. */
export function LocationBar() {
  const { label, source } = useLocationStore();
  const { loading, request } = useGeolocation();
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setPickerOpen(true)}
        className="flex w-full items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-left shadow-sm"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" strokeLinejoin="round" />
            <circle cx="12" cy="10" r="2.5" />
          </svg>
        </span>

        <span className="min-w-0 flex-1">
          <span className="block text-[11px] font-medium uppercase tracking-wide text-ink-400">
            {source === "gps" ? "Using your location" : "Showing"}
          </span>
          <span className="block truncate text-sm font-semibold text-ink-900">{label}</span>
        </span>

        <span
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            request();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.stopPropagation();
              request();
            }
          }}
          className="shrink-0 rounded-lg px-2 py-1 text-xs font-semibold text-brand-600 hover:bg-brand-50"
        >
          {loading ? "Locating…" : "Recentre"}
        </span>
      </button>

      <LocationPicker open={pickerOpen} onClose={() => setPickerOpen(false)} />
    </>
  );
}