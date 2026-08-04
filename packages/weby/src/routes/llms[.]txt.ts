import { createFileRoute } from "@tanstack/react-router";
import { getBlogManifest, getExperience, getProfile, getProjects } from "#/server/backy";
import { buildLlmstxt, getSiteOrigin } from "#/server/seo";

// resolveOrUndefined swallows a failed backy fetch so the SEO artifact still
// renders from whatever data did load.
const resolveOrUndefined = async <T>(promise: Promise<T>): Promise<T | undefined> => {
  try {
    return await promise;
  } catch {
    return undefined;
  }
};

const resolveOrEmpty = async <T>(promise: Promise<T[]>): Promise<T[]> => {
  try {
    return await promise;
  } catch {
    return [];
  }
};

export const Route = createFileRoute("/llms.txt")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = getSiteOrigin(request.url);
        const profile = await resolveOrUndefined(getProfile());
        const projects = await resolveOrEmpty(getProjects());
        const experience = await resolveOrEmpty(getExperience());
        const manifest = await resolveOrUndefined(getBlogManifest());
        const body = buildLlmstxt(profile, projects, experience, manifest, origin);
        return new Response(body, {
          headers: {
            "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
            "Content-Type": "text/plain",
          },
        });
      },
    },
  },
});
