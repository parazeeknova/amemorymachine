import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/console/github-settings")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const cookieHeader = request.headers.get("cookie");
        if (!cookieHeader) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }
        const origin = process.env.BACKY_ORIGIN || "http://localhost:7000";
        const res = await fetch(`${origin}/api/console/github-settings`, {
          headers: { Cookie: cookieHeader },
        });
        return Response.json(await res.json(), { status: res.status });
      },
      POST: async ({ request }) => {
        const cookieHeader = request.headers.get("cookie");
        if (!cookieHeader) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }
        const origin = process.env.BACKY_ORIGIN || "http://localhost:7000";
        const body = await request.text();
        const res = await fetch(`${origin}/api/console/github-settings`, {
          body,
          headers: {
            "Content-Type": "application/json",
            Cookie: cookieHeader,
          },
          method: "POST",
        });
        return Response.json(await res.json(), { status: res.status });
      },
    },
  },
});
