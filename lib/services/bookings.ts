import { STORAGE_KEYS, readCollection, writeCollection } from "@/lib/services/db";
import type { Booking, BookingStatus, BookingType, GeoPoint } from "@/lib/types";
import { makeAccessCode, makeId, makePaymentRef } from "@/lib/utils/id";
import { sleep } from "@/lib/utils/misc";

export interface CreateBookingInput {
  userId: string;
  type: BookingType;
  resourceId: string;
  resourceName: string;
  resourceAddress: string;
  location: GeoPoint;
  startTime: string;
  endTime: string;
  durationMins: number;
  connectorId?: string;
  connectorLabel?: string;
  estimatedKwh?: number;
  amount: number;
}

function allBookings(): Booking[] {
  return readCollection<Booking>(STORAGE_KEYS.bookings);
}

function persist(bookings: Booking[]): void {
  writeCollection(STORAGE_KEYS.bookings, bookings);
}

export async function createBooking(input: CreateBookingInput): Promise<Booking> {
  await sleep(900);

  const booking: Booking = {
    id: makeId("bk"),
    userId: input.userId,
    type: input.type,
    resourceId: input.resourceId,
    resourceName: input.resourceName,
    resourceAddress: input.resourceAddress,
    location: input.location,
    startTime: input.startTime,
    endTime: input.endTime,
    durationMins: input.durationMins,
    connectorId: input.connectorId,
    connectorLabel: input.connectorLabel,
    estimatedKwh: input.estimatedKwh,
    amount: input.amount,
    status: "confirmed",
    paymentRef: makePaymentRef(),
    accessCode: makeAccessCode(),
    createdAt: new Date().toISOString(),
  };

  persist([booking, ...allBookings()]);
  return booking;
}

export async function listBookings(userId: string): Promise<Booking[]> {
  await sleep(300);
  return allBookings()
    .filter((b) => b.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getBooking(id: string): Promise<Booking | null> {
  await sleep(200);
  return allBookings().find((b) => b.id === id) ?? null;
}

export async function updateBookingStatus(id: string, status: BookingStatus): Promise<Booking | null> {
  await sleep(300);
  const bookings = allBookings();
  const index = bookings.findIndex((b) => b.id === id);
  if (index === -1) return null;

  const updated: Booking = { ...bookings[index], status };
  const next = [...bookings];
  next[index] = updated;
  persist(next);
  return updated;
}

export async function cancelBooking(id: string): Promise<Booking | null> {
  return updateBookingStatus(id, "cancelled");
}

/** Split bookings into upcoming and past for the My Bookings tabs. */
export function partitionBookings(bookings: Booking[]): {
  upcoming: Booking[];
  past: Booking[];
} {
  const now = Date.now();
  const upcoming: Booking[] = [];
  const past: Booking[] = [];

  bookings.forEach((b) => {
    const isFuture = new Date(b.endTime).getTime() >= now;
    const isLive = b.status === "confirmed" || b.status === "active" || b.status === "pending";
    if (isFuture && isLive) upcoming.push(b);
    else past.push(b);
  });

  upcoming.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  return { upcoming, past };
}