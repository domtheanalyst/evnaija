"use client";

import { useEffect, useState } from "react";

/**
 * Ticks every second and returns the remaining seconds until `targetIso`.
 * Used for ETA countdowns on emergency and order tracking screens.
 */
export function useCountdown(targetIso: string | null | undefined): number {
  const [remaining, setRemaining] = useState(() => computeRemaining(targetIso));

  useEffect(() => {
    setRemaining(computeRemaining(targetIso));
    if (!targetIso) return;

    const id = window.setInterval(() => {
      setRemaining(computeRemaining(targetIso));
    }, 1000);

    return () => window.clearInterval(id);
  }, [targetIso]);

  return remaining;
}

function computeRemaining(targetIso: string | null | undefined): number {
  if (!targetIso) return 0;
  const diff = new Date(targetIso).getTime() - Date.now();
  return Math.max(0, Math.round(diff / 1000));
}