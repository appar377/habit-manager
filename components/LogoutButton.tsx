"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "./ui/Button";

export default function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleLogout() {
    setPending(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      sessionStorage.removeItem("hm_user_bootstrap_done");
      router.replace("/login");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="rounded-[var(--radius-xl)] border-2 border-border bg-bg-muted p-4 shadow-[var(--shadow-card)] space-y-2">
      <h2 className="text-sm font-semibold text-foreground">アカウント</h2>
      <p className="text-xs text-fg-muted">ログアウトすると別の端末では同じデータを参照できません。</p>
      <Button variant="secondary" onClick={handleLogout} disabled={pending} className="mt-2">
        {pending ? "ログアウト中…" : "ログアウト"}
      </Button>
    </section>
  );
}
