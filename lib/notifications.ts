/**
 * 予定時刻のブラウザ通知（Web Notifications API）。
 * 予定ページで「今日」の時間指定タスクの開始時刻に通知を表示する。
 */

const NOTIFICATIONS_ENABLED_KEY = "habit-manager-notifications-enabled";

export function isNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) return "denied";
  return Notification.permission;
}

/** 通知の利用可否を localStorage から取得 */
export function getNotificationsEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(NOTIFICATIONS_ENABLED_KEY) === "true";
  } catch {
    return false;
  }
}

/** 通知の利用可否を localStorage に保存 */
export function setNotificationsEnabled(enabled: boolean): void {
  try {
    if (enabled) {
      window.localStorage.setItem(NOTIFICATIONS_ENABLED_KEY, "true");
    } else {
      window.localStorage.removeItem(NOTIFICATIONS_ENABLED_KEY);
    }
  } catch {
    // ignore
  }
}

/** 通知の許可をリクエスト。granted / denied を返す */
export function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) return Promise.resolve("denied");
  if (Notification.permission === "granted") return Promise.resolve("granted");
  if (Notification.permission === "denied") return Promise.resolve("denied");
  return Notification.requestPermission();
}

type TodoForNotify = { title: string; start: string };

/**
 * 指定日の予定開始時刻に通知をスケジュールする。
 * 日付は YYYY-MM-DD、開始は HH:MM（ローカル時刻）。
 * 戻り値はクリーンアップ関数（登録した setTimeout をすべて clear）。
 */
export function scheduleNotifications(
  date: string,
  todos: TodoForNotify[]
): () => void {
  const timeouts: ReturnType<typeof setTimeout>[] = [];
  const [y, m, d] = date.split("-").map(Number);
  if (Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) return () => {};

  const now = Date.now();

  for (const todo of todos) {
    const [h, min] = todo.start.split(":").map(Number);
    if (Number.isNaN(h) || Number.isNaN(min)) continue;
    const at = new Date(y, m - 1, d, h, min).getTime();
    const delayMs = at - now;
    if (delayMs <= 0) continue;

    const id = setTimeout(() => {
      if (getNotificationPermission() !== "granted") return;
      try {
        new Notification(`予定: ${todo.title}`, {
          body: `${todo.start} の予定です`,
          tag: `habit-${date}-${todo.start}`,
          requireInteraction: false,
        });
      } catch {
        // ignore
      }
    }, delayMs);
    timeouts.push(id);
  }

  return () => {
    timeouts.forEach((id) => clearTimeout(id));
  };
}
