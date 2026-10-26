import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { RatingPill } from "@/components/stations/ConnectorRow";
import type { StationWithDistance } from "@/lib/services/stations";
import { cheapestPrice, maxPower, totalAvailable } from "@/lib/services/stations";
import { formatNaira } from "@/lib/utils/currency";
import { estimateDriveMins, formatDistance } from "@/lib/utils/geo";

export function StationCard({ station }: { station: StationWithDistance }) {
  const available = totalAvailable(station);
  const hasFast = maxPower(station) >= 100;

  return (
    <Link
      href={`/stations/${station.id}`}
      className="block rounded-2xl border border-ink-200 bg-white p-4 shadow-card transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-base font-semibold text-ink-900">{station.name}</h3>
            {station.open24h && <Badge tone="brand">24/7</Badge>}
          </div>
          <p className="mt-0.5 truncate text-sm text-ink-500">{station.address}</p>
          <div className="mt-1.5 flex items-center gap-2">
            <RatingPill rating={station.rating} count={station.reviewCount} />
            <span className="text-xs text-ink-400" aria-hidden>
              ·
            </span>
            <span className="text-xs font-medium text-ink-600">{station.operator}</span>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-base font-bold text-ink-900">{formatNaira(cheapestPrice(station))}</p>
          <p className="text-[11px] text-ink-400">per kWh</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <Badge tone={available > 0 ? "success" : "danger"}>
          {available > 0 ? `${available} points free` : "All in use"}
        </Badge>
        {hasFast && <Badge tone="info">Fast charge</Badge>}
        {station.connectors.slice(0, 2).map((c) => (
          <Badge key={c.id} tone="neutral">
            {c.type} · {c.powerKw}kW
          </Badge>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-ink-100 pt-3 text-xs">
        <span className="font-semibold text-brand-700">
          {formatDistance(station.distanceKm)} away
        </span>
        <span className="text-ink-500">~{estimateDriveMins(station.distanceKm)} min drive</span>
      </div>
    </Link>
  );
}