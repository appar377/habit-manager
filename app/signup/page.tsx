"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Label from "@/components/ui/Label";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("パスワードは6文字以上にしてください");
      return;
    }
    setPending(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          displayName: displayName.trim() || "ユーザー",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "登録に失敗しました");
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
      <h1 className="text-xl font-bold text-foreground mb-2">新規登録</h1>
      <p className="text-sm text-fg-muted mb-6">
        メールアドレスとパスワードでアカウントを作成します。習慣データはこのアカウントに紐づき、どの端末からでも同じデータで利用できます。
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="text-sm text-danger bg-danger-soft/50 rounded-lg px-3 py-2" role="alert">
            {error}
          </p>
        )}
        <div>
          <Label htmlFor="signup-email">メールアドレス</Label>
          <Input
            id="signup-email"
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
          <Label htmlFor="signup-password">パスワード（6文字以上）</Label>
          <Input
            id="signup-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="signup-name">表示名（任意）</Label>
          <Input
            id="signup-name"
            type="text"
            autoComplete="name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="ユーザー"
            className="mt-1"
          />
        </div>
        <Button type="submit" fullWidth disabled={pending}>
          {pending ? "登録中…" : "登録する"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-fg-muted">
        すでにアカウントがある方は{" "}
        <Link href="/login" className="text-primary font-medium underline">
          ログイン
        </Link>
      </p>
    </div>
  );
}
