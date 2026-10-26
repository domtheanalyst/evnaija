export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-NG", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(iso: string): string {
  return `${formatDate(iso)} · ${formatTime(iso)}`;
}

/** "in 12 mins" / "3 hours ago" style relative label. */
export function formatRelative(iso: string): string {
  const diffMs = new Date(iso).getTime() - Date.now();
  const mins = Math.round(diffMs / 60000);
  const abs = Math.abs(mins);

  if (abs < 1) return "just now";
  if (abs < 60) return mins > 0 ? `in ${abs} mins` : `${abs} mins ago`;

  const hours = Math.round(abs / 60);
  if (hours < 24) return mins > 0 ? `in ${hours} hr` : `${hours} hr ago`;

  const days = Math.round(hours / 24);
  return mins > 0 ? `in ${days} day${days > 1 ? "s" : ""}` : `${days} day${days > 1 ? "s" : ""} ago`;
}

export function formatDuration(mins: number): string {
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`;
}

/** mm:ss countdown label from a number of seconds. */
export function formatCountdown(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${String(m).padStart(2, "0")}:${String(rem).padStart(2, "0")}`;
}

export function addMinutes(date: Date, mins: number): Date {
  return new Date(date.getTime() + mins * 60000);
}

/** Round a date up to the next 15-minute boundary. */
export function roundUpToQuarter(date: Date): Date {
  const ms = 15 * 60000;
  return new Date(Math.ceil(date.getTime() / ms) * ms);
}