import { PRODUCTS } from "@/lib/data/products";
import { STORAGE_KEYS, readCollection, writeCollection } from "@/lib/services/db";
import type { CartItem, GeoPoint, Order, OrderStatus, UtilityCategory, UtilityProduct } from "@/lib/types";
import { makeId, makePaymentRef } from "@/lib/utils/id";
import { sleep } from "@/lib/utils/misc";

export const DELIVERY_FEE = 2500;
export const FREE_DELIVERY_THRESHOLD = 100000;

export async function listProducts(category?: UtilityCategory): Promise<UtilityProduct[]> {
  await sleep(300);
  if (!category) return PRODUCTS;
  return PRODUCTS.filter((p) => p.category === category);
}

export async function getProduct(id: string): Promise<UtilityProduct | null> {
  await sleep(150);
  return PRODUCTS.find((p) => p.id === id) ?? null;
}

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function deliveryFeeFor(subtotal: number): number {
  return subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
}

export function cartTotal(items: CartItem[]): number {
  const subtotal = cartSubtotal(items);
  return subtotal + deliveryFeeFor(subtotal);
}

export interface CreateOrderInput {
  userId: string;
  items: CartItem[];
  deliveryAddress: string;
  location: GeoPoint;
}

function allOrders(): Order[] {
  return readCollection<Order>(STORAGE_KEYS.orders);
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  await sleep(900);

  const subtotal = cartSubtotal(input.items);
  const deliveryFee = deliveryFeeFor(subtotal);

  const order: Order = {
    id: makeId("ord"),
    userId: input.userId,
    items: input.items,
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
    status: "placed",
    deliveryAddress: input.deliveryAddress,
    location: input.location,
    etaMins: 45,
    paymentRef: makePaymentRef(),
    createdAt: new Date().toISOString(),
  };

  writeCollection(STORAGE_KEYS.orders, [order, ...allOrders()]);
  return order;
}

export async function listOrders(userId: string): Promise<Order[]> {
  await sleep(300);
  return allOrders()
    .filter((o) => o.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getOrder(id: string): Promise<Order | null> {
  await sleep(200);
  return allOrders().find((o) => o.id === id) ?? null;
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order | null> {
  await sleep(250);
  const orders = allOrders();
  const index = orders.findIndex((o) => o.id === id);
  if (index === -1) return null;

  const updated: Order = { ...orders[index], status };
  const next = [...orders];
  next[index] = updated;
  writeCollection(STORAGE_KEYS.orders, next);
  return updated;
}

export const ORDER_FLOW: OrderStatus[] = ["placed", "confirmed", "dispatched", "delivered"];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  placed: "Order placed",
  confirmed: "Confirmed by vendor",
  dispatched: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};