import Link from "next/link";
import { Badge, Dot } from "@/components/ui/Badge";
import type { Connector, ConnectorStatus } from "@/lib/types";
import { formatNaira } from "@/lib/utils/currency";
import { cn } from "@/lib/utils/misc";

const STATUS_TONE: Record<ConnectorStatus, "success" | "warning" | "danger"> = {
  available: "success",
  occupied: "warning",
  offline: "danger",
};

const STATUS_LABEL: Record<ConnectorStatus, string> = {
  available: "Available",
  occupied: "In use",
  offline: "Offline",
};

export function ConnectorRow({ connector }: { connector: Connector }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-ink-100 py-3 last:border-0">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-ink-900">{connector.type}</span>
          <Badge tone="neutral">{connector.powerKw} kW</Badge>
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-xs text-ink-500">
          <Dot tone={STATUS_TONE[connector.status]} />
          <span>{STATUS_LABEL[connector.status]}</span>
          <span aria-hidden>·</span>
          <span>
            {connector.available}/{connector.slots} free
          </span>
        </div>
      </div>

      <div className="shrink-0 text-right">
        <p className="text-sm font-bold text-ink-900">{formatNaira(connector.pricePerKwh)}</p>
        <p className="text-[11px] text-ink-400">per kWh</p>
      </div>
    </div>
  );
}

export function PriceTag({
  price,
  unit,
  className,
}: {
  price: number;
  unit: string;
  className?: string;
}) {
  return (
    <div className={cn("text-right", className)}>
      <p className="text-base font-bold text-ink-900">{formatNaira(price)}</p>
      <p className="text-[11px] text-ink-400">{unit}</p>
    </div>
  );
}

export function AmenityChips({ amenities, max = 3 }: { amenities: string[]; max?: number }) {
  const shown = amenities.slice(0, max);
  const rest = amenities.length - shown.length;

  return (
    <div className="flex flex-wrap gap-1.5">
      {shown.map((a) => (
        <span key={a} className="rounded-md bg-ink-100 px-2 py-0.5 text-[11px] font-medium text-ink-600">
          {a}
        </span>
      ))}
      {rest > 0 && (
        <span className="rounded-md bg-ink-100 px-2 py-0.5 text-[11px] font-medium text-ink-500">
          +{rest} more
        </span>
      )}
    </div>
  );
}

export function RatingPill({ rating, count }: { rating: number; count?: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-ink-700">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="#f59e0b" aria-hidden>
        <path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1L12 2Z" />
      </svg>
      {rating.toFixed(1)}
      {count !== undefined && <span className="font-normal text-ink-400">({count})</span>}
    </span>
  );
}

export function StationLink({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <Link href={`/stations/${id}`} className="block">
      {children}
    </Link>
  );
}