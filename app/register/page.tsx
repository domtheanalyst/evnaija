"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TopBar, BrandMark } from "@/components/ui/TopBar";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useAuthStore } from "@/lib/store/authStore";
import { register } from "@/lib/services/auth";

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const setUser = useAuthStore((s) => s.setUser);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = await register({ name, email, phone, password });
      setUser(user);
      toast("Account created. Welcome to NaijaEV!", "success");
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create your account");
      setLoading(false);
    }
  };

  return (
    <>
      <TopBar title="" back />
      <div className="px-4 pt-2">
        <BrandMark />
        <h1 className="mt-6 text-2xl font-bold text-ink-900">Create your account</h1>
        <p className="mt-1 text-sm text-ink-500">
          Book chargers, reserve parking and order car utilities.
        </p>

        <Card className="mt-6">
          <form onSubmit={submit} className="space-y-4">
            <Input
              label="Full name"
              placeholder="Ada Okafor"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Phone"
              type="tel"
              placeholder="0803 000 0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button type="submit" fullWidth size="lg" loading={loading}>
              Create account
            </Button>
          </form>
        </Card>

        <p className="mt-6 text-center text-sm text-ink-500">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-brand-600">
            Sign in
          </Link>
        </p>
      </div>
    </>
  );
}