import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createWrapper } from "#/shared/test/utils";
import { AuthGate } from "./auth-gate";
import { resetAuthCache, setAuthCache } from "../lib/auth-cache";

const createMockResponse = (data: unknown, ok = true, status = 200): Response => {
  const body = JSON.stringify(data);
  return {
    headers: {
      get: (name: string) => (name.toLowerCase() === "content-type" ? "application/json" : null),
    },
    json: () => Promise.resolve(data),
    ok,
    status,
    text: () => Promise.resolve(body),
  } as unknown as Response;
};

describe("AuthGate", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    resetAuthCache();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows verifying screen when auth cache is unknown", () => {
    // eslint-disable-next-line promise/avoid-new -- need never-resolving promise to keep query pending
    const pending = new Promise<Response>(() => {});
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(pending));

    render(
      <AuthGate>
        <div>protected content</div>
      </AuthGate>,
      { wrapper: createWrapper() },
    );

    expect(screen.getByText("verifying session...")).toBeDefined();
  });

  it("shows children after successful auth validation", async () => {
    setAuthCache("authenticated");
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce(createMockResponse({ email: "test@test.com", id: "1", name: "test" }));
    vi.stubGlobal("fetch", mockFetch);

    render(
      <AuthGate>
        <div>protected content</div>
      </AuthGate>,
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(screen.getByText("protected content")).toBeDefined();
    });
  });

  it("skips loading screen when cache is already authenticated", () => {
    setAuthCache("authenticated");
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(createMockResponse({ email: "test@test.com", id: "1", name: "test" })),
    );

    render(
      <AuthGate>
        <div>protected content</div>
      </AuthGate>,
      { wrapper: createWrapper() },
    );

    // With an authenticated cache, the gate should show children immediately
    // (not the verifying screen) because the session was recently validated
    expect(screen.queryByText("verifying session...")).toBeNull();
    expect(screen.getByText("protected content")).toBeDefined();
  });
});
