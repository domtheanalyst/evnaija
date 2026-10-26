"use client";

import { useMemo, useState } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Tabs";
import { formatNaira } from "@/lib/utils/currency";
import { addMinutes, formatDuration, formatTime, roundUpToQuarter } from "@/lib/utils/time";
import { cn } from "@/lib/utils/misc";

export interface SlotOption {
  id: string;
  label: string;
  sublabel?: string;
  disabled?: boolean;
}

interface TimeSlotPickerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Price per hour (parking) or per kWh (charging). */
  unitPrice: number;
  unitLabel: string;
  /** Charging bookings estimate energy from power × duration. */
  powerKw?: number;
  onConfirm: (selection: {
    startTime: string;
    endTime: string;
    durationMins: number;
    amount: number;
    estimatedKwh?: number;
  }) => void;
  slots?: SlotOption[];
  selectedSlotId?: string;
  onSelectSlot?: (id: string) => void;
}

const DURATIONS = [30, 60, 90, 120, 180, 240];

export function TimeSlotPicker({
  open,
  onClose,
  title,
  unitPrice,
  unitLabel,
  powerKw,
  onConfirm,
  slots,
  selectedSlotId,
  onSelectSlot,
}: TimeSlotPickerProps) {
  const [durationMins, setDurationMins] = useState(60);
  const [startOffsetMins, setStartOffsetMins] = useState(0);

  const startTime = useMemo(() => {
    const base = roundUpToQuarter(new Date());
    return addMinutes(base, startOffsetMins);
  }, [startOffsetMins]);

  const endTime = useMemo(() => addMinutes(startTime, durationMins), [startTime, durationMins]);

  const estimatedKwh = powerKw ? (powerKw * durationMins) / 60 : undefined;

  const amount = useMemo(() => {
    if (powerKw && estimatedKwh) {
      // Charging: energy cost, floored at a 30-minute session minimum.
      return Math.round(estimatedKwh * unitPrice);
    }
    return Math.round((unitPrice * durationMins) / 60);
  }, [powerKw, estimatedKwh, unitPrice, durationMins]);

  const startOptions = [0, 15, 30, 60, 120];

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-ink-500">Total</span>
            <span className="text-lg font-bold text-ink-900">{formatNaira(amount)}</span>
          </div>
          <Button
            fullWidth
            size="lg"
            onClick={() =>
              onConfirm({
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                durationMins,
                amount,
                estimatedKwh,
              })
            }
          >
            Continue to payment
          </Button>
        </div>
      }
    >
      {slots && slots.length > 0 && (
        <div className="mb-5">
          <p className="mb-2 text-sm font-medium text-ink-700">Choose a point</p>
          <div className="grid grid-cols-2 gap-2">
            {slots.map((slot) => (
              <button
                key={slot.id}
                disabled={slot.disabled}
                onClick={() => onSelectSlot?.(slot.id)}
                className={cn(
                  "rounded-xl border px-3 py-2.5 text-left text-sm transition-colors disabled:opacity-40",
                  selectedSlotId === slot.id
                    ? "border-brand-600 bg-brand-50"
                    : "border-ink-200 bg-white hover:border-ink-300",
                )}
              >
                <span className="block font-semibold text-ink-900">{slot.label}</span>
                {slot.sublabel && <span className="text-xs text-ink-500">{slot.sublabel}</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mb-5">
        <p className="mb-2 text-sm font-medium text-ink-700">Start time</p>
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {startOptions.map((offset) => (
            <Chip
              key={offset}
              active={startOffsetMins === offset}
              onClick={() => setStartOffsetMins(offset)}
            >
              {offset === 0 ? "Now" : `+${offset} min`}
            </Chip>
          ))}
        </div>
      </div>

      <div className="mb-5">
        <p className="mb-2 text-sm font-medium text-ink-700">Duration</p>
        <div className="grid grid-cols-3 gap-2">
          {DURATIONS.map((d) => (
            <button
              key={d}
              onClick={() => setDurationMins(d)}
              className={cn(
                "rounded-xl border py-2.5 text-sm font-medium transition-colors",
                durationMins === d
                  ? "border-brand-600 bg-brand-50 text-brand-700"
                  : "border-ink-200 bg-white text-ink-700 hover:border-ink-300",
              )}
            >
              {formatDuration(d)}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-ink-50 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-ink-500">From</span>
          <span className="font-semibold text-ink-900">{formatTime(startTime.toISOString())}</span>
        </div>
        <div className="mt-1.5 flex items-center justify-between text-sm">
          <span className="text-ink-500">To</span>
          <span className="font-semibold text-ink-900">{formatTime(endTime.toISOString())}</span>
        </div>
        {estimatedKwh !== undefined && (
          <div className="mt-1.5 flex items-center justify-between text-sm">
            <span className="text-ink-500">Estimated energy</span>
            <span className="font-semibold text-ink-900">{estimatedKwh.toFixed(1)} kWh</span>
          </div>
        )}
        <div className="mt-1.5 flex items-center justify-between text-sm">
          <span className="text-ink-500">Rate</span>
          <span className="font-semibold text-ink-900">
            {formatNaira(unitPrice)} {unitLabel}
          </span>
        </div>
      </div>
    </Sheet>
  );
}