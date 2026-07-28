import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const safeStorage = {
  getItem: (name: string) => {
    try {
      return localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  removeItem: (name: string) => {
    try {
      localStorage.removeItem(name);
    } catch {
      /* unavailable */
    }
  },
  setItem: (name: string, value: string) => {
    try {
      localStorage.setItem(name, value);
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
  history: TemplateSnapshot[];
  draft: string | null;
  lastSavedMarkdown: string | null;
}

interface PortfolioActions {
  setIsPinned: (v: boolean) => void;
  setIsGuideOpen: (v: boolean) => void;
  setIsHistoryOpen: (v: boolean) => void;
  addHistorySnapshot: (markdown: string) => void;
  clearHistory: () => void;
  setDraft: (markdown: string | null) => void;
  setLastSavedMarkdown: (markdown: string | null) => void;
  reset: () => void;
}

const initialState: PortfolioState = {
  draft: null,
  history: [],
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
      storage: createJSONStorage(() => safeStorage),
    },
  ),
);
