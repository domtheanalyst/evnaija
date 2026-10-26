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
import { ConnectorRow, AmenityChips, RatingPill } from "@/components/stations/ConnectorRow";
import { TimeSlotPicker } from "@/components/booking/TimeSlotPicker";
import { PaymentSheet } from "@/components/checkout/PaymentSheet";
import { useToast } from "@/components/ui/Toast";
import { getStation, type StationWithDistance } from "@/lib/services/stations";
import { createBooking } from "@/lib/services/bookings";
import { useLocationStore } from "@/lib/store/locationStore";
import { useAuthStore } from "@/lib/store/authStore";
import { formatNaira } from "@/lib/utils/currency";
import { estimateDriveMins, formatDistance } from "@/lib/utils/geo";

export default function StationDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const location = useLocationStore((s) => s.location);
  const user = useAuthStore((s) => s.user);

  const [station, setStation] = useState<StationWithDistance | null>(null);
  const [loading, setLoading] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [selectedConnectorId, setSelectedConnectorId] = useState<string | null>(null);
  const [pending, setPending] = useState<{
    startTime: string;
    endTime: string;
    durationMins: number;
    amount: number;
    estimatedKwh?: number;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getStation(params.id, location)
      .then((s) => {
        if (cancelled) return;
        setStation(s);
        setSelectedConnectorId(s?.connectors.find((c) => c.available > 0)?.id ?? null);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [params.id, location]);

  if (loading) {
    return (
      <>
        <TopBar title="Station" back />
        <div className="space-y-3 p-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </>
    );
  }

  if (!station) {
    return (
      <>
        <TopBar title="Station" back />
        <div className="p-4">
          <EmptyState emoji="⚡" title="Station not found" description="This station may have been removed." />
        </div>
      </>
    );
  }

  const selectedConnector = station.connectors.find((c) => c.id === selectedConnectorId) ?? null;

  const startBooking = () => {
    if (!user) {
      toast("Please sign in to book a charging slot", "info");
      router.push(`/login?next=/stations/${station.id}`);
      return;
    }
    if (!selectedConnector) {
      toast("Select a connector first", "error");
      return;
    }
    setPickerOpen(true);
  };

  return (
    <>
      <TopBar title={station.name} subtitle={station.operator} back />

      <div className="h-44 border-b border-ink-200">
        <MapCanvas
          center={station.location}
          zoom={15}
          className="h-full"
          markers={[
            {
              id: station.id,
              location: station.location,
              kind: "station",
              emoji: "⚡",
              title: station.name,
            },
          ]}
        />
      </div>

      <div className="space-y-4 p-4">
        <Card>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-ink-900">{station.name}</h2>
              <p className="mt-0.5 text-sm text-ink-500">{station.address}</p>
              <p className="text-sm text-ink-500">
                {station.city}, {station.state}
              </p>
            </div>
            {station.open24h && <Badge tone="brand">24/7</Badge>}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <RatingPill rating={station.rating} count={station.reviewCount} />
            <span className="text-xs font-semibold text-brand-700">
              {formatDistance(station.distanceKm)} away
            </span>
            <span className="text-xs text-ink-500">~{estimateDriveMins(station.distanceKm)} min drive</span>
          </div>

          <div className="mt-3 border-t border-ink-100 pt-3">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-400">Amenities</p>
            <AmenityChips amenities={station.amenities} max={6} />
          </div>

          <p className="mt-3 text-xs text-ink-500">🕐 {station.operatingHours}</p>
        </Card>

        <Card>
          <h3 className="mb-1 text-base font-semibold text-ink-900">Connectors & pricing</h3>
          <p className="mb-2 text-xs text-ink-500">Tap a connector to select it for booking</p>

          <div className="space-y-1">
            {station.connectors.map((c) => (
              <button
                key={c.id}
                onClick={() => c.available > 0 && setSelectedConnectorId(c.id)}
                disabled={c.available === 0}
                className={`w-full rounded-xl px-2 text-left transition-colors disabled:opacity-50 ${
                  selectedConnectorId === c.id ? "bg-brand-50 ring-1 ring-brand-500" : "hover:bg-ink-50"
                }`}
              >
                <ConnectorRow connector={c} />
              </button>
            ))}
          </div>
        </Card>

        {selectedConnector && (
          <Card className="border-brand-200 bg-brand-50/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-ink-500">Selected</p>
                <p className="text-sm font-semibold text-ink-900">
                  {selectedConnector.type} · {selectedConnector.powerKw} kW
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-ink-900">
                  {formatNaira(selectedConnector.pricePerKwh)}
                </p>
                <p className="text-[11px] text-ink-400">per kWh</p>
              </div>
            </div>
          </Card>
        )}
      </div>

      <div className="sticky bottom-20 z-20 mx-4 mb-4">
        <Button fullWidth size="lg" onClick={startBooking} disabled={!selectedConnector}>
          {selectedConnector ? "Book this charger" : "No connector available"}
        </Button>
      </div>

      {selectedConnector && (
        <TimeSlotPicker
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
          title={`Book ${selectedConnector.type} charger`}
          unitPrice={selectedConnector.pricePerKwh}
          unitLabel="per kWh"
          powerKw={selectedConnector.powerKw}
          slots={station.connectors.map((c) => ({
            id: c.id,
            label: `${c.type} · ${c.powerKw}kW`,
            sublabel: `${c.available}/${c.slots} free`,
            disabled: c.available === 0,
          }))}
          selectedSlotId={selectedConnectorId ?? undefined}
          onSelectSlot={setSelectedConnectorId}
          onConfirm={(selection) => {
            setPending(selection);
            setPickerOpen(false);
            setPayOpen(true);
          }}
        />
      )}

      <PaymentSheet
        open={payOpen}
        onClose={() => setPayOpen(false)}
        amount={pending?.amount ?? 0}
        description={`${station.name} · ${selectedConnector?.type ?? ""} charging`}
        onSuccess={async (reference) => {
          if (!user || !pending || !selectedConnector) return "/";
          const booking = await createBooking({
            userId: user.id,
            type: "charging",
            resourceId: station.id,
            resourceName: station.name,
            resourceAddress: station.address,
            location: station.location,
            startTime: pending.startTime,
            endTime: pending.endTime,
            durationMins: pending.durationMins,
            connectorId: selectedConnector.id,
            connectorLabel: `${selectedConnector.type} · ${selectedConnector.powerKw}kW`,
            estimatedKwh: pending.estimatedKwh,
            amount: pending.amount,
          });
          toast(`Charging slot booked · ${reference}`, "success");
          return `/bookings/${booking.id}`;
        }}
      />
    </>
  );
}