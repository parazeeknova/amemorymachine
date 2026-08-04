import { createFileRoute } from "@tanstack/react-router";
import { getTemplates, pinTemplate, unpinTemplate } from "#/server/backy";

export const Route = createFileRoute("/api/console/templates")({
  server: {
    handlers: {
      DELETE: async ({ request }) => {
        const cookieHeader = request.headers.get("cookie");
        if (!cookieHeader) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }
        const res = await unpinTemplate(cookieHeader);
        return Response.json(res);
      },
      GET: async ({ request }) => {
        const cookieHeader = request.headers.get("cookie");
        if (!cookieHeader) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }
        const templates = await getTemplates(cookieHeader);
        return Response.json(templates ?? []);
      },
      POST: async ({ request }) => {
        const cookieHeader = request.headers.get("cookie");
        if (!cookieHeader) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }
        const body = await request.json();
        const res = await pinTemplate(body, cookieHeader);
        return Response.json(res);
      },
    },
  },
});
