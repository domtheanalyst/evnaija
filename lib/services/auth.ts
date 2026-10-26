import { STORAGE_KEYS, readCollection, readValue, removeValue, writeCollection, writeValue } from "@/lib/services/db";
import type { User, Vehicle } from "@/lib/types";
import { makeId } from "@/lib/utils/id";
import { sleep } from "@/lib/utils/misc";

interface StoredUser extends User {
  password: string;
}

const DEMO_USER: StoredUser = {
  id: "usr_demo",
  name: "Demo Driver",
  email: "demo@evnaija.ng",
  phone: "+234 801 234 5678",
  password: "password",
  walletBalance: 25000,
  vehicle: {
    make: "BYD",
    model: "Atto 3",
    year: 2024,
    plate: "LAG-482-EV",
    connectorType: "CCS2",
  },
};

function seedUsers(): StoredUser[] {
  const existing = readCollection<StoredUser>(STORAGE_KEYS.users);
  if (existing.length > 0) return existing;
  writeCollection(STORAGE_KEYS.users, [DEMO_USER]);
  return [DEMO_USER];
}

function toPublicUser(user: StoredUser): User {
  const { password: _password, ...rest } = user;
  return rest;
}

export async function login(email: string, password: string): Promise<User> {
  await sleep(600);
  const users = seedUsers();
  const found = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());

  if (!found) throw new Error("No account found with that email address.");
  if (found.password !== password) throw new Error("Incorrect password. Please try again.");

  const user = toPublicUser(found);
  writeValue(STORAGE_KEYS.session, user);
  return user;
}

export async function register(input: {
  name: string;
  email: string;
  phone: string;
  password: string;
}): Promise<User> {
  await sleep(700);
  const users = seedUsers();

  if (users.some((u) => u.email.toLowerCase() === input.email.trim().toLowerCase())) {
    throw new Error("An account with that email already exists.");
  }

  const newUser: StoredUser = {
    id: makeId("usr"),
    name: input.name.trim(),
    email: input.email.trim(),
    phone: input.phone.trim(),
    password: input.password,
    walletBalance: 0,
  };

  writeCollection(STORAGE_KEYS.users, [...users, newUser]);

  const user = toPublicUser(newUser);
  writeValue(STORAGE_KEYS.session, user);
  return user;
}

export async function logout(): Promise<void> {
  await sleep(150);
  removeValue(STORAGE_KEYS.session);
}

export function getSession(): User | null {
  return readValue<User | null>(STORAGE_KEYS.session, null);
}

export async function updateProfile(userId: string, patch: Partial<User>): Promise<User> {
  await sleep(400);
  const users = seedUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index === -1) throw new Error("User not found.");

  const updated: StoredUser = { ...users[index], ...patch };
  const next = [...users];
  next[index] = updated;
  writeCollection(STORAGE_KEYS.users, next);

  const user = toPublicUser(updated);
  writeValue(STORAGE_KEYS.session, user);
  return user;
}

export async function saveVehicle(userId: string, vehicle: Vehicle): Promise<User> {
  return updateProfile(userId, { vehicle });
}

export const DEMO_CREDENTIALS = {
  email: DEMO_USER.email,
  password: DEMO_USER.password,
};