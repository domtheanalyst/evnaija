"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils/misc";

export interface TabItem {
  id: string;
  label: string;
  badge?: number;
}

interface TabsProps {
  items: TabItem[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ items, active, onChange, className }: TabsProps) {
  return (
    <div className={cn("flex gap-1 overflow-x-auto rounded-xl bg-ink-100 p-1", className)} role="tablist">
      {items.map((item) => (
        <button
          key={item.id}
          role="tab"
          aria-selected={active === item.id}
          onClick={() => onChange(item.id)}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            active === item.id ? "bg-white text-ink-900 shadow-sm" : "text-ink-500 hover:text-ink-700",
          )}
        >
          {item.label}
          {item.badge ? (
            <span className="rounded-full bg-brand-600 px-1.5 text-[10px] font-bold text-white">
              {item.badge}
            </span>
          ) : null}
        </button>
      ))}
    </div>
  );
}

interface ChipProps {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
}

export function Chip({ children, active, onClick }: ChipProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
        active
          ? "border-brand-600 bg-brand-600 text-white"
          : "border-ink-300 bg-white text-ink-600 hover:border-ink-400",
      )}
    >
      {children}
    </button>
  );
}