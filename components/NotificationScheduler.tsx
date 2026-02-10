"use client";

import { useEffect, useState, useCallback, useMemo, useSyncExternalStore } from "react";
import { todayStr } from "@/lib/utils";
import {
  isNotificationSupported,
  getNotificationPermission,
  getNotificationsEnabled,
  setNotificationsEnabled,
  requestNotificationPermission,
  scheduleNotifications,
} from "@/lib/notifications";

type TodoItem = { habitId: string; title: string; start: string; end: string };

type Props = {
  date: string;
  todosWithTime: TodoItem[];
};

export default function NotificationScheduler({ date, todosWithTime }: Props) {
  const [enabled, setEnabledState] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const supported = isClient && isNotificationSupported();
  const today = isClient ? todayStr() : null;

  const syncFromStorage = useCallback(() => {
    setEnabledState(getNotificationsEnabled());
    if (isNotificationSupported()) setPermission(getNotificationPermission());
  }, []);

  useEffect(() => {
    if (!isClient) return;
    queueMicrotask(syncFromStorage);
  }, [isClient, syncFromStorage]);

  useEffect(() => {
    if (!supported) return;
    queueMicrotask(() => setPermission(Notification.permission));
  }, [enabled, supported]);

  const handleToggle = useCallback(async () => {
    if (!isNotificationSupported()) return;
    if (!enabled) {
      const result = await requestNotificationPermission();
      setPermission(result);
      if (result === "granted") {
        setNotificationsEnabled(true);
        setEnabledState(true);
      }
    } else {
      setNotificationsEnabled(false);
      setEnabledState(false);
    }
  }, [enabled]);

  const isToday = today ? date === today : false;
  const todosForNotify = useMemo(
    () => todosWithTime.map((t) => ({ title: t.title, start: t.start })),
    [todosWithTime]
  );

  useEffect(() => {
    if (!enabled || !isToday || permission !== "granted" || todosForNotify.length === 0) {
      return () => {};
    }
    const cleanup = scheduleNotifications(date, todosForNotify);
    return cleanup;
  }, [enabled, isToday, permission, date, todosForNotify]);

  if (!isClient || !supported) return null;

  return (
    <div className="py-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-foreground">予定の時間に通知</span>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label={enabled ? "通知をオフにする" : "通知をオンにする"}
          onClick={handleToggle}
          disabled={permission === "denied"}
          className={`relative inline-flex h-7 w-12 shrink-0 rounded-full border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-50 ${
            enabled
              ? "border-primary bg-primary"
              : "border-border-strong bg-bg-muted"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition-transform ${
              enabled ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>
      {permission === "denied" && (
        <p className="text-xs text-fg-muted mt-1">
          通知がブロックされています。ブラウザの設定で「習慣管理」の通知を許可してください。
        </p>
      )}
    </div>
  );
}
