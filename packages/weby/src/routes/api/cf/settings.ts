import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/cf/settings")({
  server: {
    handlers: {
      GET: async () => {
        const origin = process.env.BACKY_ORIGIN || "http://localhost:7000";
        const res = await fetch(`${origin}/api/cf/settings`);
        // Parse safely and always reply with explicit application/json so a
        // malformed/missing content-type can never break the client's fetch.
        const text = await res.text();
        let body: unknown = {};
        try {
          body = text ? JSON.parse(text) : {};
        } catch {
          body = { error: text || `HTTP ${res.status}` };
        }
        return Response.json(body, {
          headers: { "Content-Type": "application/json" },
          status: res.status,
        });
      },
    },
  },
});
