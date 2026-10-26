import { RESPONDERS, getEmergencyMeta } from "@/lib/data/responders";
import { STORAGE_KEYS, readCollection, writeCollection } from "@/lib/services/db";
import type { EmergencyRequest, EmergencyStatus, EmergencyType, GeoPoint, Responder } from "@/lib/types";
import { haversineKm } from "@/lib/utils/geo";
import { makeId, makePaymentRef } from "@/lib/utils/id";
import { sleep } from "@/lib/utils/misc";

export interface CreateEmergencyInput {
  userId: string;
  type: EmergencyType;
  location: GeoPoint;
  address: string;
  notes: string;
  vehicle: string;
}

function allRequests(): EmergencyRequest[] {
  return readCollection<EmergencyRequest>(STORAGE_KEYS.emergency);
}

function persist(requests: EmergencyRequest[]): void {
  writeCollection(STORAGE_KEYS.emergency, requests);
}

/** Pick the closest responder to the incident. */
export function nearestResponder(location: GeoPoint): Responder {
  return [...RESPONDERS].sort(
    (a, b) => haversineKm(location, a.location) - haversineKm(location, b.location),
  )[0];
}

export async function createEmergencyRequest(input: CreateEmergencyInput): Promise<EmergencyRequest> {
  await sleep(800);

  const meta = getEmergencyMeta(input.type);
  const responder = nearestResponder(input.location);

  const request: EmergencyRequest = {
    id: makeId("emg"),
    userId: input.userId,
    type: input.type,
    location: input.location,
    address: input.address,
    notes: input.notes,
    vehicle: input.vehicle,
    status: "requested",
    responder,
    etaMins: meta?.etaMins ?? 30,
    paymentRef: makePaymentRef(),
    createdAt: new Date().toISOString(),
  };

  persist([request, ...allRequests()]);
  return request;
}

export async function listEmergencyRequests(userId: string): Promise<EmergencyRequest[]> {
  await sleep(300);
  return allRequests()
    .filter((r) => r.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getEmergencyRequest(id: string): Promise<EmergencyRequest | null> {
  await sleep(200);
  return allRequests().find((r) => r.id === id) ?? null;
}

export async function updateEmergencyStatus(
  id: string,
  status: EmergencyStatus,
): Promise<EmergencyRequest | null> {
  await sleep(250);
  const requests = allRequests();
  const index = requests.findIndex((r) => r.id === id);
  if (index === -1) return null;

  const updated: EmergencyRequest = { ...requests[index], status };
  const next = [...requests];
  next[index] = updated;
  persist(next);
  return updated;
}

export async function cancelEmergencyRequest(id: string): Promise<EmergencyRequest | null> {
  return updateEmergencyStatus(id, "cancelled");
}

/** Ordered lifecycle used to drive the live status timeline. */
export const EMERGENCY_FLOW: EmergencyStatus[] = [
  "requested",
  "assigned",
  "en-route",
  "arrived",
  "completed",
];

export const EMERGENCY_STATUS_LABELS: Record<EmergencyStatus, string> = {
  requested: "Request received",
  assigned: "Responder assigned",
  "en-route": "Responder en route",
  arrived: "Responder arrived",
  completed: "Job completed",
  cancelled: "Request cancelled",
};

export const EMERGENCY_STATUS_DESCRIPTIONS: Record<EmergencyStatus, string> = {
  requested: "We are finding the closest available responder to you.",
  assigned: "A responder has accepted your request and is preparing to move.",
  "en-route": "Your responder is on the way. Track their ETA below.",
  arrived: "Your responder has arrived at your location.",
  completed: "Service completed. Thank you for using Naija EV Assist.",
  cancelled: "This request was cancelled.",
};