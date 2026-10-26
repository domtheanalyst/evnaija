import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import type { Booking, BookingStatus } from "@/lib/types";
import { formatNaira } from "@/lib/utils/currency";
import { formatDateTime, formatDuration } from "@/lib/utils/time";

const STATUS_TONE: Record<BookingStatus, "success" | "warning" | "danger" | "neutral" | "info"> = {
  pending: "warning",
  confirmed: "success",
  active: "info",
  completed: "neutral",
  cancelled: "danger",
};

const STATUS_LABEL: Record<BookingStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  active: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function BookingCard({ booking }: { booking: Booking }) {
  return (
    <Link
      href={`/bookings/${booking.id}`}
      className="block rounded-2xl border border-ink-200 bg-white p-4 shadow-card"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-lg" aria-hidden>
              {booking.type === "charging" ? "⚡" : "🅿️"}
            </span>
            <h3 className="truncate text-sm font-semibold text-ink-900">{booking.resourceName}</h3>
          </div>
          <p className="mt-1 truncate text-xs text-ink-500">{booking.resourceAddress}</p>
        </div>
        <Badge tone={STATUS_TONE[booking.status]}>{STATUS_LABEL[booking.status]}</Badge>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-ink-100 pt-3 text-xs">
        <div>
          <p className="font-medium text-ink-700">{formatDateTime(booking.startTime)}</p>
          <p className="text-ink-400">{formatDuration(booking.durationMins)}</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-ink-900">{formatNaira(booking.amount)}</p>
          {booking.connectorLabel && <p className="text-ink-400">{booking.connectorLabel}</p>}
        </div>
      </div>
    </Link>
  );
}

export { STATUS_LABEL as BOOKING_STATUS_LABEL, STATUS_TONE as BOOKING_STATUS_TONE };