"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { TopBar } from "@/components/ui/TopBar";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import {
  getOrder,
  updateOrderStatus,
  ORDER_FLOW,
  ORDER_STATUS_LABELS,
} from "@/lib/services/utilities";
import { formatNaira } from "@/lib/utils/currency";
import { formatDateTime } from "@/lib/utils/time";
import { cn } from "@/lib/utils/misc";
import type { Order } from "@/lib/types";

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getOrder(params.id)
      .then((o) => !cancelled && setOrder(o))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  if (loading) {
    return (
      <>
        <TopBar title="Order" back />
        <div className="space-y-3 p-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </>
    );
  }

  if (!order) {
    return (
      <>
        <TopBar title="Order" back />
        <div className="p-4">
          <EmptyState emoji="📦" title="Order not found" />
        </div>
      </>
    );
  }

  const currentIndex = ORDER_FLOW.indexOf(order.status);
  const cancelled = order.status === "cancelled";

  const advance = async () => {
    const next = ORDER_FLOW[currentIndex + 1];
    if (!next) return;
    setBusy(true);
    try {
      const updated = await updateOrderStatus(order.id, next);
      if (updated) setOrder(updated);
      toast(ORDER_STATUS_LABELS[next], "success");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <TopBar title="Order details" back />

      <div className="space-y-4 p-4">
        <Card>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs text-ink-500">Order {order.paymentRef}</p>
              <p className="mt-0.5 text-lg font-bold text-ink-900">{formatNaira(order.total)}</p>
              <p className="text-xs text-ink-400">{formatDateTime(order.createdAt)}</p>
            </div>
            <Badge tone={cancelled ? "danger" : order.status === "delivered" ? "success" : "info"}>
              {ORDER_STATUS_LABELS[order.status]}
            </Badge>
          </div>

          {!cancelled && (
            <div className="mt-5">
              <div className="flex items-center">
                {ORDER_FLOW.map((step, i) => (
                  <div key={step} className="flex flex-1 items-center last:flex-none">
                    <div
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                        i <= currentIndex ? "bg-brand-600 text-white" : "bg-ink-100 text-ink-400",
                      )}
                    >
                      {i <= currentIndex ? "✓" : i + 1}
                    </div>
                    {i < ORDER_FLOW.length - 1 && (
                      <div
                        className={cn(
                          "mx-1 h-0.5 flex-1",
                          i < currentIndex ? "bg-brand-600" : "bg-ink-100",
                        )}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-2 flex justify-between text-[10px] text-ink-500">
                {ORDER_FLOW.map((step) => (
                  <span key={step} className="flex-1 text-center first:text-left last:text-right">
                    {ORDER_STATUS_LABELS[step].split(" ")[0]}
                  </span>
                ))}
              </div>
              {order.status !== "delivered" && (
                <p className="mt-3 rounded-lg bg-sky-50 px-3 py-2 text-xs font-medium text-sky-700">
                  🛵 Estimated arrival in ~{order.etaMins} minutes
                </p>
              )}
            </div>
          )}
        </Card>

        <Card>
          <h3 className="mb-3 text-base font-semibold text-ink-900">Items</h3>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.productId} className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-ink-50 text-xl">
                  {item.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink-900">{item.name}</p>
                  <p className="text-xs text-ink-500">
                    {item.quantity} × {formatNaira(item.price)}
                  </p>
                </div>
                <span className="text-sm font-semibold text-ink-900">
                  {formatNaira(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-2 border-t border-ink-100 pt-3 text-sm">
            <div className="flex justify-between">
              <span className="text-ink-500">Subtotal</span>
              <span className="font-medium text-ink-900">{formatNaira(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-500">Delivery</span>
              <span className="font-medium text-ink-900">
                {order.deliveryFee === 0 ? "Free" : formatNaira(order.deliveryFee)}
              </span>
            </div>
            <div className="flex justify-between border-t border-ink-100 pt-2">
              <span className="font-semibold text-ink-900">Total</span>
              <span className="font-bold text-ink-900">{formatNaira(order.total)}</span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="mb-2 text-base font-semibold text-ink-900">Delivery address</h3>
          <p className="text-sm text-ink-600">{order.deliveryAddress}</p>
        </Card>

        {!cancelled && order.status !== "delivered" && (
          <Button fullWidth size="lg" loading={busy} onClick={advance}>
            Simulate next update
          </Button>
        )}
      </div>
    </>
  );
}