"use client";

import { Chip } from "@/components/ui/Tabs";
import { cn } from "@/lib/utils/misc";

interface FilterBarProps {
  chips: { id: string; label: string; active: boolean; onToggle: () => void }[];
  className?: string;
}

/** Horizontally scrollable filter chips. */
export function FilterBar({ chips, className }: FilterBarProps) {
  return (
    <div className={cn("no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 py-1", className)}>
      {chips.map((chip) => (
        <Chip key={chip.id} active={chip.active} onClick={chip.onToggle}>
          {chip.label}
        </Chip>
      ))}
    </div>
  );
}

interface SortSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

export function SortSelect({ value, onChange, options }: SortSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 text-xs font-medium text-ink-700 focus:border-brand-500 focus:outline-none"
      aria-label="Sort results"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}