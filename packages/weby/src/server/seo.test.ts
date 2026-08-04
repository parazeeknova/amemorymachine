import { describe, expect, it } from "vitest";
import {
  buildLlmstxt,
  buildPersonJsonLd,
  buildPortfolioDescription,
  buildPortfolioTitle,
  buildRobotsTxt,
  buildSitemapXml,
  buildWebSiteJsonLd,
  collectSitemapUrls,
  escapeXml,
  getSiteOrigin,
  stripMarkdown,
  truncate,
} from "./seo";

const profile = {
  description:
    "Engineer and founder, building [systems](https://itsingularity.com) and tools. Author of [asocialmedia](https://asocialmedia.cc).",
  email: "harsh@itssingularity.com",
  links: {
    github: { label: "GitHub", url: "https://github.com/parazeeknova" },
    linkedin: { label: "LinkedIn", url: "https://linkedin.com/in/hashk" },
  },
  name: "Harsh Sahu",
  tagline: "designer portfolio",
  username: "parazeeknova",
};

describe("stripMarkdown", () => {
  it("removes markdown links, images and punctuation", () => {
    expect(stripMarkdown("See [my site](https://x.com) and #1 title")).toBe(
      "See my site and 1 title",
    );
  });

  it("returns empty string for undefined", () => {
    expect(stripMarkdown()).toBe("");
  });
});

describe("truncate", () => {
  it("clamps on a word boundary", () => {
    expect(truncate("one two three four", 8)).toBe("one two…");
  });

  it("returns the string unchanged when short enough", () => {
    expect(truncate("short", 10)).toBe("short");
  });
});

describe("buildPortfolioTitle", () => {
  it("combines name and tagline", () => {
    expect(buildPortfolioTitle(profile)).toBe("Harsh Sahu — designer portfolio");
  });

  it("falls back without a profile", () => {
    expect(buildPortfolioTitle()).toContain("amemorymachine");
  });
});

describe("buildPortfolioDescription", () => {
  it("strips markdown and clamps to 160 chars", () => {
    const desc = buildPortfolioDescription(profile);
    expect(desc).toContain("Engineer and founder");
    expect(desc).not.toContain("](");
    expect(desc.length).toBeLessThanOrEqual(163);
  });
});

describe("buildPersonJsonLd", () => {
  it("builds a Person schema with social links", () => {
    const json = buildPersonJsonLd(profile, "https://amemorymachine.cc");
    expect(json).not.toBeNull();
    expect(json?.name).toBe("Harsh Sahu");
    expect(json?.sameAs).toContain("https://github.com/parazeeknova");
    expect(json?.email).toBe("mailto:harsh@itssingularity.com");
  });

  it("returns null without a name", () => {
    expect(buildPersonJsonLd(undefined, "https://x.com")).toBeNull();
  });
});

describe("buildWebSiteJsonLd", () => {
  it("builds a WebSite schema", () => {
    const json = buildWebSiteJsonLd(profile, "https://amemorymachine.cc");
    expect(json["@type"]).toBe("WebSite");
    expect(json.url).toBe("https://amemorymachine.cc");
  });
});

describe("escapeXml", () => {
  it("escapes XML entities", () => {
    expect(escapeXml("a & b < c > d \" e ' f")).toBe("a &amp; b &lt; c &gt; d &quot; e &apos; f");
  });
});

describe("getSiteOrigin", () => {
  it("uses the request URL origin when no env is set", () => {
    expect(getSiteOrigin("https://example.com/path")).toBe("https://example.com");
  });

  it("defaults to the known production origin", () => {
    expect(getSiteOrigin()).toBe("https://amemorymachine.cc");
  });
});

describe("buildSitemapXml", () => {
  it("emits a valid urlset", () => {
    const xml = buildSitemapXml([
      { changefreq: "weekly", lastmod: "2026-08-03", loc: "https://x.com/", priority: "1.0" },
    ]);
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain("<loc>https://x.com/</loc>");
    expect(xml).toContain("<changefreq>weekly</changefreq>");
  });
});

describe("collectSitemapUrls", () => {
  it("emits the homepage and about", () => {
    const urls = collectSitemapUrls(profile, [], "https://amemorymachine.cc");
    expect(urls.map((u) => u.loc)).toEqual([
      "https://amemorymachine.cc/",
      "https://amemorymachine.cc/about",
    ]);
  });
});

describe("buildRobotsTxt", () => {
  it("references the sitemap", () => {
    const robots = buildRobotsTxt("https://amemorymachine.cc");
    expect(robots).toContain("Sitemap: https://amemorymachine.cc/sitemap.xml");
    expect(robots).toContain("User-agent: *");
  });
});

describe("buildLlmstxt", () => {
  const projects = [
    {
      desc: "A fast tool",
      productUrl: "https://tool.example.com",
      stack: "Rust",
      title: "Snix",
    },
  ];
  const experience = [{ location: "Remote", period: "2024-Present", title: "Founder" }];
  const manifest = [
    { children: [{ section: "dev", slug: "post-1", title: "Post One" }], label: "dev" },
  ];

  it("includes profile, projects, experience and blog posts", () => {
    const txt = buildLlmstxt(profile, projects, experience, manifest, "https://amemorymachine.cc");
    expect(txt).toContain("# Harsh Sahu — designer portfolio");
    expect(txt).toContain("[GitHub](https://github.com/parazeeknova)");
    expect(txt).toContain("[Snix](https://tool.example.com): A fast tool — Rust");
    expect(txt).toContain("Founder — Remote (2024-Present)");
    expect(txt).toContain("- Post One");
  });
});
