"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { TopBar, BrandMark } from "@/components/ui/TopBar";
import { LocationBar } from "@/components/map/LocationBar";
import { MapCanvas, type MapMarker } from "@/components/map/MapCanvas";
import { StationCard } from "@/components/stations/StationCard";
import { ParkingCard } from "@/components/parking/ParkingCard";
import { ListSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Segmented } from "@/components/ui/Controls";
import { useNearbyStations, useNearbyParking } from "@/lib/hooks/useNearby";
import { useLocationStore } from "@/lib/store/locationStore";
import { useAuthStore } from "@/lib/store/authStore";
import { formatDistance } from "@/lib/utils/geo";

const QUICK_ACTIONS = [
  { href: "/stations", label: "Find charging", emoji: "⚡", tone: "bg-brand-50 text-brand-700" },
  { href: "/parking", label: "Book parking", emoji: "🅿️", tone: "bg-sky-50 text-sky-700" },
  { href: "/utilities", label: "Car utilities", emoji: "🧰", tone: "bg-amber-50 text-amber-700" },
  { href: "/emergency", label: "Emergency", emoji: "🚨", tone: "bg-red-50 text-red-700" },
];

export default function HomePage() {
  const location = useLocationStore((s) => s.location);
  const user = useAuthStore((s) => s.user);
  const [mode, setMode] = useState<"charging" | "parking">("charging");
  const [focus, setFocus] = useState<{ lat: number; lng: number } | null>(null);

  const stations = useNearbyStations({}, "distance");
  const parking = useNearbyParking({}, "distance");

  const loading = mode === "charging" ? stations.loading : parking.loading;
  const nearestStations = stations.data.slice(0, 4);
  const nearestParking = parking.data.slice(0, 4);
  const nearestCount = mode === "charging" ? nearestStations.length : nearestParking.length;

  const markers = useMemo<MapMarker[]>(() => {
    const list: MapMarker[] = [
      {
        id: "me",
        location,
        kind: "user",
        emoji: "📍",
        title: "You are here",
      },
    ];

    if (mode === "charging") {
      stations.data.forEach((s) => {
        list.push({
          id: s.id,
          location: s.location,
          kind: "station",
          emoji: "⚡",
          title: s.name,
          subtitle: `${formatDistance(s.distanceKm)} · ${s.operator}`,
          onSelect: () => setFocus(s.location),
        });
      });
    } else {
      parking.data.forEach((p) => {
        list.push({
          id: p.id,
          location: p.location,
          kind: "parking",
          emoji: "🅿️",
          title: p.name,
          subtitle: `${formatDistance(p.distanceKm)} · ${p.availableSpaces} free`,
          onSelect: () => setFocus(p.location),
        });
      });
    }

    return list;
  }, [mode, location, stations.data, parking.data]);

  return (
    <>
      <TopBar
        title=""
        right={
          <Link
            href="/profile"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-900 text-sm font-bold text-white"
          >
            {user ? user.name.charAt(0).toUpperCase() : "?"}
          </Link>
        }
      />

      <div className="-mt-14 px-4 pt-2">
        <div className="mb-3 flex items-center justify-between">
          <BrandMark />
        </div>

        <LocationBar />

        <div className="mt-3">
          <Segmented
            value={mode}
            onChange={(v) => setMode(v as "charging" | "parking")}
            options={[
              { value: "charging", label: "⚡ Charging" },
              { value: "parking", label: "🅿️ Parking" },
            ]}
          />
        </div>
      </div>

      <div className="mt-3 h-56 overflow-hidden border-y border-ink-200">
        <MapCanvas center={location} markers={markers} zoom={12} focus={focus} className="h-full" />
      </div>

      <div className="px-4 py-4">
        <div className="grid grid-cols-4 gap-2">
          {QUICK_ACTIONS.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="flex flex-col items-center gap-1.5 rounded-xl border border-ink-200 bg-white py-3 shadow-sm"
            >
              <span className={`flex h-9 w-9 items-center justify-center rounded-lg text-lg ${a.tone}`}>
                {a.emoji}
              </span>
              <span className="text-center text-[11px] font-medium leading-tight text-ink-700">
                {a.label}
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <h2 className="text-base font-bold text-ink-900">
            Nearest {mode === "charging" ? "chargers" : "parking"}
          </h2>
          <Link
            href={mode === "charging" ? "/stations" : "/parking"}
            className="text-sm font-semibold text-brand-600"
          >
            See all
          </Link>
        </div>

        <div className="mt-3 space-y-3">
          {loading ? (
            <ListSkeleton count={3} />
          ) : nearestCount === 0 ? (
            <EmptyState
              emoji={mode === "charging" ? "⚡" : "🅿️"}
              title={`No ${mode === "charging" ? "chargers" : "parking"} nearby`}
              description="Try changing your location or widening your search."
            />
          ) : mode === "charging" ? (
            nearestStations.map((s) => <StationCard key={s.id} station={s} />)
          ) : (
            nearestParking.map((p) => <ParkingCard key={p.id} space={p} />)
          )}
        </div>
      </div>
    </>
  );
}