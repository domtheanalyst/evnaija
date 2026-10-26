import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/misc";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padded?: boolean;
}

export function Card({ children, padded = true, className, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-ink-200 bg-white shadow-card",
        padded && "p-4",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mb-3 flex items-start justify-between gap-3", className)}>{children}</div>;
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <h3 className={cn("text-base font-semibold text-ink-900", className)}>{children}</h3>;
}

export function CardSubtitle({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("text-sm text-ink-500", className)}>{children}</p>;
}