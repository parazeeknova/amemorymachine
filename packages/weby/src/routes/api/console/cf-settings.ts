import { createFileRoute } from "@tanstack/react-router";

const proxy = async (request: Request, init?: RequestInit): Promise<Response> => {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const origin = process.env.BACKY_ORIGIN || "http://localhost:7000";
  const res = await fetch(`${origin}/api/console/cf-settings`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
      ...init?.headers,
    },
  });
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
};

export const Route = createFileRoute("/api/console/cf-settings")({
  server: {
    handlers: {
      GET: ({ request }) => proxy(request),
      POST: async ({ request }) => {
        const body = await request.text();
        return proxy(request, { body, method: "POST" });
      },
    },
  },
});
