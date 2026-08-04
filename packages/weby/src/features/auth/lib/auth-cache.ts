type AuthState = "unknown" | "authenticated" | "unauthenticated";

interface AuthCacheEntry {
  state: AuthState;
  validatedAt: number;
}

const SESSION_TTL_MS = 5 * 60 * 1000;

// 5 minutes

let cachedAuthState: AuthCacheEntry = { state: "unknown", validatedAt: 0 };

export const getAuthCache = (): AuthState => cachedAuthState.state;

export const setAuthCache = (state: AuthState) => {
  cachedAuthState = { state, validatedAt: Date.now() };
};

export const isSessionCacheStale = (): boolean =>
  Date.now() - cachedAuthState.validatedAt > SESSION_TTL_MS;

export const resetAuthCache = () => {
  cachedAuthState = { state: "unknown", validatedAt: 0 };
};
