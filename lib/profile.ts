export type ProfileState = {
  name: string;
};

export const PROFILE_STORAGE_KEY = "habit-manager-profile";
export const PROFILE_STORAGE_EVENT = "habit-manager-profile-change";

const DEFAULT_STATE: ProfileState = {
  name: "",
};

let cachedRaw: string | null = null;
let cachedState: ProfileState = DEFAULT_STATE;

export function readProfileState(): ProfileState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    if (raw === cachedRaw) return cachedState;
    cachedRaw = raw;
    if (!raw) {
      cachedState = DEFAULT_STATE;
      return cachedState;
    }
    const parsed = JSON.parse(raw) as ProfileState;
    cachedState = {
      name: typeof parsed.name === "string" ? parsed.name : "",
    };
    return cachedState;
  } catch {
    cachedRaw = null;
    cachedState = DEFAULT_STATE;
    return cachedState;
  }
}

export function writeProfileState(next: ProfileState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(PROFILE_STORAGE_EVENT));
  } catch {
    // ignore
  }
}

export function subscribeProfile(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(PROFILE_STORAGE_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(PROFILE_STORAGE_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}
