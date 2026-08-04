import { createFileRoute } from "@tanstack/react-router";
import { buildRobotsTxt, getSiteOrigin } from "#/server/seo";

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: ({ request }) => {
        const origin = getSiteOrigin(request.url);
        return new Response(buildRobotsTxt(origin), {
          headers: {
            "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
            "Content-Type": "text/plain",
          },
        });
      },
    },
  },
});
