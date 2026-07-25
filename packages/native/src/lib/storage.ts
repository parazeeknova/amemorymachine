import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import { decrypt, encrypt } from "./encryption";
import { getEnvDataDir } from "./paths";

export interface StoredSession {
  accessToken: string;
  refreshToken?: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  expiresAt: number;
  deviceName: string;
}

export interface StoredAuthState {
  session: StoredSession;
  verifiedAt: number;
  lastCheckedAt: number;
}

export interface TokenRefreshResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export type ThemePreference = "light" | "dark" | "system";

export interface StoredTheme {
  preference: ThemePreference;
  resolvedAt: number;
}

const AUTH_FILENAME = "auth.json";
const THEME_FILENAME = "theme.json";

const getDataDir = (env: "dev" | "prod"): string => getEnvDataDir(env);

const ensureDir = (dir: string): void => {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
};

const readEncryptedFile = (path: string): string | null => {
  if (!existsSync(path)) {
    return null;
  }
  try {
    const raw = readFileSync(path, "utf-8");
    const payload = JSON.parse(raw) as { encryptedData: string; iv: string; tag: string };
    return decrypt(payload);
  } catch {
    return null;
  }
};

const writeEncryptedFile = (path: string, data: unknown): void => {
  const payload = encrypt(JSON.stringify(data));
  const dir = join(path, "..");
  ensureDir(dir);
  writeFileSync(path, JSON.stringify(payload));
};

export const loadAuth = (env: "dev" | "prod"): StoredAuthState | null => {
  const dir = getDataDir(env);
  const filePath = join(dir, AUTH_FILENAME);
  const raw = readEncryptedFile(filePath);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as StoredAuthState;
  } catch {
    return null;
  }
};

export const saveAuth = (env: "dev" | "prod", state: StoredAuthState): void => {
  const dir = getDataDir(env);
  const filePath = join(dir, AUTH_FILENAME);
  ensureDir(dir);
  writeEncryptedFile(filePath, state);
};

export const clearAuth = (env: "dev" | "prod"): void => {
  const dir = getDataDir(env);
  const filePath = join(dir, AUTH_FILENAME);
  if (existsSync(filePath)) {
    try {
      unlinkSync(filePath);
    } catch {
      // ignore
    }
  }
};

export const isSessionExpired = (state: StoredAuthState, graceSeconds = 30): boolean =>
  Date.now() >= state.session.expiresAt - graceSeconds * 1000;

export const loadTheme = (env: "dev" | "prod"): StoredTheme | null => {
  const dir = getDataDir(env);
  const filePath = join(dir, THEME_FILENAME);
  const raw = readEncryptedFile(filePath);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as StoredTheme;
  } catch {
    return null;
  }
};

export const saveTheme = (env: "dev" | "prod", theme: StoredTheme): void => {
  const dir = getDataDir(env);
  const filePath = join(dir, THEME_FILENAME);
  ensureDir(dir);
  writeEncryptedFile(filePath, theme);
};
