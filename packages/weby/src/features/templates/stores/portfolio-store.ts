import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { isDesktopApp } from "#/shared/lib/desktop";

const memoryStore = new Map<string, string>();
const inMemoryStorage = {
  getItem: (name: string) => memoryStore.get(name) ?? null,
  removeItem: (name: string) => {
    memoryStore.delete(name);
  },
  setItem: (name: string, value: string) => {
    memoryStore.set(name, value);
  },
};

const safeStorage = isDesktopApp()
  ? inMemoryStorage
  : {
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
}

interface PortfolioActions {
  setIsPinned: (v: boolean) => void;
  setIsGuideOpen: (v: boolean) => void;
  setIsHistoryOpen: (v: boolean) => void;
  addHistorySnapshot: (markdown: string) => void;
  clearHistory: () => void;
  reset: () => void;
}

const initialState: PortfolioState = {
  history: [],
  isGuideOpen: false,
  isHistoryOpen: false,
  isPinned: false,
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
      setIsGuideOpen: (v: boolean) => set({ isGuideOpen: v }),
      setIsHistoryOpen: (v: boolean) => set({ isHistoryOpen: v }),
      setIsPinned: (v: boolean) => set({ isPinned: v }),
    }),
    {
      name: "verso-portfolio-store",
      partialize: (state) => ({
        history: state.history,
      }),
      storage: createJSONStorage(() => safeStorage),
    },
  ),
);
