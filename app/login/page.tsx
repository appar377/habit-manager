"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Label from "@/components/ui/Label";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "ログインに失敗しました");
        return;
      }
      sessionStorage.setItem("hm_user_bootstrap_done", "1");
      router.push("/plan");
      router.refresh();
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto pt-12 px-4">
      <h1 className="text-xl font-bold text-foreground mb-2">ログイン</h1>
      <p className="text-sm text-fg-muted mb-6">
        習慣・ログはアカウントに紐づいて保存されます。別のブラウザからも同じデータで利用できます。
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="text-sm text-danger bg-danger-soft/50 rounded-lg px-3 py-2" role="alert">
            {error}
          </p>
        )}
        <div>
          <Label htmlFor="login-email">メールアドレス</Label>
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="login-password">パスワード</Label>
          <Input
            id="login-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1"
          />
        </div>
        <Button type="submit" fullWidth disabled={pending}>
          {pending ? "ログイン中…" : "ログイン"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-fg-muted">
        アカウントをお持ちでない方は{" "}
        <Link href="/signup" className="text-primary font-medium underline">
          新規登録
        </Link>
      </p>
    </div>
  );
}
