import { createFileRoute } from "@tanstack/react-router";
import { getCFData, BackyError } from "#/server/backy";

export const Route = createFileRoute("/api/cf/data")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const handle = url.searchParams.get("handle") ?? "";
        if (!handle) {
          return Response.json({ error: "handle is required" }, { status: 400 });
        }
        try {
          return Response.json(await getCFData(handle));
        } catch (error) {
          if (error instanceof BackyError) {
            return Response.json({ error: "Backend unavailable" }, { status: 502 });
          }
          throw error;
        }
      },
    },
  },
});
