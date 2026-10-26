"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/ui/TopBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { QuantityStepper } from "@/components/ui/Controls";
import { EmptyState } from "@/components/ui/EmptyState";
import { PaymentSheet } from "@/components/checkout/PaymentSheet";
import { useToast } from "@/components/ui/Toast";
import { useCartStore } from "@/lib/store/cartStore";
import { useAuthStore } from "@/lib/store/authStore";
import { useLocationStore } from "@/lib/store/locationStore";
import { cartSubtotal, deliveryFeeFor, createOrder, FREE_DELIVERY_THRESHOLD } from "@/lib/services/utilities";
import { formatNaira } from "@/lib/utils/currency";

export default function CartPage() {
  const router = useRouter();
  const { toast } = useToast();
  const items = useCartStore((s) => s.items);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clear = useCartStore((s) => s.clear);
  const user = useAuthStore((s) => s.user);
  const location = useLocationStore((s) => s.location);
  const locationLabel = useLocationStore((s) => s.label);

  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [payOpen, setPayOpen] = useState(false);

  const subtotal = cartSubtotal(items);
  const deliveryFee = deliveryFeeFor(subtotal);
  const total = subtotal + deliveryFee;
  const toFreeDelivery = FREE_DELIVERY_THRESHOLD - subtotal;

  if (items.length === 0) {
    return (
      <>
        <TopBar title="Your cart" back />
        <div className="p-4">
          <EmptyState
            emoji="🛒"
            title="Your cart is empty"
            description="Browse car utilities and add what you need."
            actionLabel="Browse utilities"
            actionHref="/utilities"
          />
        </div>
      </>
    );
  }

  const checkout = () => {
    if (!user) {
      toast("Please sign in to place an order", "info");
      router.push("/login?next=/utilities/cart");
      return;
    }
    if (!address.trim()) {
      toast("Enter a delivery address", "error");
      return;
    }
    setPayOpen(true);
  };

  return (
    <>
      <TopBar title="Your cart" subtitle={`${items.length} item${items.length > 1 ? "s" : ""}`} back />

      <div className="space-y-4 p-4">
        <Card>
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.productId} className="flex gap-3">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-ink-50 text-2xl">
                  {item.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-ink-900">{item.name}</h3>
                      <p className="text-xs text-ink-500">
                        {formatNaira(item.price)} / {item.unit}
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="text-xs font-medium text-red-500"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <QuantityStepper
                      value={item.quantity}
                      onChange={(q) => setQuantity(item.productId, q)}
                    />
                    <span className="text-sm font-bold text-ink-900">
                      {formatNaira(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="mb-3 text-base font-semibold text-ink-900">Delivery</h3>
          <div className="space-y-3">
            <Input
              label="Delivery address"
              placeholder="12 Admiralty Way, Lekki Phase 1"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <Textarea
              label="Note for the rider (optional)"
              placeholder="Call when you arrive at the gate"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
            />
            <p className="text-xs text-ink-400">📍 Delivering near {locationLabel}</p>
          </div>
        </Card>

        <Card>
          <h3 className="mb-3 text-base font-semibold text-ink-900">Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-ink-500">Subtotal</span>
              <span className="font-medium text-ink-900">{formatNaira(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-500">Delivery</span>
              <span className="font-medium text-ink-900">
                {deliveryFee === 0 ? "Free" : formatNaira(deliveryFee)}
              </span>
            </div>
            {toFreeDelivery > 0 && (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
                Add {formatNaira(toFreeDelivery)} more for free delivery
              </p>
            )}
            <div className="flex justify-between border-t border-ink-100 pt-2">
              <span className="font-semibold text-ink-900">Total</span>
              <span className="text-base font-bold text-ink-900">{formatNaira(total)}</span>
            </div>
          </div>
        </Card>

        <Button fullWidth size="lg" onClick={checkout}>
          Checkout · {formatNaira(total)}
        </Button>
      </div>

      <PaymentSheet
        open={payOpen}
        onClose={() => setPayOpen(false)}
        amount={total}
        description={`${items.length} item${items.length > 1 ? "s" : ""} · car utilities`}
        onSuccess={async (reference) => {
          if (!user) return "/";
          const order = await createOrder({
            userId: user.id,
            items,
            deliveryAddress: note.trim() ? `${address} — ${note}` : address,
            location,
          });
          clear();
          toast(`Order placed · ${reference}`, "success");
          return `/utilities/orders/${order.id}`;
        }}
      />
    </>
  );
}