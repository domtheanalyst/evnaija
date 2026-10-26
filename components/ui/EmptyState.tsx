import type { ReactNode } from "react";
import { LinkButton } from "@/components/ui/Button";

interface EmptyStateProps {
  emoji?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  children?: ReactNode;
}

export function EmptyState({
  emoji = "🔍",
  title,
  description,
  actionLabel,
  actionHref,
  children,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink-300 bg-white px-6 py-12 text-center">
      <span className="text-4xl" aria-hidden>
        {emoji}
      </span>
      <h3 className="mt-3 text-base font-semibold text-ink-900">{title}</h3>
      {description && <p className="mt-1 max-w-xs text-sm text-ink-500">{description}</p>}
      {actionLabel && actionHref && (
        <LinkButton href={actionHref} size="sm" className="mt-4">
          {actionLabel}
        </LinkButton>
      )}
      {children}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description,
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center">
      <span className="text-3xl" aria-hidden>
        ⚠️
      </span>
      <h3 className="mt-3 text-base font-semibold text-red-800">{title}</h3>
      {description && <p className="mt-1 max-w-xs text-sm text-red-600">{description}</p>}
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
        >
          Try again
        </button>
      )}
    </div>
  );
}