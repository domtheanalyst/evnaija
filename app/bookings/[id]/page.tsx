"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { TopBar } from "@/components/ui/TopBar";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { MapCanvas } from "@/components/map/MapCanvas";
import { useToast } from "@/components/ui/Toast";
import { useCountdown } from "@/lib/hooks/useCountdown";
import { getBooking, cancelBooking, updateBookingStatus } from "@/lib/services/bookings";
import { BOOKING_STATUS_LABEL, BOOKING_STATUS_TONE } from "@/components/booking/BookingCard";
import { formatNaira } from "@/lib/utils/currency";
import { formatDateTime, formatDuration } from "@/lib/utils/time";
import type { Booking } from "@/lib/types";

export default function BookingDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const remaining = useCountdown(booking?.startTime ?? null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getBooking(params.id)
      .then((b) => !cancelled && setBooking(b))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  if (loading) {
    return (
      <>
        <TopBar title="Booking" back />
        <div className="space-y-3 p-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </>
    );
  }

  if (!booking) {
    return (
      <>
        <TopBar title="Booking" back />
        <div className="p-4">
          <EmptyState emoji="📅" title="Booking not found" />
        </div>
      </>
    );
  }

  const canCancel = booking.status === "pending" || booking.status === "confirmed";
  const canStart = booking.status === "confirmed";
  const canComplete = booking.status === "active";

  const act = async (fn: () => Promise<Booking>, message: string) => {
    setBusy(true);
    try {
      const updated = await fn();
      setBooking(updated);
      toast(message, "success");
    } catch {
      toast("Something went wrong. Please try again.", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <TopBar title="Booking details" back />

      <div className="space-y-4 p-4">
        <Card>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xl" aria-hidden>
                  {booking.type === "charging" ? "⚡" : "🅿️"}
                </span>
                <h2 className="text-lg font-bold text-ink-900">{booking.resourceName}</h2>
              </div>
              <p className="mt-1 text-sm text-ink-500">{booking.resourceAddress}</p>
            </div>
            <Badge tone={BOOKING_STATUS_TONE[booking.status]}>
              {BOOKING_STATUS_LABEL[booking.status]}
            </Badge>
          </div>

          {booking.status === "confirmed" && remaining > 0 && (
            <div className="mt-4 rounded-xl bg-brand-50 p-3 text-center">
              <p className="text-xs font-medium text-brand-700">Starts in</p>
              <p className="text-xl font-bold text-brand-800">
                {Math.floor(remaining / 3600) > 0 && `${Math.floor(remaining / 3600)}h `}
                {Math.floor((remaining % 3600) / 60)}m {remaining % 60}s
              </p>
            </div>
          )}

          {booking.status === "active" && (
            <div className="mt-4 rounded-xl bg-sky-50 p-3 text-center">
              <p className="text-xs font-medium text-sky-700">Session in progress</p>
              <p className="text-sm font-semibold text-sky-800">
                Ends {formatDateTime(booking.endTime)}
              </p>
            </div>
          )}
        </Card>

        <Card>
          <h3 className="mb-3 text-base font-semibold text-ink-900">Access code</h3>
          <div className="rounded-xl border-2 border-dashed border-brand-300 bg-brand-50 py-4 text-center">
            <p className="text-2xl font-bold tracking-[0.3em] text-brand-800">{booking.accessCode}</p>
            <p className="mt-1 text-xs text-brand-600">Show this at the gate or charger</p>
          </div>
        </Card>

        <Card>
          <h3 className="mb-3 text-base font-semibold text-ink-900">Details</h3>
          <dl className="space-y-2.5 text-sm">
            <Row label="Start" value={formatDateTime(booking.startTime)} />
            <Row label="End" value={formatDateTime(booking.endTime)} />
            <Row label="Duration" value={formatDuration(booking.durationMins)} />
            {booking.connectorLabel && <Row label="Connector" value={booking.connectorLabel} />}
            {booking.estimatedKwh !== undefined && (
              <Row label="Estimated energy" value={`${booking.estimatedKwh.toFixed(1)} kWh`} />
            )}
            <Row label="Payment ref" value={booking.paymentRef} />
            <div className="flex items-center justify-between border-t border-ink-100 pt-2.5">
              <dt className="font-medium text-ink-700">Total paid</dt>
              <dd className="text-base font-bold text-ink-900">{formatNaira(booking.amount)}</dd>
            </div>
          </dl>
        </Card>

        <div className="h-40 overflow-hidden rounded-2xl border border-ink-200">
          <MapCanvas
            center={booking.location}
            zoom={15}
            className="h-full"
            markers={[
              {
                id: booking.id,
                location: booking.location,
                kind: booking.type === "charging" ? "station" : "parking",
                emoji: booking.type === "charging" ? "⚡" : "🅿️",
                title: booking.resourceName,
              },
            ]}
          />
        </div>

        <div className="space-y-2">
          {canStart && (
            <Button
              fullWidth
              size="lg"
              loading={busy}
              onClick={() => act(() => updateBookingStatus(booking.id, "active"), "Session started")}
            >
              Start session
            </Button>
          )}
          {canComplete && (
            <Button
              fullWidth
              size="lg"
              loading={busy}
              onClick={() => act(() => updateBookingStatus(booking.id, "completed"), "Session completed")}
            >
              End session
            </Button>
          )}
          {canCancel && (
            <Button
              variant="outline"
              fullWidth
              loading={busy}
              onClick={() => act(() => cancelBooking(booking.id), "Booking cancelled")}
            >
              Cancel booking
            </Button>
          )}
          <Button variant="ghost" fullWidth onClick={() => router.push("/bookings")}>
            Back to bookings
          </Button>
        </div>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-ink-500">{label}</dt>
      <dd className="font-medium text-ink-900">{value}</dd>
    </div>
  );
}