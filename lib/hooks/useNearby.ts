"use client";

import { useEffect, useState } from "react";
import { useLocationStore } from "@/lib/store/locationStore";
import {
  listStations,
  type StationFilters,
  type StationSort,
  type StationWithDistance,
} from "@/lib/services/stations";
import {
  listParking,
  type ParkingFilters,
  type ParkingSort,
  type ParkingWithDistance,
} from "@/lib/services/parking";

interface NearbyResult<T> {
  data: T[];
  loading: boolean;
  error: string | null;
}

/** Stations near the user's current location, re-fetched when filters change. */
export function useNearbyStations(
  filters: StationFilters = {},
  sort: StationSort = "distance",
): NearbyResult<StationWithDistance> {
  const location = useLocationStore((s) => s.location);
  const [data, setData] = useState<StationWithDistance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filterKey = JSON.stringify(filters);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    listStations(location, filters, sort)
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load charging stations.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.lat, location.lng, filterKey, sort]);

  return { data, loading, error };
}

/** Parking spaces near the user's current location. */
export function useNearbyParking(
  filters: ParkingFilters = {},
  sort: ParkingSort = "distance",
): NearbyResult<ParkingWithDistance> {
  const location = useLocationStore((s) => s.location);
  const [data, setData] = useState<ParkingWithDistance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filterKey = JSON.stringify(filters);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    listParking(location, filters, sort)
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load parking spaces.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.lat, location.lng, filterKey, sort]);

  return { data, loading, error };
}