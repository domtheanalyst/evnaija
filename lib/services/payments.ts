import type { PaymentMethod, PaymentResult } from "@/lib/types";
import { makePaymentRef } from "@/lib/utils/id";
import { sleep } from "@/lib/utils/misc";

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "pm_card",
    label: "Debit / Credit Card",
    kind: "card",
    detail: "Visa, Mastercard, Verve",
  },
  {
    id: "pm_transfer",
    label: "Bank Transfer",
    kind: "transfer",
    detail: "Instant NIBSS transfer",
  },
  {
    id: "pm_ussd",
    label: "USSD",
    kind: "ussd",
    detail: "*737# and other bank codes",
  },
  {
    id: "pm_wallet",
    label: "Naija EV Wallet",
    kind: "wallet",
    detail: "Pay from your in-app balance",
  },
];

/**
 * Simulated Paystack-style charge. Always succeeds unless the amount is
 * non-positive, so the happy path is easy to demo.
 */
export async function charge(input: {
  amount: number;
  method: PaymentMethod["kind"];
  description: string;
}): Promise<PaymentResult> {
  await sleep(1400);

  if (input.amount <= 0) {
    return {
      success: false,
      reference: makePaymentRef(),
      method: input.method,
      amount: input.amount,
      message: "Invalid amount.",
    };
  }

  return {
    success: true,
    reference: makePaymentRef(),
    method: input.method,
    amount: input.amount,
    message: `Payment of ₦${input.amount.toLocaleString("en-NG")} successful.`,
  };
}

/** Simulated USSD push — returns the code the user would dial. */
export function ussdCodeFor(amount: number): string {
  return `*737*1*${amount}*4821#`;
}