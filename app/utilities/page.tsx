"use client";

import { useEffect, useMemo, useState } from "react";
import { TopBar } from "@/components/ui/TopBar";
import { Tabs } from "@/components/ui/Tabs";
import { SearchBar } from "@/components/ui/Controls";
import { ListSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProductCard, CartBar } from "@/components/utilities/ProductCard";
import { listProducts } from "@/lib/services/utilities";
import { CATEGORY_LABELS } from "@/lib/data/products";
import type { UtilityCategory, UtilityProduct } from "@/lib/types";

const CATEGORIES: UtilityCategory[] = [
  "charging",
  "maintenance",
  "tyres",
  "cleaning",
  "accessories",
];

export default function UtilitiesPage() {
  const [category, setCategory] = useState<UtilityCategory>("charging");
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<UtilityProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listProducts(category)
      .then((p) => !cancelled && setProducts(p))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [category]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.vendor.toLowerCase().includes(q),
    );
  }, [products, query]);

  return (
    <>
      <TopBar title="Car utilities" subtitle="Delivered to your location" />

      <div className="space-y-3 px-4 py-3">
        <SearchBar value={query} onChange={setQuery} placeholder="Search products or vendors" />
        <Tabs
          active={category}
          onChange={(v) => setCategory(v as UtilityCategory)}
          items={CATEGORIES.map((c) => ({ id: c, label: CATEGORY_LABELS[c] }))}
        />
      </div>

      <div className="space-y-3 px-4 pb-28">
        {loading ? (
          <ListSkeleton count={4} />
        ) : filtered.length === 0 ? (
          <EmptyState
            emoji="🧰"
            title="No products found"
            description="Try a different category or search term."
          />
        ) : (
          filtered.map((p) => <ProductCard key={p.id} product={p} />)
        )}
      </div>

      <CartBar />
    </>
  );
}