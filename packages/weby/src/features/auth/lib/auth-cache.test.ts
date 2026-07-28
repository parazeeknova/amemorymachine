import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getAuthCache, isSessionCacheStale, resetAuthCache, setAuthCache } from "../lib/auth-cache";

describe("auth-cache", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    resetAuthCache();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts as unknown", () => {
    expect(getAuthCache()).toBe("unknown");
  });

  it("sets and gets authenticated state", () => {
    setAuthCache("authenticated");
    expect(getAuthCache()).toBe("authenticated");
  });

  it("sets and gets unauthenticated state", () => {
    setAuthCache("unauthenticated");
    expect(getAuthCache()).toBe("unauthenticated");
  });

  it("resets to unknown", () => {
    setAuthCache("authenticated");
    resetAuthCache();
    expect(getAuthCache()).toBe("unknown");
  });

  it("isSessionCacheStale returns false immediately after set", () => {
    setAuthCache("authenticated");
    expect(isSessionCacheStale()).toBe(false);
  });

  it("isSessionCacheStale returns true after 5 minutes", () => {
    setAuthCache("authenticated");
    vi.advanceTimersByTime(5 * 60 * 1000 + 1000);
    expect(isSessionCacheStale()).toBe(true);
  });

  it("isSessionCacheStale returns false after 4 minutes", () => {
    setAuthCache("authenticated");
    vi.advanceTimersByTime(4 * 60 * 1000);
    expect(isSessionCacheStale()).toBe(false);
  });
});
