"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocationStore } from "@/lib/store/locationStore";
import { DEFAULT_LOCATION } from "@/lib/utils/geo";

interface GeolocationState {
  loading: boolean;
  error: string | null;
  request: () => void;
}

/**
 * Requests the browser's location once on mount and writes it into the
 * location store. Falls back to Lagos Island when permission is denied.
 */
export function useGeolocation(): GeolocationState {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setLocation = useLocationStore((s) => s.setLocation);
  const setPermission = useLocationStore((s) => s.setPermission);

  const request = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setError("Geolocation is not supported on this device.");
      setPermission("denied");
      setLocation(DEFAULT_LOCATION, "Lagos Island", "fallback");
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setPermission("granted");
        setLocation({ lat: latitude, lng: longitude }, "Current location", "gps");
        setLoading(false);
      },
      (err) => {
        setPermission("denied");
        setError(
          err.code === err.PERMISSION_DENIED
            ? "Location permission denied. Showing Lagos Island instead."
            : "Could not determine your location. Showing Lagos Island instead.",
        );
        setLocation(DEFAULT_LOCATION, "Lagos Island", "fallback");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }, [setLocation, setPermission]);

  useEffect(() => {
    request();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { loading, error, request };
}