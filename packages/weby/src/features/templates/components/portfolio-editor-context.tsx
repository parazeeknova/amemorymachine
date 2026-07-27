import { useSyncExternalStore } from "react";
import { usePortfolioStore } from "../stores/portfolio-store";

export interface PortfolioEditorControls {
  handlePin: () => void;
  handleReset: () => void;
  isPinned: boolean;
  isSaving: boolean;
  onBack: () => void;
}

let controls: PortfolioEditorControls | null = null;
const listeners = new Set<() => void>();

const emit = () => {
  for (const fn of listeners) {
    fn();
  }
};

export const setPortfolioEditorControls = (c: PortfolioEditorControls | null) => {
  controls = c;
  emit();
};

const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};

const getSnapshot = () => controls;

export const usePortfolioEditorControls = () => useSyncExternalStore(subscribe, getSnapshot);
export { usePortfolioStore };
