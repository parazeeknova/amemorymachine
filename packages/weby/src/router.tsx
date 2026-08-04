import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import type { QueryClient } from "@tanstack/react-query";
import { createQueryClient } from "#/shared/lib/query-client";
import { routeTree } from "./routeTree.gen";

export const getRouter = function getRouter() {
  const queryClient = createQueryClient();
  const router = createTanStackRouter({
    context: { queryClient },
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
    routeTree,
    scrollRestoration: true,
  });

  return router;
};

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}

declare module "@tanstack/react-router" {
  interface RouterContext {
    queryClient: QueryClient;
  }
}
