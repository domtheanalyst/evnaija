import { PARKING_SPACES } from "@/lib/data/parking";
import type { GeoPoint, ParkingSpace } from "@/lib/types";
import { haversineKm } from "@/lib/utils/geo";
import { sleep } from "@/lib/utils/misc";

export interface ParkingWithDistance extends ParkingSpace {
  distanceKm: number;
}

export interface ParkingFilters {
  query?: string;
  coveredOnly?: boolean;
  evChargingOnly?: boolean;
  securityOnly?: boolean;
  maxPricePerHour?: number;
  availableOnly?: boolean;
  city?: string;
}

export type ParkingSort = "distance" | "price" | "availability" | "rating";

function matchesFilters(space: ParkingSpace, filters: ParkingFilters): boolean {
  if (filters.query) {
    const q = filters.query.toLowerCase();
    const haystack = `${space.name} ${space.address} ${space.city} ${space.state}`.toLowerCase();
    if (!haystack.includes(q)) return false;
  }

  if (filters.city && space.city !== filters.city) return false;
  if (filters.coveredOnly && !space.covered) return false;
  if (filters.evChargingOnly && !space.hasEvCharging) return false;
  if (filters.securityOnly && !space.security) return false;
  if (filters.maxPricePerHour && space.pricePerHour > filters.maxPricePerHour) return false;
  if (filters.availableOnly && space.availableSpaces <= 0) return false;

  return true;
}

function sortSpaces(list: ParkingWithDistance[], sort: ParkingSort): ParkingWithDistance[] {
  const sorted = [...list];
  switch (sort) {
    case "price":
      sorted.sort((a, b) => a.pricePerHour - b.pricePerHour);
      break;
    case "availability":
      sorted.sort((a, b) => b.availableSpaces - a.availableSpaces);
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

export async function listParking(
  origin: GeoPoint,
  filters: ParkingFilters = {},
  sort: ParkingSort = "distance",
): Promise<ParkingWithDistance[]> {
  await sleep(350);

  const withDistance: ParkingWithDistance[] = PARKING_SPACES.filter((p) =>
    matchesFilters(p, filters),
  ).map((p) => ({ ...p, distanceKm: haversineKm(origin, p.location) }));

  return sortSpaces(withDistance, sort);
}

export async function getParking(id: string, origin?: GeoPoint): Promise<ParkingWithDistance | null> {
  await sleep(250);
  const space = PARKING_SPACES.find((p) => p.id === id);
  if (!space) return null;
  return {
    ...space,
    distanceKm: origin ? haversineKm(origin, space.location) : 0,
  };
}

export function listParkingCities(): string[] {
  return Array.from(new Set(PARKING_SPACES.map((p) => p.city))).sort();
}