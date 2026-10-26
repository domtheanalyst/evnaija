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
import { RatingPill } from "@/components/stations/ConnectorRow";
import { TimeSlotPicker } from "@/components/booking/TimeSlotPicker";
import { PaymentSheet } from "@/components/checkout/PaymentSheet";
import { useToast } from "@/components/ui/Toast";
import { getParking, type ParkingWithDistance } from "@/lib/services/parking";
import { createBooking } from "@/lib/services/bookings";
import { useLocationStore } from "@/lib/store/locationStore";
import { useAuthStore } from "@/lib/store/authStore";
import { formatNaira } from "@/lib/utils/currency";
import { estimateDriveMins, formatDistance } from "@/lib/utils/geo";

export default function ParkingDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const location = useLocationStore((s) => s.location);
  const user = useAuthStore((s) => s.user);

  const [space, setSpace] = useState<ParkingWithDistance | null>(null);
  const [loading, setLoading] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [pending, setPending] = useState<{
    startTime: string;
    endTime: string;
    durationMins: number;
    amount: number;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getParking(params.id, location)
      .then((p) => !cancelled && setSpace(p))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [params.id, location]);

  if (loading) {
    return (
      <>
        <TopBar title="Parking" back />
        <div className="space-y-3 p-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </>
    );
  }

  if (!space) {
    return (
      <>
        <TopBar title="Parking" back />
        <div className="p-4">
          <EmptyState emoji="🅿️" title="Parking space not found" />
        </div>
      </>
    );
  }

  const occupancy = 1 - space.availableSpaces / space.totalSpaces;

  const startBooking = () => {
    if (!user) {
      toast("Please sign in to book a parking space", "info");
      router.push(`/login?next=/parking/${space.id}`);
      return;
    }
    setPickerOpen(true);
  };

  return (
    <>
      <TopBar title={space.name} subtitle={`${space.city}, ${space.state}`} back />

      <div className="h-44 border-b border-ink-200">
        <MapCanvas
          center={space.location}
          zoom={15}
          className="h-full"
          markers={[
            { id: space.id, location: space.location, kind: "parking", emoji: "🅿️", title: space.name },
          ]}
        />
      </div>

      <div className="space-y-4 p-4">
        <Card>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-ink-900">{space.name}</h2>
              <p className="mt-0.5 text-sm text-ink-500">{space.address}</p>
            </div>
            {space.covered && <Badge tone="info">Covered</Badge>}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <RatingPill rating={space.rating} count={space.reviewCount} />
            <span className="text-xs font-semibold text-brand-700">
              {formatDistance(space.distanceKm)} away
            </span>
            <span className="text-xs text-ink-500">~{estimateDriveMins(space.distanceKm)} min drive</span>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-ink-600">
                {space.availableSpaces} of {space.totalSpaces} spaces free
              </span>
              <span className="text-ink-400">{Math.round(occupancy * 100)}% full</span>
            </div>
            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-ink-100">
              <div
                className="h-full rounded-full bg-brand-500"
                style={{ width: `${Math.min(100, occupancy * 100)}%` }}
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {space.features.map((f) => (
              <span key={f} className="rounded-md bg-ink-100 px-2 py-0.5 text-[11px] font-medium text-ink-600">
                {f}
              </span>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="mb-3 text-base font-semibold text-ink-900">Pricing</h3>
          <div className="flex items-center justify-between border-b border-ink-100 py-2.5">
            <span className="text-sm text-ink-600">Hourly</span>
            <span className="text-sm font-bold text-ink-900">{formatNaira(space.pricePerHour)}</span>
          </div>
          <div className="flex items-center justify-between py-2.5">
            <span className="text-sm text-ink-600">Full day</span>
            <span className="text-sm font-bold text-ink-900">{formatNaira(space.pricePerDay)}</span>
          </div>
          {space.hasEvCharging && (
            <p className="mt-2 rounded-lg bg-brand-50 px-3 py-2 text-xs font-medium text-brand-700">
              ⚡ This location also offers EV charging
            </p>
          )}
        </Card>
      </div>

      <div className="sticky bottom-20 z-20 mx-4 mb-4">
        <Button fullWidth size="lg" onClick={startBooking} disabled={space.availableSpaces === 0}>
          {space.availableSpaces > 0 ? "Book this space" : "Fully occupied"}
        </Button>
      </div>

      <TimeSlotPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        title={`Book ${space.name}`}
        unitPrice={space.pricePerHour}
        unitLabel="per hour"
        onConfirm={(selection) => {
          setPending(selection);
          setPickerOpen(false);
          setPayOpen(true);
        }}
      />

      <PaymentSheet
        open={payOpen}
        onClose={() => setPayOpen(false)}
        amount={pending?.amount ?? 0}
        description={`${space.name} · parking`}
        onSuccess={async (reference) => {
          if (!user || !pending) return "/";
          const booking = await createBooking({
            userId: user.id,
            type: "parking",
            resourceId: space.id,
            resourceName: space.name,
            resourceAddress: space.address,
            location: space.location,
            startTime: pending.startTime,
            endTime: pending.endTime,
            durationMins: pending.durationMins,
            amount: pending.amount,
          });
          toast(`Parking space booked · ${reference}`, "success");
          return `/bookings/${booking.id}`;
        }}
      />
    </>
  );
}