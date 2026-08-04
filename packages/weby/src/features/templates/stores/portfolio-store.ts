import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { get as idbGet, set as idbSet, del as idbDel } from "idb-keyval";

// Async IndexedDB storage for Zustand persist middleware.
// Uses idb-keyval (battle-tested wrapper) over native IndexedDB —
// non-blocking, no size limit, survives native app restarts.
const indexedDBStorage = {
  getItem: async (name: string) => {
    try {
      const value = await idbGet(name);
      return value ?? null;
    } catch {
      return null;
    }
  },
  removeItem: async (name: string) => {
    try {
      await idbDel(name);
    } catch {
      /* unavailable */
    }
  },
  setItem: async (name: string, value: string) => {
    try {
      await idbSet(name, value);
    } catch {
      /* unavailable */
    }
  },
};

export interface TemplateSnapshot {
  id: string;
  markdown: string;
  timestamp: number;
}

interface PortfolioState {
  isPinned: boolean;
  isGuideOpen: boolean;
  isHistoryOpen: boolean;
  isGithubConfigOpen: boolean;
  isCfConfigOpen: boolean;
  history: TemplateSnapshot[];
  draft: string | null;
  lastSavedMarkdown: string | null;
}

interface PortfolioActions {
  setIsPinned: (v: boolean) => void;
  setIsGuideOpen: (v: boolean) => void;
  setIsHistoryOpen: (v: boolean) => void;
  setIsGithubConfigOpen: (v: boolean) => void;
  setIsCfConfigOpen: (v: boolean) => void;
  addHistorySnapshot: (markdown: string) => void;
  clearHistory: () => void;
  setDraft: (markdown: string | null) => void;
  setLastSavedMarkdown: (markdown: string | null) => void;
  reset: () => void;
}

const initialState: PortfolioState = {
  draft: null,
  history: [],
  isCfConfigOpen: false,
  isGithubConfigOpen: false,
  isGuideOpen: false,
  isHistoryOpen: false,
  isPinned: false,
  lastSavedMarkdown: null,
};

export const usePortfolioStore = create<PortfolioState & PortfolioActions>()(
  persist(
    (set) => ({
      ...initialState,
      addHistorySnapshot: (markdown: string) =>
        set((s) => ({
          history: [
            {
              id: crypto.randomUUID(),
              markdown,
              timestamp: Date.now(),
            },
            ...s.history,
          ].slice(0, 50),
        })),
      clearHistory: () => set({ history: [] }),
      reset: () => set(initialState),
      setDraft: (markdown: string | null) => set({ draft: markdown }),
      setIsCfConfigOpen: (v: boolean) => set({ isCfConfigOpen: v }),
      setIsGithubConfigOpen: (v: boolean) => set({ isGithubConfigOpen: v }),
      setIsGuideOpen: (v: boolean) => set({ isGuideOpen: v }),
      setIsHistoryOpen: (v: boolean) => set({ isHistoryOpen: v }),
      setIsPinned: (v: boolean) => set({ isPinned: v }),
      setLastSavedMarkdown: (markdown: string | null) => set({ lastSavedMarkdown: markdown }),
    }),
    {
      name: "verso-portfolio-store",
      partialize: (state) => ({
        draft: state.draft,
        history: state.history,
        lastSavedMarkdown: state.lastSavedMarkdown,
      }),
      storage: createJSONStorage(() => indexedDBStorage),
    },
  ),
);
