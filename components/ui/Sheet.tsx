"use client";

import { useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils/misc";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

/** Bottom sheet used for booking, filters and payment flows. */
export function Sheet({ open, onClose, title, children, footer, className }: SheetProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 animate-fade-in bg-ink-900/50"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "relative z-10 max-h-[90vh] w-full max-w-lg animate-slide-up overflow-y-auto rounded-t-3xl bg-white shadow-sheet",
          className,
        )}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-ink-100 bg-white px-5 py-4">
          <div className="absolute left-1/2 top-2 h-1 w-10 -translate-x-1/2 rounded-full bg-ink-200" />
          <h2 className="mt-2 text-base font-semibold text-ink-900">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="mt-2 rounded-full p-1.5 text-ink-500 hover:bg-ink-100"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="px-5 py-4">{children}</div>

        {footer && (
          <div className="sticky bottom-0 border-t border-ink-100 bg-white px-5 py-4">{footer}</div>
        )}
      </div>
    </div>
  );
}