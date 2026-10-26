"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/ui/TopBar";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { PaymentSheet } from "@/components/checkout/PaymentSheet";
import { useToast } from "@/components/ui/Toast";
import { useAuthStore } from "@/lib/store/authStore";
import { useLocationStore } from "@/lib/store/locationStore";
import { EMERGENCY_TYPES } from "@/lib/data/responders";
import { createEmergencyRequest, listEmergencyRequests, EMERGENCY_STATUS_LABELS } from "@/lib/services/emergency";
import { formatNaira } from "@/lib/utils/currency";
import { cn } from "@/lib/utils/misc";
import type { EmergencyRequest, EmergencyType } from "@/lib/types";

export default function EmergencyPage() {
  const router = useRouter();
  const { toast } = useToast();
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);
  const location = useLocationStore((s) => s.location);
  const locationLabel = useLocationStore((s) => s.label);

  const [selected, setSelected] = useState<EmergencyType | null>(null);
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [payOpen, setPayOpen] = useState(false);
  const [active, setActive] = useState<EmergencyRequest[]>([]);

  useEffect(() => {
    if (!hydrated || !user) return;
    let cancelled = false;
    listEmergencyRequests(user.id).then((r) => {
      if (cancelled) return;
      setActive(r.filter((x) => x.status !== "completed" && x.status !== "cancelled"));
    });
    return () => {
      cancelled = true;
    };
  }, [user, hydrated]);

  const meta = EMERGENCY_TYPES.find((e) => e.type === selected) ?? null;

  const request = () => {
    if (!user) {
      toast("Please sign in to request assistance", "info");
      router.push("/login?next=/emergency");
      return;
    }
    if (!selected) {
      toast("Choose the type of help you need", "error");
      return;
    }
    if (!address.trim()) {
      toast("Tell us where you are", "error");
      return;
    }
    setPayOpen(true);
  };

  return (
    <>
      <TopBar title="Emergency rescue" subtitle="24/7 roadside assistance" />

      <div className="space-y-4 p-4">
        {active.length > 0 && (
          <div className="space-y-2">
            {active.map((r) => (
              <Link
                key={r.id}
                href={`/emergency/${r.id}`}
                className="flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 p-4"
              >
                <div>
                  <p className="text-sm font-semibold text-red-800">
                    {EMERGENCY_STATUS_LABELS[r.status]}
                  </p>
                  <p className="text-xs text-red-600">
                    {r.responder?.name} · ETA {r.etaMins} min
                  </p>
                </div>
                <span className="text-xs font-bold text-red-700">Track →</span>
              </Link>
            ))}
          </div>
        )}

        <Card className="border-red-200 bg-red-50/60">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🚨</span>
            <div>
              <h2 className="text-sm font-bold text-red-900">Need help right now?</h2>
              <p className="mt-0.5 text-xs text-red-700">
                Pick the service you need. We dispatch the closest responder to your location.
              </p>
            </div>
          </div>
        </Card>

        <div>
          <h3 className="mb-2 text-sm font-semibold text-ink-900">What do you need?</h3>
          <div className="grid grid-cols-2 gap-2">
            {EMERGENCY_TYPES.map((e) => (
              <button
                key={e.type}
                onClick={() => setSelected(e.type)}
                className={cn(
                  "rounded-2xl border p-3 text-left transition-colors",
                  selected === e.type
                    ? "border-brand-600 bg-brand-50 ring-1 ring-brand-500"
                    : "border-ink-200 bg-white hover:border-ink-300",
                )}
              >
                <span className="text-2xl">{e.emoji}</span>
                <p className="mt-1.5 text-sm font-semibold text-ink-900">{e.label}</p>
                <p className="mt-0.5 text-[11px] leading-tight text-ink-500">{e.description}</p>
                <p className="mt-1.5 text-xs font-bold text-brand-700">{formatNaira(e.baseFee)}</p>
              </button>
            ))}
          </div>
        </div>

        {meta && (
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-ink-900">{meta.label}</p>
                <p className="text-xs text-ink-500">Typical arrival ~{meta.etaMins} minutes</p>
              </div>
              <Badge tone="brand">{formatNaira(meta.baseFee)}</Badge>
            </div>
          </Card>
        )}

        <Card>
          <h3 className="mb-3 text-base font-semibold text-ink-900">Your location</h3>
          <div className="space-y-3">
            <div className="rounded-xl bg-ink-50 px-3 py-2.5">
              <p className="text-xs text-ink-500">Detected</p>
              <p className="text-sm font-medium text-ink-900">{locationLabel}</p>
            </div>
            <Textarea
              label="Landmark or address"
              placeholder="e.g. Opposite Lekki Phase 1 gate, beside the filling station"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={2}
            />
            <Textarea
              label="Anything else we should know? (optional)"
              placeholder="Vehicle details, hazard lights on, passengers present…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
        </Card>

        <Button
          fullWidth
          size="lg"
          variant="danger"
          onClick={request}
          disabled={!selected}
        >
          {meta ? `Request ${meta.label} · ${formatNaira(meta.baseFee)}` : "Select a service"}
        </Button>

        <p className="text-center text-[11px] text-ink-400">
          For life-threatening emergencies, call 112 immediately.
        </p>
      </div>

      <PaymentSheet
        open={payOpen}
        onClose={() => setPayOpen(false)}
        amount={meta?.baseFee ?? 0}
        description={`${meta?.label ?? "Emergency"} · roadside assistance`}
        onSuccess={async (reference) => {
          if (!user || !selected) return "/";
          const req = await createEmergencyRequest({
            userId: user.id,
            type: selected,
            location,
            address,
            notes,
            vehicle: user.vehicle ? `${user.vehicle.make} ${user.vehicle.model}` : "Not specified",
          });
          toast(`Responder dispatched · ${reference}`, "success");
          return `/emergency/${req.id}`;
        }}
      />
    </>
  );
}