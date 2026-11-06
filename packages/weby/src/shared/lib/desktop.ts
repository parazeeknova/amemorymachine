import { useSyncExternalStore } from "react";

export const isDesktopApp = (): boolean => {
  if (typeof window === "undefined") {
    return false;
  }
  const win = window as unknown as Record<string, unknown>;
  if (win.__electrobun || win.amemorymachineDesktop) {
    return true;
  }
  if (
    typeof navigator !== "undefined" &&
    (navigator.userAgent.includes("Electrobun") ||
      navigator.userAgent.includes("amemorymachine-desktop"))
  ) {
    return true;
  }
  if (
    window.location.search.includes("desktop=1") ||
    window.location.pathname.startsWith("/desktop")
  ) {
    return true;
  }
  return false;
};

const emptySubscribe = () => () => {
  // noop subscribe
};

const getServerSnapshot = () => false;

export const useIsDesktop = (): boolean =>
  useSyncExternalStore(emptySubscribe, isDesktopApp, getServerSnapshot);
