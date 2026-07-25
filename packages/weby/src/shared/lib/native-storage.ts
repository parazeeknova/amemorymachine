export interface InitialAuthData {
  user?: {
    id: string;
    name: string;
    email: string;
  };
  deviceName?: string;
  expiresAt?: number;
}

export interface InitialThemeData {
  preference?: "light" | "dark" | "system";
  resolvedAt?: number;
}

const getNativeGlobal = <T>(key: string): T | null => {
  if (typeof window === "undefined") {
    return null;
  }
  const value = (window as unknown as Record<string, unknown>)[key];
  if (!value) {
    return null;
  }
  return value as T;
};

export const getCachedAuth = (): InitialAuthData | null =>
  getNativeGlobal<InitialAuthData>("__versoInitialAuthData");

export const getCachedTheme = (): InitialThemeData | null =>
  getNativeGlobal<InitialThemeData>("__versoInitialTheme");

export const hasCachedSession = (): boolean => {
  const auth = getCachedAuth();
  if (!auth) {
    return false;
  }
  return typeof auth.expiresAt === "number" && auth.expiresAt > Date.now();
};
