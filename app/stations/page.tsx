"use client";

import { useMemo, useState } from "react";
import { TopBar } from "@/components/ui/TopBar";
import { LocationBar } from "@/components/map/LocationBar";
import { MapCanvas, type MapMarker } from "@/components/map/MapCanvas";
import { StationCard } from "@/components/stations/StationCard";
import { SearchBar, Segmented } from "@/components/ui/Controls";
import { FilterBar, SortSelect } from "@/components/ui/FilterBar";
import { ListSkeleton } from "@/components/ui/Skeleton";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { useNearbyStations } from "@/lib/hooks/useNearby";
import { useLocationStore } from "@/lib/store/locationStore";
import type { StationFilters, StationSort } from "@/lib/services/stations";
import type { ConnectorType } from "@/lib/types";
import { formatDistance } from "@/lib/utils/geo";

const CONNECTOR_TYPES: ConnectorType[] = ["CCS2", "Type2", "CHAdeMO", "GB/T"];

export default function StationsPage() {
  const location = useLocationStore((s) => s.location);
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"list" | "map">("list");
  const [sort, setSort] = useState<StationSort>("distance");
  const [connectorTypes, setConnectorTypes] = useState<ConnectorType[]>([]);
  const [fastOnly, setFastOnly] = useState(false);
  const [open24hOnly, setOpen24hOnly] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [focus, setFocus] = useState<{ lat: number; lng: number } | null>(null);

  const filters = useMemo<StationFilters>(
    () => ({
      query: query || undefined,
      connectorTypes: connectorTypes.length ? connectorTypes : undefined,
      minPowerKw: fastOnly ? 100 : undefined,
      open24hOnly,
      availableOnly,
    }),
    [query, connectorTypes, fastOnly, open24hOnly, availableOnly],
  );

  const { data, loading, error } = useNearbyStations(filters, sort);

  const markers = useMemo<MapMarker[]>(
    () => [
      { id: "me", location, kind: "user", emoji: "📍", title: "You are here" },
      ...data.map((s) => ({
        id: s.id,
        location: s.location,
        kind: "station" as const,
        emoji: "⚡",
        title: s.name,
        subtitle: `${formatDistance(s.distanceKm)} · ${s.operator}`,
        onSelect: () => setFocus(s.location),
      })),
    ],
    [data, location],
  );

  const toggleConnector = (type: ConnectorType) =>
    setConnectorTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );

  return (
    <>
      <TopBar title="Charging stations" subtitle={`${data.length} found near you`} />

      <div className="space-y-3 px-4 py-3">
        <LocationBar />
        <SearchBar value={query} onChange={setQuery} placeholder="Search station, operator or area" />

        <Segmented
          value={view}
          onChange={(v) => setView(v as "list" | "map")}
          options={[
            { value: "list", label: "List" },
            { value: "map", label: "Map" },
          ]}
        />

        <FilterBar
          chips={[
            {
              id: "fast",
              label: "⚡ Fast (100kW+)",
              active: fastOnly,
              onToggle: () => setFastOnly((v) => !v),
            },
            {
              id: "24h",
              label: "🕐 Open 24/7",
              active: open24hOnly,
              onToggle: () => setOpen24hOnly((v) => !v),
            },
            {
              id: "free",
              label: "✅ Available now",
              active: availableOnly,
              onToggle: () => setAvailableOnly((v) => !v),
            },
            ...CONNECTOR_TYPES.map((t) => ({
              id: t,
              label: t,
              active: connectorTypes.includes(t),
              onToggle: () => toggleConnector(t),
            })),
          ]}
        />

        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-ink-500">
            {loading ? "Searching…" : `${data.length} stations`}
          </span>
          <SortSelect
            value={sort}
            onChange={(v) => setSort(v as StationSort)}
            options={[
              { value: "distance", label: "Nearest first" },
              { value: "price", label: "Cheapest first" },
              { value: "power", label: "Fastest first" },
              { value: "rating", label: "Top rated" },
            ]}
          />
        </div>
      </div>

      {view === "map" ? (
        <div className="h-[calc(100vh-19rem)] border-y border-ink-200">
          <MapCanvas center={location} markers={markers} zoom={12} focus={focus} className="h-full" />
        </div>
      ) : (
        <div className="space-y-3 px-4 pb-4">
          {loading ? (
            <ListSkeleton count={4} />
          ) : error ? (
            <ErrorState description={error} />
          ) : data.length === 0 ? (
            <EmptyState
              emoji="⚡"
              title="No stations match your filters"
              description="Try removing a filter or searching a different area."
            />
          ) : (
            data.map((s) => <StationCard key={s.id} station={s} />)
          )}
        </div>
      )}
    </>
  );
}