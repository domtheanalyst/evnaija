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
import {
  getEmergencyRequest,
  updateEmergencyStatus,
  cancelEmergencyRequest,
  EMERGENCY_FLOW,
  EMERGENCY_STATUS_LABELS,
  EMERGENCY_STATUS_DESCRIPTIONS,
} from "@/lib/services/emergency";
import { getEmergencyMeta } from "@/lib/data/responders";
import { formatNaira } from "@/lib/utils/currency";
import { formatDateTime } from "@/lib/utils/time";
import { cn } from "@/lib/utils/misc";
import type { EmergencyRequest } from "@/lib/types";

export default function EmergencyDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const [request, setRequest] = useState<EmergencyRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getEmergencyRequest(params.id)
      .then((r) => !cancelled && setRequest(r))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  if (loading) {
    return (
      <>
        <TopBar title="Rescue" back />
        <div className="space-y-3 p-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </>
    );
  }

  if (!request) {
    return (
      <>
        <TopBar title="Rescue" back />
        <div className="p-4">
          <EmptyState emoji="🚨" title="Request not found" />
        </div>
      </>
    );
  }

  const meta = getEmergencyMeta(request.type);
  const currentIndex = EMERGENCY_FLOW.indexOf(request.status);
  const cancelled = request.status === "cancelled";
  const done = request.status === "completed";

  const advance = async () => {
    const next = EMERGENCY_FLOW[currentIndex + 1];
    if (!next) return;
    setBusy(true);
    try {
      const updated = await updateEmergencyStatus(request.id, next);
      if (updated) setRequest(updated);
      toast(EMERGENCY_STATUS_LABELS[next], "success");
    } finally {
      setBusy(false);
    }
  };

  const cancel = async () => {
    setBusy(true);
    try {
      const updated = await cancelEmergencyRequest(request.id);
      if (updated) setRequest(updated);
      toast("Request cancelled", "info");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <TopBar title={meta?.label ?? "Rescue"} subtitle={request.paymentRef} back />

      <div className="space-y-4 p-4">
        <Card className={cn(cancelled ? "border-ink-200" : done ? "border-brand-200" : "border-red-200")}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="text-3xl">{meta?.emoji ?? "🚨"}</span>
              <div>
                <h2 className="text-base font-bold text-ink-900">
                  {EMERGENCY_STATUS_LABELS[request.status]}
                </h2>
                <p className="mt-0.5 text-xs text-ink-500">
                  {EMERGENCY_STATUS_DESCRIPTIONS[request.status]}
                </p>
              </div>
            </div>
            {!cancelled && !done && <Badge tone="danger">Live</Badge>}
          </div>

          {!cancelled && (
            <div className="mt-5 space-y-3">
              {EMERGENCY_FLOW.map((step, i) => {
                const reached = i <= currentIndex;
                return (
                  <div key={step} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                          reached ? "bg-brand-600 text-white" : "bg-ink-100 text-ink-400",
                        )}
                      >
                        {reached ? "✓" : i + 1}
                      </div>
                      {i < EMERGENCY_FLOW.length - 1 && (
                        <div className={cn("w-0.5 flex-1", reached ? "bg-brand-500" : "bg-ink-100")} />
                      )}
                    </div>
                    <div className="pb-3">
                      <p
                        className={cn(
                          "text-sm font-medium",
                          reached ? "text-ink-900" : "text-ink-400",
                        )}
                      >
                        {EMERGENCY_STATUS_LABELS[step]}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {request.responder && !cancelled && (
          <Card>
            <h3 className="mb-3 text-base font-semibold text-ink-900">Your responder</h3>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-lg font-bold text-brand-700">
                {request.responder.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink-900">{request.responder.name}</p>
                <p className="text-xs text-ink-500">{request.responder.company}</p>
                <p className="text-xs text-ink-400">
                  {request.responder.vehicle} · ★ {request.responder.rating.toFixed(1)}
                </p>
              </div>
            </div>

            <div className="mt-3 flex gap-2">
              <a href={`tel:${request.responder.phone.replace(/\s/g, "")}`} className="flex-1">
                <Button variant="secondary" fullWidth>
                  📞 Call
                </Button>
              </a>
              <div className="flex-1">
                <Button variant="outline" fullWidth disabled>
                  💬 Message
                </Button>
              </div>
            </div>

            {!done && (
              <div className="mt-3 rounded-xl bg-red-50 px-3 py-2.5 text-center">
                <p className="text-xs font-medium text-red-700">Estimated arrival</p>
                <p className="text-lg font-bold text-red-800">{request.etaMins} minutes</p>
              </div>
            )}
          </Card>
        )}

        <div className="h-40 overflow-hidden rounded-2xl border border-ink-200">
          <MapCanvas
            center={request.location}
            zoom={14}
            className="h-full"
            markers={[
              {
                id: "incident",
                location: request.location,
                kind: "emergency",
                emoji: "🚨",
                title: "Your location",
              },
              ...(request.responder
                ? [
                    {
                      id: request.responder.id,
                      location: request.responder.location,
                      kind: "user" as const,
                      emoji: "🚛",
                      title: request.responder.name,
                      subtitle: request.responder.company,
                    },
                  ]
                : []),
            ]}
          />
        </div>

        <Card>
          <h3 className="mb-3 text-base font-semibold text-ink-900">Request details</h3>
          <dl className="space-y-2.5 text-sm">
            <Row label="Service" value={meta?.label ?? request.type} />
            <Row label="Location" value={request.address} />
            {request.notes && <Row label="Notes" value={request.notes} />}
            <Row label="Vehicle" value={request.vehicle} />
            <Row label="Requested" value={formatDateTime(request.createdAt)} />
            <div className="flex items-center justify-between border-t border-ink-100 pt-2.5">
              <dt className="font-medium text-ink-700">Service fee</dt>
              <dd className="text-base font-bold text-ink-900">
                {formatNaira(meta?.baseFee ?? 0)}
              </dd>
            </div>
          </dl>
        </Card>

        <div className="space-y-2">
          {!cancelled && !done && (
            <>
              <Button fullWidth size="lg" loading={busy} onClick={advance}>
                Simulate next update
              </Button>
              <Button variant="outline" fullWidth loading={busy} onClick={cancel}>
                Cancel request
              </Button>
            </>
          )}
          <Button variant="ghost" fullWidth onClick={() => router.push("/emergency")}>
            Back to rescue
          </Button>
        </div>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="shrink-0 text-ink-500">{label}</dt>
      <dd className="text-right font-medium text-ink-900">{value}</dd>
    </div>
  );
}