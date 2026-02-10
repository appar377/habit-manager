"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Button from "./ui/Button";
import Input from "./ui/Input";
import Label from "./ui/Label";
import {
  getCommunityAuth,
  setCommunityAuth,
  subscribeCommunityAuth,
  type CommunityAuth,
} from "@/lib/community-client";
import { readProfileState, subscribeProfile } from "@/lib/profile";

type Props = {
  onConnected?: () => void;
};

export default function CommunitySettings({ onConnected }: Props) {
  const profile = useSyncExternalStore(subscribeProfile, readProfileState, () => ({ name: "" }));
  const auth = useSyncExternalStore(subscribeCommunityAuth, getCommunityAuth, () => null);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "done">("idle");
  const [friendCodeInput, setFriendCodeInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function register() {
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch("/api/community/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: profile.name || "ユーザー" }),
      });
      if (!res.ok) throw new Error("register_failed");
      const data = (await res.json()) as CommunityAuth & { displayName: string };
      setCommunityAuth({ userId: data.userId, secret: data.secret, friendCode: data.friendCode });
      setStatus("done");
      onConnected?.();
    } catch {
      setStatus("error");
      setError("コミュニティに参加できませんでした。");
    }
  }

  async function syncProfile() {
    if (!auth) return;
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch("/api/community/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: auth.userId, secret: auth.secret, displayName: profile.name || "ユーザー" }),
      });
      if (!res.ok) throw new Error("sync_failed");
      setStatus("done");
    } catch {
      setStatus("error");
      setError("同期に失敗しました。");
    }
  }

  async function addFriend() {
    if (!auth || !friendCodeInput.trim()) return;
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch("/api/community/add-friend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: auth.userId,
          secret: auth.secret,
          friendCode: friendCodeInput.trim(),
        }),
      });
      if (!res.ok) throw new Error("add_failed");
      setFriendCodeInput("");
      setStatus("done");
    } catch {
      setStatus("error");
      setError("フレンドコードが見つかりませんでした。");
    }
  }

  useEffect(() => {
    if (auth) {
      void syncProfile();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.userId]);

  if (!auth) {
    return (
      <section className="rounded-[var(--radius-xl)] border-2 border-border bg-bg-muted p-4 shadow-[var(--shadow-card)] space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">コミュニティ</h2>
          <p className="text-xs text-fg-muted">ランキングやフレンド機能を使うには参加が必要です。</p>
        </div>
        {error && <p className="text-xs text-danger">{error}</p>}
        <Button onClick={register} disabled={status === "loading"}>
          {status === "loading" ? "接続中…" : "コミュニティに参加する"}
        </Button>
      </section>
    );
  }

  return (
    <section className="rounded-[var(--radius-xl)] border-2 border-border bg-bg-muted p-4 shadow-[var(--shadow-card)] space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-foreground">コミュニティ</h2>
        <p className="text-xs text-fg-muted">ランキング用のプロフィールとフレンド管理。</p>
      </div>

      <div className="rounded-[var(--radius-lg)] border border-border bg-bg-subtle p-3 space-y-2">
        <Label>あなたのフレンドコード</Label>
        <div className="flex items-center gap-2">
          <Input value={auth.friendCode} readOnly />
          <Button
            variant="secondary"
            className="min-h-[36px] px-3 text-xs"
            onClick={() => navigator.clipboard.writeText(auth.friendCode)}
          >
            コピー
          </Button>
        </div>
        <Button variant="ghost" className="min-h-[32px] px-2 text-xs" onClick={syncProfile}>
          {status === "loading" ? "同期中…" : "最新の成績を同期"}
        </Button>
      </div>

      <div className="rounded-[var(--radius-lg)] border border-border bg-bg-subtle p-3 space-y-2">
        <Label>フレンドコードで追加</Label>
        <div className="flex items-center gap-2">
          <Input
            value={friendCodeInput}
            onChange={(e) => setFriendCodeInput(e.target.value)}
            placeholder="例: 8AB3K9QZ"
          />
          <Button variant="secondary" className="min-h-[36px] px-3 text-xs" onClick={addFriend}>
            追加
          </Button>
        </div>
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    </section>
  );
}
