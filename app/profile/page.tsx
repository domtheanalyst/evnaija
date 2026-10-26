"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/ui/TopBar";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { useAuthStore } from "@/lib/store/authStore";
import { useCartStore } from "@/lib/store/cartStore";
import { logout as doLogout, updateProfile, saveVehicle } from "@/lib/services/auth";
import { formatNaira } from "@/lib/utils/currency";
import type { ConnectorType } from "@/lib/types";

const CONNECTORS: ConnectorType[] = ["Type2", "CCS2", "CHAdeMO", "GB/T"];

const LINKS = [
  { href: "/bookings", label: "My bookings", emoji: "📅" },
  { href: "/utilities/orders", label: "My orders", emoji: "📦" },
  { href: "/emergency", label: "Emergency rescue", emoji: "🚨" },
  { href: "/stations", label: "Find charging", emoji: "⚡" },
  { href: "/parking", label: "Find parking", emoji: "🅿️" },
];

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);
  const setUser = useAuthStore((s) => s.setUser);
  const clearCart = useCartStore((s) => s.clear);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [plate, setPlate] = useState("");
  const [connector, setConnector] = useState<ConnectorType>("CCS2");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setPhone(user.phone);
    setMake(user.vehicle?.make ?? "");
    setModel(user.vehicle?.model ?? "");
    setPlate(user.vehicle?.plate ?? "");
    setConnector(user.vehicle?.connectorType ?? "CCS2");
  }, [user]);

  if (!hydrated) {
    return (
      <>
        <TopBar title="Profile" />
        <div className="p-4">
          <Card>
            <div className="h-20 animate-pulse rounded-lg bg-ink-100" />
          </Card>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <TopBar title="Profile" />
        <div className="p-4">
          <EmptyState
            emoji="🔐"
            title="You're not signed in"
            description="Sign in to manage your profile, vehicles and bookings."
            actionLabel="Sign in"
            actionHref="/login?next=/profile"
          />
        </div>
      </>
    );
  }

  const save = async () => {
    setBusy(true);
    try {
      let updated = await updateProfile(user.id, { name, phone });
      if (make && model && plate) {
        updated = await saveVehicle(user.id, {
          make,
          model,
          year: user.vehicle?.year ?? new Date().getFullYear(),
          plate,
          connectorType: connector,
        });
      }
      setUser(updated);
      setEditing(false);
      toast("Profile updated", "success");
    } catch {
      toast("Could not save your changes", "error");
    } finally {
      setBusy(false);
    }
  };

  const signOut = async () => {
    await doLogout();
    setUser(null);
    clearCart();
    toast("Signed out", "info");
    router.push("/");
  };

  return (
    <>
      <TopBar title="Profile" />

      <div className="space-y-4 p-4">
        <Card>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-600 text-2xl font-bold text-white">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-lg font-bold text-ink-900">{user.name}</h2>
              <p className="truncate text-sm text-ink-500">{user.email}</p>
              <p className="text-sm text-ink-500">{user.phone}</p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between rounded-xl bg-brand-50 px-4 py-3">
            <div>
              <p className="text-xs font-medium text-brand-700">Wallet balance</p>
              <p className="text-lg font-bold text-brand-800">{formatNaira(user.walletBalance)}</p>
            </div>
            <Badge tone="brand">NaijaEV Pay</Badge>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-ink-900">My vehicle</h3>
            <button
              onClick={() => setEditing((v) => !v)}
              className="text-sm font-semibold text-brand-600"
            >
              {editing ? "Cancel" : "Edit"}
            </button>
          </div>

          {editing ? (
            <div className="mt-3 space-y-3">
              <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} />
              <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Make" value={make} onChange={(e) => setMake(e.target.value)} />
                <Input label="Model" value={model} onChange={(e) => setModel(e.target.value)} />
              </div>
              <Input label="Plate number" value={plate} onChange={(e) => setPlate(e.target.value)} />
              <Select
                label="Connector type"
                value={connector}
                onChange={(e) => setConnector(e.target.value as ConnectorType)}
              >
                {CONNECTORS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
              <Button fullWidth loading={busy} onClick={save}>
                Save changes
              </Button>
            </div>
          ) : user.vehicle ? (
            <div className="mt-3 space-y-2 text-sm">
              <Row label="Vehicle" value={`${user.vehicle.make} ${user.vehicle.model}`} />
              <Row label="Year" value={String(user.vehicle.year)} />
              <Row label="Plate" value={user.vehicle.plate} />
              <Row label="Connector" value={user.vehicle.connectorType} />
            </div>
          ) : (
            <p className="mt-3 text-sm text-ink-500">
              No vehicle saved yet. Add one to get tailored charging recommendations.
            </p>
          )}
        </Card>

        <Card>
          <div className="divide-y divide-ink-100">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="flex items-center gap-3 py-3">
                <span className="text-lg">{l.emoji}</span>
                <span className="flex-1 text-sm font-medium text-ink-800">{l.label}</span>
                <span className="text-ink-300">›</span>
              </Link>
            ))}
          </div>
        </Card>

        <Button variant="outline" fullWidth onClick={signOut}>
          Sign out
        </Button>

        <p className="text-center text-[11px] text-ink-400">
          NaijaEV · Demo build · Payments are simulated
        </p>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-500">{label}</span>
      <span className="font-medium text-ink-900">{value}</span>
    </div>
  );
}