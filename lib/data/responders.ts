import type { EmergencyType, Responder } from "@/lib/types";

/** Seeded emergency responders across the covered cities. */
export const RESPONDERS: Responder[] = [
  {
    id: "rsp_lagos_01",
    name: "Emeka Okafor",
    company: "Lagos Rapid Rescue",
    phone: "+234 803 111 2233",
    vehicle: "Tow Truck — Flatbed",
    rating: 4.8,
    location: { lat: 6.4412, lng: 3.4102 },
  },
  {
    id: "rsp_lagos_02",
    name: "Aisha Bello",
    company: "Island Auto Assist",
    phone: "+234 805 444 7788",
    vehicle: "Mobile EV Service Van",
    rating: 4.9,
    location: { lat: 6.4551, lng: 3.3901 },
  },
  {
    id: "rsp_lagos_03",
    name: "Tunde Adeyemi",
    company: "Lekki Roadside Pros",
    phone: "+234 807 222 9911",
    vehicle: "Jump-Start & Tyre Unit",
    rating: 4.6,
    location: { lat: 6.4471, lng: 3.4812 },
  },
  {
    id: "rsp_abuja_01",
    name: "Grace Nwosu",
    company: "Abuja Emergency Motors",
    phone: "+234 809 333 4455",
    vehicle: "Tow Truck — Wheel Lift",
    rating: 4.7,
    location: { lat: 9.0721, lng: 7.4102 },
  },
  {
    id: "rsp_abuja_02",
    name: "Ibrahim Musa",
    company: "Capital City Rescue",
    phone: "+234 802 777 1122",
    vehicle: "Mobile Charging Unit",
    rating: 4.8,
    location: { lat: 9.0812, lng: 7.4891 },
  },
  {
    id: "rsp_ph_01",
    name: "Chidi Eze",
    company: "Rivers Rescue Services",
    phone: "+234 806 555 6677",
    vehicle: "Tow Truck — Flatbed",
    rating: 4.5,
    location: { lat: 4.8121, lng: 7.0402 },
  },
];

export const EMERGENCY_TYPES: {
  type: EmergencyType;
  label: string;
  description: string;
  emoji: string;
  baseFee: number;
  etaMins: number;
}[] = [
  {
    type: "towing",
    label: "Towing",
    description: "Vehicle immobilised or in an unsafe spot",
    emoji: "🚛",
    baseFee: 45000,
    etaMins: 35,
  },
  {
    type: "jumpstart",
    label: "Jump Start",
    description: "12V battery flat, vehicle won't start",
    emoji: "🔋",
    baseFee: 15000,
    etaMins: 20,
  },
  {
    type: "flat-tyre",
    label: "Flat Tyre",
    description: "Tyre change or roadside repair",
    emoji: "🛞",
    baseFee: 18000,
    etaMins: 25,
  },
  {
    type: "fuel",
    label: "Fuel Delivery",
    description: "Petrol or diesel delivered to you",
    emoji: "⛽",
    baseFee: 12000,
    etaMins: 30,
  },
  {
    type: "charging-rescue",
    label: "Charging Rescue",
    description: "Mobile charger for a depleted EV battery",
    emoji: "⚡",
    baseFee: 25000,
    etaMins: 30,
  },
  {
    type: "accident",
    label: "Accident Response",
    description: "Collision assistance and recovery",
    emoji: "🚨",
    baseFee: 60000,
    etaMins: 25,
  },
];

export function getEmergencyMeta(type: EmergencyType) {
  return EMERGENCY_TYPES.find((e) => e.type === type);
}

export function getResponderById(id: string): Responder | undefined {
  return RESPONDERS.find((r) => r.id === id);
}