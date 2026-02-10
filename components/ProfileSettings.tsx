"use client";

import { useSyncExternalStore } from "react";
import Input from "./ui/Input";
import Label from "./ui/Label";
import { readProfileState, subscribeProfile, writeProfileState } from "@/lib/profile";

export default function ProfileSettings() {
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const profile = useSyncExternalStore(subscribeProfile, readProfileState, () => ({ name: "" }));

  if (!isClient) return null;

  return (
    <section className="rounded-[var(--radius-xl)] border-2 border-border bg-bg-muted p-4 shadow-[var(--shadow-card)] space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-foreground">プロフィール</h2>
        <p className="text-xs text-fg-muted">表示名はランキングやフレンド表示に使われます。</p>
      </div>
      <div>
        <Label>表示名</Label>
        <Input
          type="text"
          value={profile.name}
          onChange={(e) => writeProfileState({ name: e.target.value })}
          placeholder="あなたの名前"
        />
      </div>
    </section>
  );
}
