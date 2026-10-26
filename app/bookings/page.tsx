"use client";

import { useEffect, useState } from "react";
import { TopBar } from "@/components/ui/TopBar";
import { Tabs } from "@/components/ui/Tabs";
import { ListSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { BookingCard } from "@/components/booking/BookingCard";
import { useAuthStore } from "@/lib/store/authStore";
import { listBookings, partitionBookings } from "@/lib/services/bookings";
import type { Booking } from "@/lib/types";

export default function BookingsPage() {
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    listBookings(user.id)
      .then((b) => !cancelled && setBookings(b))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [user, hydrated]);

  const { upcoming, past } = partitionBookings(bookings);
  const shown = tab === "upcoming" ? upcoming : past;

  return (
    <>
      <TopBar title="My bookings" subtitle={`${bookings.length} total`} />

      <div className="px-4 py-3">
        <Tabs
          active={tab}
          onChange={(v) => setTab(v as "upcoming" | "past")}
          items={[
            { id: "upcoming", label: `Upcoming (${upcoming.length})` },
            { id: "past", label: `Past (${past.length})` },
          ]}
        />
      </div>

      <div className="space-y-3 px-4 pb-4">
        {!hydrated || loading ? (
          <ListSkeleton count={3} />
        ) : !user ? (
          <EmptyState
            emoji="🔐"
            title="Sign in to see your bookings"
            description="Your charging and parking reservations will appear here."
            actionLabel="Sign in"
            actionHref="/login?next=/bookings"
          />
        ) : shown.length === 0 ? (
          <EmptyState
            emoji={tab === "upcoming" ? "📅" : "🗂️"}
            title={tab === "upcoming" ? "No upcoming bookings" : "No past bookings"}
            description={
              tab === "upcoming"
                ? "Book a charger or parking space to lock in your spot."
                : "Completed and cancelled bookings will show up here."
            }
            actionLabel={tab === "upcoming" ? "Find a charger" : undefined}
            actionHref={tab === "upcoming" ? "/stations" : undefined}
          />
        ) : (
          shown.map((b) => <BookingCard key={b.id} booking={b} />)
        )}
      </div>
    </>
  );
}