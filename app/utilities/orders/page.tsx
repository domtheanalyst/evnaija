"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TopBar } from "@/components/ui/TopBar";
import { Badge } from "@/components/ui/Badge";
import { ListSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuthStore } from "@/lib/store/authStore";
import { listOrders, ORDER_STATUS_LABELS } from "@/lib/services/utilities";
import { formatNaira } from "@/lib/utils/currency";
import { formatRelative } from "@/lib/utils/time";
import type { Order, OrderStatus } from "@/lib/types";

const TONE: Record<OrderStatus, "success" | "warning" | "danger" | "neutral" | "info"> = {
  placed: "warning",
  confirmed: "info",
  dispatched: "info",
  delivered: "success",
  cancelled: "danger",
};

export default function OrdersPage() {
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    listOrders(user.id)
      .then((o) => !cancelled && setOrders(o))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [user, hydrated]);

  return (
    <>
      <TopBar title="My orders" subtitle={`${orders.length} total`} back />

      <div className="space-y-3 p-4">
        {!hydrated || loading ? (
          <ListSkeleton count={3} />
        ) : !user ? (
          <EmptyState
            emoji="🔐"
            title="Sign in to see your orders"
            actionLabel="Sign in"
            actionHref="/login?next=/utilities/orders"
          />
        ) : orders.length === 0 ? (
          <EmptyState
            emoji="📦"
            title="No orders yet"
            description="Order car utilities and track delivery here."
            actionLabel="Browse utilities"
            actionHref="/utilities"
          />
        ) : (
          orders.map((o) => (
            <Link
              key={o.id}
              href={`/utilities/orders/${o.id}`}
              className="block rounded-2xl border border-ink-200 bg-white p-4 shadow-card"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink-900">
                    {o.items.length} item{o.items.length > 1 ? "s" : ""}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-ink-500">
                    {o.items.map((i) => i.name).join(", ")}
                  </p>
                  <p className="mt-1 text-[11px] text-ink-400">{formatRelative(o.createdAt)}</p>
                </div>
                <Badge tone={TONE[o.status]}>{ORDER_STATUS_LABELS[o.status]}</Badge>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-ink-100 pt-3">
                <span className="text-xs text-ink-500">{o.paymentRef}</span>
                <span className="text-sm font-bold text-ink-900">{formatNaira(o.total)}</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </>
  );
}