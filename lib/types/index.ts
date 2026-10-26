export interface GeoPoint {
  lat: number;
  lng: number;
}

export type ConnectorType = "Type2" | "CCS2" | "CHAdeMO" | "GB/T";

export type ConnectorStatus = "available" | "occupied" | "offline";

export interface Connector {
  id: string;
  type: ConnectorType;
  powerKw: number;
  pricePerKwh: number;
  /** Optional flat session fee in NGN, if the operator charges one. */
  sessionFee?: number;
  status: ConnectorStatus;
  /** Total physical points of this connector at the station. */
  slots: number;
  /** How many of `slots` are currently free. */
  available: number;
}

export interface ChargingStation {
  id: string;
  name: string;
  operator: string;
  address: string;
  city: string;
  state: string;
  location: GeoPoint;
  connectors: Connector[];
  amenities: string[];
  rating: number;
  reviewCount: number;
  open24h: boolean;
  operatingHours: string;
  photos: string[];
}

export interface ParkingSpace {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  location: GeoPoint;
  pricePerHour: number;
  pricePerDay: number;
  totalSpaces: number;
  availableSpaces: number;
  features: string[];
  covered: boolean;
  security: boolean;
  hasEvCharging: boolean;
  rating: number;
  reviewCount: number;
  open24h: boolean;
}

export type BookingType = "charging" | "parking";

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "active"
  | "completed"
  | "cancelled";

export interface Booking {
  id: string;
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
  status: BookingStatus;
  paymentRef: string;
  accessCode: string;
  createdAt: string;
}

export type UtilityCategory =
  | "charging"
  | "maintenance"
  | "tyres"
  | "cleaning"
  | "accessories";

export interface UtilityProduct {
  id: string;
  name: string;
  category: UtilityCategory;
  price: number;
  unit: string;
  description: string;
  emoji: string;
  inStock: boolean;
  vendor: string;
  rating: number;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  unit: string;
  emoji: string;
  quantity: number;
  vendor: string;
}

export type OrderStatus =
  | "placed"
  | "confirmed"
  | "dispatched"
  | "delivered"
  | "cancelled";

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  deliveryAddress: string;
  location: GeoPoint;
  etaMins: number;
  paymentRef: string;
  createdAt: string;
}

export type EmergencyType =
  | "towing"
  | "jumpstart"
  | "flat-tyre"
  | "fuel"
  | "charging-rescue"
  | "accident";

export type EmergencyStatus =
  | "requested"
  | "assigned"
  | "en-route"
  | "arrived"
  | "completed"
  | "cancelled";

export interface Responder {
  id: string;
  name: string;
  company: string;
  phone: string;
  vehicle: string;
  rating: number;
  location: GeoPoint;
}

export interface EmergencyRequest {
  id: string;
  userId: string;
  type: EmergencyType;
  location: GeoPoint;
  address: string;
  notes: string;
  vehicle: string;
  status: EmergencyStatus;
  responder?: Responder;
  etaMins: number;
  paymentRef: string;
  createdAt: string;
}

export interface Vehicle {
  make: string;
  model: string;
  year: number;
  plate: string;
  connectorType: ConnectorType;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  vehicle?: Vehicle;
  walletBalance: number;
}

export interface PaymentMethod {
  id: string;
  label: string;
  kind: "card" | "transfer" | "ussd" | "wallet";
  detail: string;
}

export interface PaymentResult {
  success: boolean;
  reference: string;
  method: PaymentMethod["kind"];
  amount: number;
  message: string;
}