import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { setAuthCache } from "#/features/auth/lib/auth-cache";

const isAuthError = (error: unknown): boolean => {
  if (error instanceof Error && error.message.includes("HTTP 401")) {
    return true;
  }
  if (error instanceof Error && error.message.includes("HTTP 403")) {
    return true;
  }
  return false;
};

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: 1000 * 60 * 60 * 24,
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
        retry: 1,
        staleTime: 1000 * 60 * 60,
      },
    },
    mutationCache: new MutationCache({
      onError: (error) => {
        if (isAuthError(error)) {
          setAuthCache("unauthenticated");
        }
      },
    }),
    queryCache: new QueryCache({
      onError: (error) => {
        if (isAuthError(error)) {
          setAuthCache("unauthenticated");
        }
      },
    }),
  });
