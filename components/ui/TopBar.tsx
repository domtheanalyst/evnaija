"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/misc";

interface TopBarProps {
  title: string;
  subtitle?: string;
  back?: boolean;
  right?: ReactNode;
  transparent?: boolean;
}

export function TopBar({ title, subtitle, back, right, transparent }: TopBarProps) {
  const router = useRouter();

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex items-center gap-3 px-4 py-3",
        transparent ? "bg-transparent" : "border-b border-ink-100 bg-white/95 backdrop-blur",
      )}
    >
      {back && (
        <button
          onClick={() => router.back()}
          aria-label="Go back"
          className="-ml-1 rounded-full p-2 text-ink-700 hover:bg-ink-100"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}

      <div className="min-w-0 flex-1">
        <h1 className="truncate text-lg font-bold text-ink-900">{title}</h1>
        {subtitle && <p className="truncate text-xs text-ink-500">{subtitle}</p>}
      </div>

      {right}
    </header>
  );
}

export function BrandMark({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-600 text-white">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
        </svg>
      </span>
      <span className="text-base font-extrabold tracking-tight text-ink-900">
        Naija<span className="text-brand-600">EV</span>
      </span>
    </Link>
  );
}