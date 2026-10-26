"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PAYMENT_METHODS, charge, ussdCodeFor } from "@/lib/services/payments";
import { formatNaira } from "@/lib/utils/currency";
import { cn } from "@/lib/utils/misc";
import type { PaymentMethod } from "@/lib/types";

interface PaymentSheetProps {
  open: boolean;
  onClose: () => void;
  amount: number;
  description: string;
  /** Called after a successful charge; return the path to navigate to. */
  onSuccess: (reference: string, method: PaymentMethod["kind"]) => Promise<string> | string;
}

export function PaymentSheet({ open, onClose, amount, description, onSuccess }: PaymentSheetProps) {
  const router = useRouter();
  const [method, setMethod] = useState<PaymentMethod["kind"]>("card");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePay = async () => {
    setProcessing(true);
    setError(null);
    try {
      const result = await charge({ amount, method, description });
      if (!result.success) {
        setError(result.message);
        setProcessing(false);
        return;
      }
      const next = await onSuccess(result.reference, method);
      router.push(next);
    } catch {
      setError("Payment could not be completed. Please try again.");
      setProcessing(false);
    }
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Checkout"
      footer={
        <div className="space-y-3">
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button fullWidth size="lg" loading={processing} onClick={handlePay}>
            {processing ? "Processing…" : `Pay ${formatNaira(amount)}`}
          </Button>
          <p className="text-center text-[11px] text-ink-400">
            Secured by Paystack · This is a simulated payment for demo purposes
          </p>
        </div>
      }
    >
      <div className="mb-4 rounded-xl bg-ink-50 p-4">
        <p className="text-xs text-ink-500">Amount due</p>
        <p className="text-2xl font-bold text-ink-900">{formatNaira(amount)}</p>
        <p className="mt-1 text-xs text-ink-500">{description}</p>
      </div>

      <p className="mb-2 text-sm font-medium text-ink-700">Payment method</p>
      <div className="space-y-2">
        {PAYMENT_METHODS.map((pm) => (
          <button
            key={pm.id}
            onClick={() => setMethod(pm.kind)}
            className={cn(
              "flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors",
              method === pm.kind ? "border-brand-600 bg-brand-50" : "border-ink-200 bg-white",
            )}
          >
            <span>
              <span className="block text-sm font-semibold text-ink-900">{pm.label}</span>
              <span className="text-xs text-ink-500">{pm.detail}</span>
            </span>
            <span
              className={cn(
                "flex h-5 w-5 items-center justify-center rounded-full border-2",
                method === pm.kind ? "border-brand-600 bg-brand-600" : "border-ink-300",
              )}
            >
              {method === pm.kind && <span className="h-2 w-2 rounded-full bg-white" />}
            </span>
          </button>
        ))}
      </div>

      {method === "ussd" && (
        <div className="mt-4 rounded-xl border border-ink-200 bg-white p-4 text-center">
          <p className="text-xs text-ink-500">Dial this code on your registered phone</p>
          <p className="mt-1 text-lg font-bold tracking-wider text-ink-900">{ussdCodeFor(amount)}</p>
          <Badge tone="warning" className="mt-2">
            Awaiting confirmation
          </Badge>
        </div>
      )}

      {method === "transfer" && (
        <div className="mt-4 rounded-xl border border-ink-200 bg-white p-4">
          <p className="text-xs text-ink-500">Transfer to this one-time account</p>
          <p className="mt-1 text-sm font-bold text-ink-900">9821 4477 03 · Wema Bank</p>
          <p className="text-xs text-ink-500">Naija EV Collections</p>
        </div>
      )}
    </Sheet>
  );
}