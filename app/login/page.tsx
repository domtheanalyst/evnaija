"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { TopBar, BrandMark } from "@/components/ui/TopBar";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useAuthStore } from "@/lib/store/authStore";
import { DEMO_CREDENTIALS } from "@/lib/services/auth";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";
  const { toast } = useToast();
  const login = useAuthStore((s) => s.setUser);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { login: doLogin } = await import("@/lib/services/auth");
      const user = await doLogin(email, password);
      login(user);
      toast(`Welcome back, ${user.name.split(" ")[0]}`, "success");
      router.push(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign you in");
      setLoading(false);
    }
  };

  const useDemo = () => {
    setEmail(DEMO_CREDENTIALS.email);
    setPassword(DEMO_CREDENTIALS.password);
  };

  return (
    <>
      <TopBar title="" back />
      <div className="px-4 pt-2">
        <BrandMark />
        <h1 className="mt-6 text-2xl font-bold text-ink-900">Welcome back</h1>
        <p className="mt-1 text-sm text-ink-500">Sign in to book charging, parking and more.</p>

        <Card className="mt-6">
          <form onSubmit={submit} className="space-y-4">
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
              label="Password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button type="submit" fullWidth size="lg" loading={loading}>
              Sign in
            </Button>
          </form>

          <button
            type="button"
            onClick={useDemo}
            className="mt-4 w-full rounded-xl border border-dashed border-brand-300 bg-brand-50 px-4 py-3 text-left"
          >
            <span className="block text-xs font-semibold text-brand-700">Try the demo account</span>
            <span className="text-xs text-brand-600">
              {DEMO_CREDENTIALS.email} · {DEMO_CREDENTIALS.password}
            </span>
          </button>
        </Card>

        <p className="mt-6 text-center text-sm text-ink-500">
          New here?{" "}
          <Link href="/register" className="font-semibold text-brand-600">
            Create an account
          </Link>
        </p>
      </div>
    </>
  );
}