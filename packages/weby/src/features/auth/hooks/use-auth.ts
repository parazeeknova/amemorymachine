import type { AuthUser } from "#/shared/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchProtected } from "./fetch-protected";
import { setAuthCache } from "#/features/auth/lib/auth-cache";
import { useConsoleStore } from "#/features/console/stores/console-store";
import { getCachedAuth } from "#/shared/lib/native-storage";

export interface LoginResult {
  mfa_required?: boolean;
  user?: AuthUser;
}

export const useAuth = () => {
  const queryClient = useQueryClient();
  const cachedAuth = getCachedAuth();
  const hasValidCache =
    cachedAuth !== null &&
    cachedAuth.user !== null &&
    typeof cachedAuth.expiresAt === "number" &&
    cachedAuth.expiresAt > Date.now();

  return useQuery<AuthUser | null>({
    queryFn: async ({ signal }) => {
      try {
        return await fetchProtected<AuthUser>("/api/auth/me", { signal });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          throw error;
        }
        if (
          error instanceof Error &&
          (error.message.startsWith("HTTP 401") || error.message.startsWith("HTTP 403"))
        ) {
          setAuthCache("unauthenticated");
          queryClient.setQueryData(["auth"], null);
          queryClient.invalidateQueries({ queryKey: ["bootstrapState"] });
          return null;
        }
        throw error;
      }
    },
    queryKey: ["auth"],
    refetchOnMount: hasValidCache,
    retry: false,
    staleTime: hasValidCache ? 0 : 30 * 60 * 1000,
    ...(hasValidCache && cachedAuth?.user ? { initialData: cachedAuth.user as AuthUser } : {}),
  });
};

export const useAuthActions = () => {
  const queryClient = useQueryClient();

  const login = async (
    usernameOrEmail: string,
    password: string,
    email?: string,
    name?: string,
    workspaceName?: string,
    spaceName?: string,
  ): Promise<LoginResult> => {
    const body: Record<string, string> = { password, usernameOrEmail };
    if (email) {
      body.email = email;
    }
    if (name) {
      body.name = name;
    }
    if (workspaceName) {
      body.workspaceName = workspaceName;
    }
    if (spaceName) {
      body.spaceName = spaceName;
    }
    const res = await fetch("/api/auth/login", {
      body: JSON.stringify(body),
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Login failed" }));
      throw new Error((err as { error?: string }).error ?? "Login failed");
    }
    const data = (await res.json()) as LoginResult;

    if (data.mfa_required) {
      return data;
    }

    await queryClient.invalidateQueries({ queryKey: ["auth"] });
    await queryClient.invalidateQueries({ queryKey: ["bootstrapState"] });
    return data;
  };

  const logout = async () => {
    const res = await fetch("/api/auth/logout", { credentials: "include", method: "POST" });
    if (!res.ok) {
      throw new Error("Logout failed");
    }
    setAuthCache("unauthenticated");
    useConsoleStore.getState().reset();
    queryClient.setQueryData(["auth"], null);
    await queryClient.invalidateQueries({ queryKey: ["auth"] });
    await queryClient.invalidateQueries({ queryKey: ["bootstrapState"] });
  };

  return { login, logout };
};
