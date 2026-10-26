import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils/misc";

const FIELD =
  "w-full rounded-xl border border-ink-300 bg-white px-3.5 py-3 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:bg-ink-50";

interface FieldWrapProps {
  label?: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}

function FieldWrap({ label, hint, error, children }: FieldWrapProps) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-medium text-ink-700">{label}</span>}
      {children}
      {error ? (
        <span className="mt-1 block text-xs text-red-600">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-xs text-ink-400">{hint}</span>
      ) : null}
    </label>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export function Input({ label, hint, error, className, ...rest }: InputProps) {
  return (
    <FieldWrap label={label} hint={hint} error={error}>
      <input className={cn(FIELD, error && "border-red-400", className)} {...rest} />
    </FieldWrap>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export function Textarea({ label, hint, error, className, ...rest }: TextareaProps) {
  return (
    <FieldWrap label={label} hint={hint} error={error}>
      <textarea className={cn(FIELD, "min-h-24 resize-y", error && "border-red-400", className)} {...rest} />
    </FieldWrap>
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export function Select({ label, hint, error, className, children, ...rest }: SelectProps) {
  return (
    <FieldWrap label={label} hint={hint} error={error}>
      <select className={cn(FIELD, "appearance-none pr-9", error && "border-red-400", className)} {...rest}>
        {children}
      </select>
    </FieldWrap>
  );
}