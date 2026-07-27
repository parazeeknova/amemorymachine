import { describe, expect, it } from "vitest";
import { generatePortfolioMarkdown, validatePortfolioMarkdown } from "../lib/portfolio-markdown";

describe("generatePortfolioMarkdown boilerplate", () => {
  it("generates valid boilerplate markdown when called with no arguments", () => {
    const markdown = generatePortfolioMarkdown();

    // Should contain all required sections
    expect(markdown).toContain("## PROFILE");
    expect(markdown).toContain("## EXPERIENCE");
    expect(markdown).toContain("## PROJECTS");

    // Should be valid
    const validation = validatePortfolioMarkdown(markdown);
    expect(validation.isValid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  it("generates boilerplate with default profile data", () => {
    const markdown = generatePortfolioMarkdown();

    expect(markdown).toContain("Name: Harsh Sahu");
    expect(markdown).toContain("designer portfolio");
    expect(markdown).toContain("parazeeknova");
    expect(markdown).toContain("harsh@itssingularity.com");
  });

  it("generates boilerplate with default experience data", () => {
    const markdown = generatePortfolioMarkdown();

    expect(markdown).toContain("Founder & Infrastructure Engineer");
    expect(markdown).toContain("Singularity Works");
    expect(markdown).toContain("Full Stack Developer Intern");
    expect(markdown).toContain("amasQIS.ai");
  });

  it("generates boilerplate with default project data", () => {
    const markdown = generatePortfolioMarkdown();

    expect(markdown).toContain("Doty");
    expect(markdown).toContain("over-configured nix flake");
  });

  it("merges custom data with defaults when partial profile is provided", () => {
    const markdown = generatePortfolioMarkdown({
      description: "Custom bio",
      links: { github: { label: "GitHub", url: "https://github.com/test" } },
      name: "Custom Name",
      tagline: "custom tagline",
    });

    expect(markdown).toContain("Name: Custom Name");
    expect(markdown).toContain("Tagline: custom tagline");
    expect(markdown).toContain("Description: Custom bio");
    // Default username/email should be used since not provided
    expect(markdown).toContain("parazeeknova");
  });
});
