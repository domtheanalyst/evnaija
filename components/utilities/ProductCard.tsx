"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useCartStore } from "@/lib/store/cartStore";
import { useToast } from "@/components/ui/Toast";
import { formatNaira } from "@/lib/utils/currency";
import type { UtilityProduct } from "@/lib/types";

export function ProductCard({ product }: { product: UtilityProduct }) {
  const addItem = useCartStore((s) => s.addItem);
  const { toast } = useToast();

  const outOfStock = !product.inStock;

  return (
    <div className="flex gap-3 rounded-2xl border border-ink-200 bg-white p-3 shadow-card">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-ink-50 text-3xl">
        {product.emoji}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold leading-snug text-ink-900">{product.name}</h3>
          {outOfStock && <Badge tone="danger">Out of stock</Badge>}
        </div>

        <p className="mt-0.5 line-clamp-2 text-xs text-ink-500">{product.description}</p>

        <div className="mt-1.5 flex items-center gap-2 text-[11px] text-ink-400">
          <span>{product.vendor}</span>
          <span>·</span>
          <span>★ {product.rating.toFixed(1)}</span>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <div>
            <span className="text-sm font-bold text-ink-900">{formatNaira(product.price)}</span>
            <span className="ml-1 text-[11px] text-ink-400">/ {product.unit}</span>
          </div>
          <Button
            size="sm"
            disabled={outOfStock}
            onClick={() => {
              addItem(product);
              toast(`${product.name} added to cart`, "success");
            }}
          >
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}

export function CartBar() {
  const items = useCartStore((s) => s.items);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  if (count === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-16 z-30 mx-auto max-w-lg px-4 pb-2">
      <Link
        href="/utilities/cart"
        className="flex items-center justify-between rounded-2xl bg-ink-900 px-4 py-3 shadow-sheet"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-white">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-500 text-xs font-bold">
            {count}
          </span>
          View cart
        </span>
        <span className="text-sm font-bold text-white">{formatNaira(subtotal)}</span>
      </Link>
    </div>
  );
}