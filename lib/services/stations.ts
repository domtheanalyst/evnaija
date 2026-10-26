import { STATIONS } from "@/lib/data/stations";
import type { ChargingStation, ConnectorType, GeoPoint } from "@/lib/types";
import { haversineKm } from "@/lib/utils/geo";
import { sleep } from "@/lib/utils/misc";

export interface StationWithDistance extends ChargingStation {
  distanceKm: number;
}

export interface StationFilters {
  query?: string;
  connectorTypes?: ConnectorType[];
  minPowerKw?: number;
  maxPricePerKwh?: number;
  open24hOnly?: boolean;
  availableOnly?: boolean;
  city?: string;
}

export type StationSort = "distance" | "price" | "power" | "rating";

function matchesFilters(station: ChargingStation, filters: StationFilters): boolean {
  if (filters.query) {
    const q = filters.query.toLowerCase();
    const haystack = `${station.name} ${station.operator} ${station.address} ${station.city} ${station.state}`.toLowerCase();
    if (!haystack.includes(q)) return false;
  }

  if (filters.city && station.city !== filters.city) return false;

  if (filters.open24hOnly && !station.open24h) return false;

  if (filters.connectorTypes?.length) {
    const hasType = station.connectors.some((c) => filters.connectorTypes!.includes(c.type));
    if (!hasType) return false;
  }

  if (filters.minPowerKw) {
    const hasPower = station.connectors.some((c) => c.powerKw >= filters.minPowerKw!);
    if (!hasPower) return false;
  }

  if (filters.maxPricePerKwh) {
    const hasPrice = station.connectors.some((c) => c.pricePerKwh <= filters.maxPricePerKwh!);
    if (!hasPrice) return false;
  }

  if (filters.availableOnly) {
    const hasFree = station.connectors.some((c) => c.available > 0);
    if (!hasFree) return false;
  }

  return true;
}

function sortStations(list: StationWithDistance[], sort: StationSort): StationWithDistance[] {
  const sorted = [...list];
  switch (sort) {
    case "price":
      sorted.sort((a, b) => cheapestPrice(a) - cheapestPrice(b));
      break;
    case "power":
      sorted.sort((a, b) => maxPower(b) - maxPower(a));
      break;
    case "rating":
      sorted.sort((a, b) => b.rating - a.rating);
      break;
    case "distance":
    default:
      sorted.sort((a, b) => a.distanceKm - b.distanceKm);
  }
  return sorted;
}

export function cheapestPrice(station: ChargingStation): number {
  return Math.min(...station.connectors.map((c) => c.pricePerKwh));
}

export function maxPower(station: ChargingStation): number {
  return Math.max(...station.connectors.map((c) => c.powerKw));
}

export function totalAvailable(station: ChargingStation): number {
  return station.connectors.reduce((sum, c) => sum + c.available, 0);
}

/** All stations with distance from `origin`, filtered and sorted. */
export async function listStations(
  origin: GeoPoint,
  filters: StationFilters = {},
  sort: StationSort = "distance",
): Promise<StationWithDistance[]> {
  await sleep(350);

  const withDistance: StationWithDistance[] = STATIONS.filter((s) =>
    matchesFilters(s, filters),
  ).map((s) => ({ ...s, distanceKm: haversineKm(origin, s.location) }));

  return sortStations(withDistance, sort);
}

export async function getStation(id: string, origin?: GeoPoint): Promise<StationWithDistance | null> {
  await sleep(250);
  const station = STATIONS.find((s) => s.id === id);
  if (!station) return null;
  return {
    ...station,
    distanceKm: origin ? haversineKm(origin, station.location) : 0,
  };
}

/** Distinct cities present in the dataset, for filter chips. */
export function listStationCities(): string[] {
  return Array.from(new Set(STATIONS.map((s) => s.city))).sort();
}

export function listConnectorTypes(): ConnectorType[] {
  const types = new Set<ConnectorType>();
  STATIONS.forEach((s) => s.connectors.forEach((c) => types.add(c.type)));
  return Array.from(types);
}