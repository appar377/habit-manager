export type TutorialState = {
  seen: boolean;
  hidden: boolean;
  checks: Record<string, boolean>;
};

export const TUTORIAL_STORAGE_KEY = "habit-manager-tutorial";
export const TUTORIAL_STORAGE_EVENT = "habit-manager-tutorial-change";

const DEFAULT_STATE: TutorialState = {
  seen: false,
  hidden: false,
  checks: {},
};

let cachedRaw: string | null = null;
let cachedState: TutorialState = DEFAULT_STATE;

export function readTutorialState(): TutorialState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(TUTORIAL_STORAGE_KEY);
    if (raw === cachedRaw) return cachedState;
    cachedRaw = raw;
    if (!raw) {
      cachedState = DEFAULT_STATE;
      return cachedState;
    }
    const parsed = JSON.parse(raw) as TutorialState;
    cachedState = {
      seen: !!parsed.seen,
      hidden: !!parsed.hidden,
      checks: parsed.checks ?? {},
    };
    return cachedState;
  } catch {
    cachedRaw = null;
    cachedState = DEFAULT_STATE;
    return cachedState;
  }
}

export function writeTutorialState(next: TutorialState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(TUTORIAL_STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(TUTORIAL_STORAGE_EVENT));
  } catch {
    // ignore
  }
}

export function subscribeTutorial(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(TUTORIAL_STORAGE_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(TUTORIAL_STORAGE_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function openTutorial() {
  const state = readTutorialState();
  writeTutorialState({ ...state, hidden: false, seen: true });
}
