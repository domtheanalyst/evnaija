import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { RatingPill } from "@/components/stations/ConnectorRow";
import type { ParkingWithDistance } from "@/lib/services/parking";
import { formatNaira } from "@/lib/utils/currency";
import { estimateDriveMins, formatDistance } from "@/lib/utils/geo";

export function ParkingCard({ space }: { space: ParkingWithDistance }) {
  const occupancy = 1 - space.availableSpaces / space.totalSpaces;
  const tight = space.availableSpaces / space.totalSpaces < 0.15;

  return (
    <Link
      href={`/parking/${space.id}`}
      className="block rounded-2xl border border-ink-200 bg-white p-4 shadow-card transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-base font-semibold text-ink-900">{space.name}</h3>
            {space.covered && <Badge tone="info">Covered</Badge>}
          </div>
          <p className="mt-0.5 truncate text-sm text-ink-500">{space.address}</p>
          <div className="mt-1.5 flex items-center gap-2">
            <RatingPill rating={space.rating} count={space.reviewCount} />
            {space.hasEvCharging && <Badge tone="brand">EV charging</Badge>}
          </div>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-base font-bold text-ink-900">{formatNaira(space.pricePerHour)}</p>
          <p className="text-[11px] text-ink-400">per hour</p>
        </div>
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between text-xs">
          <span className={tight ? "font-semibold text-red-600" : "font-medium text-ink-600"}>
            {space.availableSpaces} of {space.totalSpaces} spaces free
          </span>
          <span className="text-ink-400">{Math.round(occupancy * 100)}% full</span>
        </div>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
          <div
            className={tight ? "h-full rounded-full bg-red-500" : "h-full rounded-full bg-brand-500"}
            style={{ width: `${Math.min(100, occupancy * 100)}%` }}
          />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-ink-100 pt-3 text-xs">
        <span className="font-semibold text-brand-700">{formatDistance(space.distanceKm)} away</span>
        <span className="text-ink-500">
          {formatNaira(space.pricePerDay)}/day · ~{estimateDriveMins(space.distanceKm)} min
        </span>
      </div>
    </Link>
  );
}