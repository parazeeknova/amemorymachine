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
    expect(markdown).toContain("Owned self-hosted infra for 5 companies");
    expect(markdown).toContain("multi-tenant HRMS");
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
    // Default username/email/resume should be used since not provided
    expect(markdown).toContain("parazeeknova");
    expect(markdown).toContain("Resume: https://f.przknv.cc/raw/XghaIR.pdf");
  });
});

describe("validatePortfolioMarkdown", () => {
  it("round-trips experience descriptions through generate and parse", () => {
    const markdown = generatePortfolioMarkdown();
    const parsed = validatePortfolioMarkdown(markdown);
    expect(parsed.isValid).toBe(true);

    const sw = parsed.parsed.experiences.find((e) => e.title.includes("Singularity Works"));
    expect(sw?.description).toContain("Owned self-hosted infra");
    expect(sw?.description).toContain("multi-cloud");

    const amas = parsed.parsed.experiences.find((e) => e.title.includes("amasQIS"));
    expect(amas?.description).toContain("multi-tenant HRMS");
    expect(amas?.description).toContain("FastAPI");
  });

  it("rejects invalid email format", () => {
    const markdown = `## PROFILE
Name: Test
Tagline: dev
Username: test
Email: not-an-email

## EXPERIENCE

## PROJECTS`;

    const result = validatePortfolioMarkdown(markdown);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.message.includes("invalid email"))).toBe(true);
  });

  it("accepts valid email", () => {
    const markdown = `## PROFILE
Name: Test
Tagline: dev
Username: test
Email: test@example.com

## EXPERIENCE

## PROJECTS`;

    const result = validatePortfolioMarkdown(markdown);
    expect(result.errors.some((e) => e.message.includes("invalid email"))).toBe(false);
  });

  it("rejects invalid link URLs", () => {
    const markdown = `## PROFILE
Name: Test
Tagline: dev
Username: test
Email: test@example.com

Links:
- github: not-a-url

## EXPERIENCE

## PROJECTS`;

    const result = validatePortfolioMarkdown(markdown);
    expect(result.errors.some((e) => e.message.includes("invalid URL"))).toBe(true);
  });

  it("accepts valid link URLs", () => {
    const markdown = `## PROFILE
Name: Test
Tagline: dev
Username: test
Email: test@example.com

Links:
- github: https://github.com/test

## EXPERIENCE

## PROJECTS`;

    const result = validatePortfolioMarkdown(markdown);
    expect(result.errors.some((e) => e.message.includes("invalid URL"))).toBe(false);
  });

  it("reports missing sections with fix suggestions", () => {
    const markdown = "just some text";

    const result = validatePortfolioMarkdown(markdown);
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(3);
    // All section errors should have fix suggestions
    for (const err of result.errors) {
      expect(err.fix).toBeDefined();
    }
  });
});
