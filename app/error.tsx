"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <span className="text-5xl">⚠️</span>
      <h1 className="mt-4 text-xl font-bold text-ink-900">Something went wrong</h1>
      <p className="mt-2 text-sm text-ink-500">
        {error.message || "An unexpected error occurred. Please try again."}
      </p>
      <div className="mt-6 flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <Link href="/">
          <Button variant="outline">Go home</Button>
        </Link>
      </div>
    </div>
  );
}