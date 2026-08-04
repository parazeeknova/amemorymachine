import type { BlogManifestSection, ExperienceItem, Profile, Project } from "#/shared/types";

// getSiteOrigin resolves the canonical public origin for SEO artifacts.
// The request host wins when present so both przknv.cc and
// amemorymachine.cc serve domain-correct sitemaps/robots/llms.txt;
// VITE_APP_ORIGIN (or the default) is the fallback for requests with no
// real host (e.g. the HTML head and direct-IP access).
export const getSiteOrigin = (requestUrl?: string): string => {
  if (requestUrl) {
    try {
      const { protocol, host } = new URL(requestUrl);
      if (host) {
        return `${protocol}//${host}`;
      }
    } catch {
      // malformed request URL, fall through to the configured origin
    }
  }
  const fromEnv = import.meta.env.VITE_APP_ORIGIN as string | undefined;
  if (fromEnv && fromEnv.trim().length > 0) {
    return fromEnv.replace(/\/+$/, "");
  }
  return "https://amemorymachine.cc";
};

// stripMarkdown flattens the markdown source used for the profile description
// into plain text suitable for <meta name="description"> and llms.txt.
export const stripMarkdown = (source?: string): string =>
  (source ?? "")
    .replaceAll(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replaceAll(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replaceAll(/[#>*`_~|-]/g, " ")
    .replaceAll(/\s+/g, " ")
    .trim();

// truncate clamps a string to `max` chars on a word boundary.
export const truncate = (text: string, max: number): string => {
  if (text.length <= max) {
    return text;
  }
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : max).trim()}…`;
};

// buildPortfolioTitle derives the page title from profile data.
export const buildPortfolioTitle = (profile?: Profile): string => {
  if (!profile?.name) {
    return "amemorymachine — personal knowledge base and folio";
  }
  const { name } = profile;
  const tagline = profile.tagline?.trim();
  return tagline ? `${name} — ${tagline}` : `${name} — portfolio`;
};

// buildPortfolioDescription derives the meta description from the profile.
export const buildPortfolioDescription = (profile?: Profile): string => {
  const stripped = stripMarkdown(profile?.description);
  if (stripped) {
    return truncate(stripped, 160);
  }
  const tagline = profile?.tagline?.trim();
  if (tagline) {
    return truncate(tagline, 160);
  }
  return "amemorymachine is a personal knowledge base and folio, blog for public face & private brain, one app.";
};

interface PersonJsonLd {
  "@context": "https://schema.org";
  "@type": "Person";
  name: string;
  alternateName?: string;
  description?: string;
  email?: string;
  image?: string;
  sameAs: string[];
  url: string;
}

// buildPersonJsonLd returns schema.org Person structured data for the profile.
export const buildPersonJsonLd = (
  profile: Profile | undefined,
  origin: string,
): PersonJsonLd | null => {
  if (!profile?.name) {
    return null;
  }
  const sameAs = Object.values(profile.links ?? {})
    .map((link) => link?.url)
    .filter((url): url is string => typeof url === "string" && url.length > 0);
  const email = profile.email?.trim() ? `mailto:${profile.email.trim()}` : undefined;
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    alternateName: profile.username || undefined,
    description: truncate(stripMarkdown(profile.description), 300) || undefined,
    email,
    image: `${origin}/amemorymachine-og.png`,
    name: profile.name,
    sameAs,
    url: origin,
  };
};

interface WebSiteJsonLd {
  "@context": "https://schema.org";
  "@type": "WebSite";
  name: string;
  url: string;
  description: string;
}

export const buildWebSiteJsonLd = (
  profile: Profile | undefined,
  origin: string,
): WebSiteJsonLd => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  description: buildPortfolioDescription(profile),
  name: buildPortfolioTitle(profile),
  url: origin,
});

// escapeXml escapes the five XML entities for embedding text in sitemap.xml.
export const escapeXml = (text: string): string =>
  text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

// formatLastMod returns today's date in the W3C sitemap format (YYYY-MM-DD).
export const formatLastMod = (date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export interface SitemapUrl {
  loc: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  lastmod?: string;
  priority?: string;
}

export const buildSitemapXml = (urls: SitemapUrl[]): string => {
  const entries = urls
    .map((entry) => {
      const lines = [`  <url>`, `    <loc>${escapeXml(entry.loc)}</loc>`];
      if (entry.lastmod) {
        lines.push(`    <lastmod>${entry.lastmod}</lastmod>`);
      }
      if (entry.changefreq) {
        lines.push(`    <changefreq>${entry.changefreq}</changefreq>`);
      }
      if (entry.priority) {
        lines.push(`    <priority>${entry.priority}</priority>`);
      }
      lines.push(`  </url>`);
      return lines.join("\n");
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`;
};

// collectSitemapUrls assembles the crawlable URL set from the portfolio data
// and the blog manifest. Blog posts do not have individual public URLs (they
// render inside the / route), so only / and /about are emitted.
export const collectSitemapUrls = (
  profile: Profile | undefined,
  manifest: BlogManifestSection[] | undefined,
  origin: string,
): SitemapUrl[] => {
  const lastmod = formatLastMod();
  const urls: SitemapUrl[] = [
    {
      changefreq: "weekly",
      lastmod,
      loc: `${origin}/`,
      priority: "1.0",
    },
    {
      changefreq: "monthly",
      lastmod,
      loc: `${origin}/about`,
      priority: "0.8",
    },
  ];
  // Blogs render inside the / route (viewMode switch) — no separate URLs to
  // emit today, but keep the manifest dependency so the sitemap refreshes when
  // content changes and grows if per-post routes are added later.
  void profile;
  void manifest;
  return urls;
};

// buildRobotsTxt renders the robots.txt body for the deployed origin.
export const buildRobotsTxt = (origin: string): string => `# allow crawling everything by default
User-agent: *
Disallow:

Sitemap: ${origin}/sitemap.xml
`;

// buildLlmstxt renders an llms.txt file (https://llmstxt.org) describing the
// site for LLM agents, derived from the pinned portfolio data.
// eslint-disable-next-line complexity
export const buildLlmstxt = (
  profile: Profile | undefined,
  projects: Project[] | undefined,
  experience: ExperienceItem[] | undefined,
  manifest: BlogManifestSection[] | undefined,
  origin: string,
): string => {
  const lines: string[] = [];

  const title = profile?.name?.trim() || "amemorymachine";
  const tagline = profile?.tagline?.trim();
  const heading = tagline ? `${title} — ${tagline}` : title;
  lines.push(`# ${heading}`, "");

  const description = stripMarkdown(profile?.description);
  lines.push(`> ${description || "Personal portfolio, blog, and knowledge base."}`, "");

  lines.push("## Portfolio");
  lines.push(`- [Homepage](${origin}/): ${tagline || "portfolio and blog"}`);
  lines.push(`- [About](${origin}/about): about amemorymachine and its owner`);

  const socialLinks = Object.entries(profile?.links ?? {})
    .filter(([, link]) => link?.url && link?.label)
    .map(([key, link]) => `- [${link.label}](${link.url}): ${key}`);
  if (socialLinks.length > 0) {
    lines.push("", "## Links");
    lines.push(...socialLinks);
  }

  if (projects && projects.length > 0) {
    lines.push("", "## Projects");
    for (const project of projects) {
      const projectUrl = project.productUrl || project.repoUrl;
      const label = project.title || projectUrl;
      const detail = [project.desc, project.stack].filter(Boolean).join(" — ");
      lines.push(projectUrl ? `- [${label}](${projectUrl}): ${detail}` : `- ${label}: ${detail}`);
    }
  }

  if (experience && experience.length > 0) {
    lines.push("", "## Experience");
    for (const item of experience) {
      const period = item.period ? ` (${item.period})` : "";
      const location = item.location ? ` — ${item.location}` : "";
      lines.push(`- ${item.title}${location}${period}`);
    }
  }

  if (manifest && manifest.length > 0) {
    lines.push("", "## Blog");
    for (const section of manifest) {
      for (const post of section.children ?? []) {
        lines.push(`- ${post.title}`);
      }
    }
  }

  lines.push("", `## Details`, `Made with amemorymachine — a self-hosted personal knowledge base.`);
  lines.push("", "");
  return lines.join("\n");
};
