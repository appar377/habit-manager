export type CommunityAuth = {
  userId: string;
  secret: string;
  friendCode: string;
};

const KEY = "habit-manager-community-auth";
const EVENT = "habit-manager-community-auth-change";

export function getCommunityAuth(): CommunityAuth | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CommunityAuth;
    if (!parsed.userId || !parsed.secret || !parsed.friendCode) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function setCommunityAuth(auth: CommunityAuth) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(auth));
  window.dispatchEvent(new Event(EVENT));
}

export function clearCommunityAuth() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
  window.dispatchEvent(new Event(EVENT));
}

export function subscribeCommunityAuth(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}
