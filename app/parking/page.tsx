"use client";

import { useMemo, useState } from "react";
import { TopBar } from "@/components/ui/TopBar";
import { LocationBar } from "@/components/map/LocationBar";
import { MapCanvas, type MapMarker } from "@/components/map/MapCanvas";
import { ParkingCard } from "@/components/parking/ParkingCard";
import { SearchBar, Segmented } from "@/components/ui/Controls";
import { FilterBar, SortSelect } from "@/components/ui/FilterBar";
import { ListSkeleton } from "@/components/ui/Skeleton";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { useNearbyParking } from "@/lib/hooks/useNearby";
import { useLocationStore } from "@/lib/store/locationStore";
import type { ParkingFilters, ParkingSort } from "@/lib/services/parking";
import { formatDistance } from "@/lib/utils/geo";

export default function ParkingPage() {
  const location = useLocationStore((s) => s.location);
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"list" | "map">("list");
  const [sort, setSort] = useState<ParkingSort>("distance");
  const [coveredOnly, setCoveredOnly] = useState(false);
  const [evOnly, setEvOnly] = useState(false);
  const [securityOnly, setSecurityOnly] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [focus, setFocus] = useState<{ lat: number; lng: number } | null>(null);

  const filters = useMemo<ParkingFilters>(
    () => ({
      query: query || undefined,
      coveredOnly,
      evChargingOnly: evOnly,
      securityOnly,
      availableOnly,
    }),
    [query, coveredOnly, evOnly, securityOnly, availableOnly],
  );

  const { data, loading, error } = useNearbyParking(filters, sort);

  const markers = useMemo<MapMarker[]>(
    () => [
      { id: "me", location, kind: "user", emoji: "📍", title: "You are here" },
      ...data.map((p) => ({
        id: p.id,
        location: p.location,
        kind: "parking" as const,
        emoji: "🅿️",
        title: p.name,
        subtitle: `${formatDistance(p.distanceKm)} · ${p.availableSpaces} free`,
        onSelect: () => setFocus(p.location),
      })),
    ],
    [data, location],
  );

  return (
    <>
      <TopBar title="Paid parking" subtitle={`${data.length} spaces near you`} />

      <div className="space-y-3 px-4 py-3">
        <LocationBar />
        <SearchBar value={query} onChange={setQuery} placeholder="Search parking, mall or street" />

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
              id: "covered",
              label: "🏢 Covered",
              active: coveredOnly,
              onToggle: () => setCoveredOnly((v) => !v),
            },
            {
              id: "ev",
              label: "⚡ EV charging",
              active: evOnly,
              onToggle: () => setEvOnly((v) => !v),
            },
            {
              id: "security",
              label: "🛡️ Security",
              active: securityOnly,
              onToggle: () => setSecurityOnly((v) => !v),
            },
            {
              id: "free",
              label: "✅ Spaces free",
              active: availableOnly,
              onToggle: () => setAvailableOnly((v) => !v),
            },
          ]}
        />

        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-ink-500">
            {loading ? "Searching…" : `${data.length} spaces`}
          </span>
          <SortSelect
            value={sort}
            onChange={(v) => setSort(v as ParkingSort)}
            options={[
              { value: "distance", label: "Nearest first" },
              { value: "price", label: "Cheapest first" },
              { value: "availability", label: "Most available" },
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
              emoji="🅿️"
              title="No parking matches your filters"
              description="Try removing a filter or searching a different area."
            />
          ) : (
            data.map((p) => <ParkingCard key={p.id} space={p} />)
          )}
        </div>
      )}
    </>
  );
}