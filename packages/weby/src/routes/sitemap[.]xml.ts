import { createFileRoute } from "@tanstack/react-router";
import { getBlogManifest, getProfile } from "#/server/backy";
import { collectSitemapUrls, buildSitemapXml, getSiteOrigin } from "#/server/seo";

// resolveOrUndefined swallows a failed backy fetch so the sitemap still
// renders from whatever data did load.
const resolveOrUndefined = async <T>(promise: Promise<T>): Promise<T | undefined> => {
  try {
    return await promise;
  } catch {
    return undefined;
  }
};

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = getSiteOrigin(request.url);
        const profile = await resolveOrUndefined(getProfile());
        const manifest = await resolveOrUndefined(getBlogManifest());
        const xml = buildSitemapXml(collectSitemapUrls(profile, manifest, origin));
        return new Response(xml, {
          headers: {
            "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
            "Content-Type": "application/xml",
          },
        });
      },
    },
  },
});
