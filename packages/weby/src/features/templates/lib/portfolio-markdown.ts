import type { ExperienceItem, Profile, Project } from "#/shared/types";
import { z } from "zod";

export interface ParsedPortfolio {
  experiences: ExperienceItem[];
  profile: Profile;
  projects: Project[];
}

export const generatePortfolioMarkdown = (
  profile?: Profile,
  experiences?: ExperienceItem[],
  projects?: Project[],
): string => {
  const pName = profile?.name ?? "Harsh Sahu";
  const pTagline = profile?.tagline ?? "designer portfolio";
  const pUsername = profile?.username ?? "parazeeknova";
  const pEmail = profile?.email ?? "harsh@itssingularity.com";
  const lightVideo = profile?.lightVideo ?? "https://img.przknv.cc/t/footer.mp4";
  const darkVideo = profile?.darkVideo ?? "https://img.przknv.cc/t/header.mp4";
  const pDesc =
    profile?.description ??
    "Engineer and founder, building systems, infrastructure, and tools. Author of [asocialmedia](https://www.asocialmedia.cc). Runs [Singularity Works](https://www.itsingularity.com), an opinionated product studio. CS undergrad who builds things that shouldn't exist yet, then open-sources them so you can too. Occasional [hackathon](https://www.linkedin.com/in/hashk/details/honors/) winner, published [researcher](https://www.orcid.org/0009-0008-9861-9181).";

  const linksArr = Object.entries(
    profile?.links ?? {
      asocialmedia: { label: "asocialmedia", url: "https://www.asocialmedia.cc" },
      github: { label: "GitHub", url: "https://www.github.com/parazeeknova" },
      linkedin: { label: "LinkedIn", url: "https://www.linkedin.com/in/hashk" },
      portfolio: { label: "designer portfolio", url: "https://folio.przknv.cc" },
      singularity: { label: "Singularity Works", url: "https://www.itsingularity.com" },
      twitter: { label: "X", url: "https://www.x.com/parazeeknova" },
    },
  )
    .map(([, item]) => `- ${item.label}: ${item.url}`)
    .join("\n");

  const expsArr = (
    experiences ?? [
      {
        location: "Remote (India)",
        period: "August 25' –Present",
        title: "Founder & Infrastructure Engineer — Singularity Works",
      },
      {
        location: "Remote (Muscat, Oman)",
        period: "April 25'–November 25'",
        title: "Full Stack Developer Intern — amasQIS.ai",
      },
      {
        location: "University (VIT)",
        period: "June 25'–February 26'",
        title: "President — Mozilla Firefox Club (VIT)",
      },
      {
        location: "University (VIT)",
        period: "June 25'–January 26'",
        title: "Operations Manager — AI Club (VIT)",
      },
      {
        location: "Remote (India)",
        period: "April 24'–June 24'",
        title: "Frontend Developer — Operation Smile Foundation (NGO,Non-profit)",
      },
    ]
  )
    .map((exp) => `### ${exp.title}\n- Location: ${exp.location}\n- Period: ${exp.period}`)
    .join("\n\n");

  const projsArr = (
    projects ?? [
      {
        desc: "A fully declarative, highly opinionated, and reproducible NixOS/Hyprland desktop environment. Equipped with a custom Rust-based daemon (wabi), interactive QML-based Quickshell widgets, and dynamic Material You color schemes generated from your wallpapers via Matugen. Includes local AI workflows (OCR, Speech-to-Text, and LLMs) along with Waydroid virtualization and Cockpit server panel integration out of the box. Designed to look gorgeous without bloated overhead.",
        image: "https://img.przknv.cc/t/doty.png",
        productUrl: "https://github.com/parazeeknova/doty",
        readmeUrl:
          "https://raw.githubusercontent.com/parazeeknova/doty/refs/heads/main/.github/README.md",
        repoUrl: "https://github.com/parazeeknova/doty",
        stack:
          "Nix, NixOS, Hyprland, Quickshell, Qt, QML, Rust, Matugen, Waydroid, Distrobox, Home Manager",
        title: "Doty is an over-configured nix flake for opinionated developers",
      },
      {
        desc: "A local-first git visualizer built in Rust with egui. Commit graph, syntax-highlighted diffs, file tree with git status, and drag-to-merge all in a ~5MB binary with no Electron, no webview, no cloud, and no subscription for a picture of your own repo. Talks directly to libgit2. Named at 2am. No regrets.",
        image: "https://img.przknv.cc/t/gitcha.png",
        productUrl: "https://github.com/parazeeknova/gitcha/releases",
        readmeUrl:
          "https://raw.githubusercontent.com/parazeeknova/gitcha/refs/heads/main/.github/README.md",
        repoUrl: "https://github.com/parazeeknova/gitcha",
        stack:
          "Rust, egui, eframe, git2, libgit2, diffy, similar, syntect, egui-arbor, egui-phosphor",
        title:
          "Gitcha is a native git GUI written in rust to be blazing fast and light that goes brr",
      },
      {
        desc: "A local-first spatial workspace for free-form kanban, structured tasks, durable offline work, and realtime collaboration with other goodies.",
        image: "https://img.przknv.cc/t/Screenshot_2026-07-08_22.51.03.png",
        productUrl: "https://lumen.itssingularity.com",
        readmeUrl:
          "https://raw.githubusercontent.com/singularityworks-xyz/lumen/refs/heads/origin/.github/README.md",
        repoUrl: "https://github.com/singularityworks-xyz/lumen",
        stack:
          "Next.js, Elysia, Elixir, Typescript, Bun, PostgreSQL, Redis, Yjs, Zustand, Tailwind, Tauri, CRDTs, Docker, Playwright, Bun Test, K6 and more",
        title: "Lumen is a spatial system for organizing work.",
      },
      {
        desc: "A social platform that brings your entire internet into one place. Unified feed, communities, real-time chat, rich media and tipping all tied together by Aura, a reputation system that grows with you, and Zeph, an AI companion that actually remembers you. Built by one person. Slightly unhinged in ambition.",
        image: "https://img.przknv.cc/t/Gk8Fy0aaMAARWSc.jpg",
        productUrl: "https://asocialmedia.cc",
        readmeUrl:
          "https://raw.githubusercontent.com/asocialmedia/social/refs/heads/main/.github/README.md",
        repoUrl: "https://github.com/asocialmedia/social",
        stack:
          "Next.js, React, Elysia, Elixir, TypeScript, Tailwind CSS, PostgreSQL, Redis, RustFS, RabbitMQ, MeiliSearch, AI-sdk, Docker and more",
        title:
          "asocialmedia formerly zephyr is the last social platform you'll ever need. Open source, cozy, and slightly unhinged.",
      },
      {
        desc: "Realtime collaborative spreadsheet with a local-first document model, CRDT-based syncing, worker-driven evaluation, and a virtualized grid built to stay responsive on 10K+ row datasets.",
        image: "",
        productUrl: "https://sheets.przknv.cc",
        readmeUrl:
          "https://raw.githubusercontent.com/parazeeknova/papyrus/refs/heads/main/.github/README.md",
        repoUrl: "https://github.com/parazeeknova/papyrus",
        stack:
          "Next.js, Elixir, TypeScript, Bun, Firestore, Yjs, Zustand, Tailwind CSS, CRDTs, Docker and more",
        title: "Papyrus is a realtime collaborative spreadsheet",
      },
      {
        desc: "Personal knowledge base and folio, blog for public face & private brain, one app that doesn't apologize for being both. the left side is where i exist as a person (public face): my projects, my work, my contribution graph. the right side is where i think out loud (private brain): notes, docs, blog posts, half-baked ideas.",
        image: "",
        productUrl: "https://www.przknv.cc",
        readmeUrl:
          "https://raw.githubusercontent.com/parazeeknova/verso/refs/heads/main/.github/README.md",
        repoUrl: "https://github.com/parazeeknova/verso",
        stack:
          "Tanstack Start, Vite, Vitest, Golang, TypeScript, Postgres, TipTap, CRDTs, Tailwind CSS, Cloudflare, Docker and more",
        title: "Personal knowledge base and folio, blog for public face & private brain, one app",
      },
      {
        desc: "Fast TUI with hierarchical notebooks, fuzzy search, syntax highlighting for 25+ languages, and versioned storage.",
        image: "",
        productUrl: "",
        readmeUrl:
          "https://raw.githubusercontent.com/parazeeknova/snix/refs/heads/main/.github/README.md",
        repoUrl: "https://github.com/parazeeknova/snix",
        stack: "Rust, Ratatui",
        title: "Snix is a Terminal snippet manager",
      },
      {
        desc: "Windows code editor with built-in terminal. Supports 35+ languages, code folding, Lua customization, and QScintilla-based editing.",
        image: "",
        productUrl: "",
        readmeUrl:
          "https://raw.githubusercontent.com/parazeeknova/nyxtext-zenith/refs/heads/main/.github/README.md",
        repoUrl: "https://github.com/parazeeknova/nyxtext-zenith",
        stack: "Python, PyQt, QScintilla",
        title: "Nyxtext Zenith is a Keyboard-first code editor",
      },
    ]
  )
    .map(
      (proj) =>
        `### ${proj.title}\n- Desc: ${proj.desc}\n- Image: ${proj.image || ""}\n- Stack: ${proj.stack || ""}\n- Readme: ${proj.readmeUrl || ""}\n- Repo: ${proj.repoUrl || ""}\n- Product: ${proj.productUrl || ""}`,
    )
    .join("\n\n");

  return `## PROFILE
Name: ${pName}
Tagline: ${pTagline}
Username: ${pUsername}
Email: ${pEmail}
LightVideo: ${lightVideo}
DarkVideo: ${darkVideo}
Description: ${pDesc}

Links:
${linksArr}

## EXPERIENCE
${expsArr}

## PROJECTS
${projsArr}
`;
};

const parseProfileLine = (line: string, profile: Profile) => {
  if (line.startsWith("Name:")) {
    profile.name = line.slice("Name:".length).trim();
  } else if (line.startsWith("Tagline:")) {
    profile.tagline = line.slice("Tagline:".length).trim();
  } else if (line.startsWith("Username:")) {
    profile.username = line.slice("Username:".length).trim();
  } else if (line.startsWith("Email:")) {
    profile.email = line.slice("Email:".length).trim();
  } else if (line.startsWith("LightVideo:")) {
    profile.lightVideo = line.slice("LightVideo:".length).trim();
  } else if (line.startsWith("DarkVideo:")) {
    profile.darkVideo = line.slice("DarkVideo:".length).trim();
  } else if (line.startsWith("Description:")) {
    profile.description = line.slice("Description:".length).trim();
  } else if (line.startsWith("- ")) {
    const linkLine = line.slice(2).trim();
    const colonIdx = linkLine.indexOf(":");
    if (colonIdx > 0) {
      const label = linkLine.slice(0, colonIdx).trim();
      const url = linkLine.slice(colonIdx + 1).trim();
      const key = label.toLowerCase().replaceAll(/[^a-z0-9]/g, "");
      if (key && url) {
        if (key.includes("portfolio") || label.toLowerCase().includes("portfolio")) {
          profile.links.portfolio = { label, url };
        } else {
          profile.links[key] = { label, url };
        }
      }
    }
  }
};

const parseExperienceLine = (
  line: string,
  experiences: ExperienceItem[],
  currentExpItem: ExperienceItem | null,
): ExperienceItem | null => {
  if (line.startsWith("### ")) {
    if (currentExpItem) {
      experiences.push(currentExpItem);
    }
    return { location: "", period: "", title: line.slice(4).trim() };
  }
  if (currentExpItem && line.startsWith("- ")) {
    const itemLine = line.slice(2).trim();
    if (itemLine.toLowerCase().startsWith("location:")) {
      currentExpItem.location = itemLine.slice("location:".length).trim();
    } else if (itemLine.toLowerCase().startsWith("period:")) {
      currentExpItem.period = itemLine.slice("period:".length).trim();
    }
  }
  return currentExpItem;
};

const parseProjectLine = (
  line: string,
  projects: Project[],
  currentProjItem: Project | null,
): Project | null => {
  if (line.startsWith("### ")) {
    if (currentProjItem) {
      projects.push(currentProjItem);
    }
    return {
      desc: "",
      image: "",
      productUrl: "",
      readmeUrl: "",
      repoUrl: "",
      stack: "",
      title: line.slice(4).trim(),
    };
  }
  if (currentProjItem && line.startsWith("- ")) {
    const itemLine = line.slice(2).trim();
    const colonIdx = itemLine.indexOf(":");
    if (colonIdx > 0) {
      const fieldKey = itemLine.slice(0, colonIdx).trim().toLowerCase();
      const val = itemLine.slice(colonIdx + 1).trim();
      if (fieldKey === "desc" || fieldKey === "description") {
        currentProjItem.desc = val;
      } else if (fieldKey === "image") {
        currentProjItem.image = val;
      } else if (fieldKey === "stack") {
        currentProjItem.stack = val;
      } else if (fieldKey === "readme" || fieldKey === "readmeurl") {
        currentProjItem.readmeUrl = val;
      } else if (fieldKey === "repo" || fieldKey === "repourl") {
        currentProjItem.repoUrl = val;
      } else if (fieldKey === "product" || fieldKey === "producturl") {
        currentProjItem.productUrl = val;
      }
    }
  }
  return currentProjItem;
};

export const parsePortfolioMarkdown = (markdown: string): ParsedPortfolio => {
  const profile: Profile = {
    description: "",
    email: "",
    links: {},
    name: "",
    tagline: "",
    username: "",
  };
  const experiences: ExperienceItem[] = [];
  const projects: Project[] = [];

  const lines = markdown.split("\n");
  let currentSection: "PROFILE" | "EXPERIENCE" | "PROJECTS" | null = null;
  let currentExpItem: ExperienceItem | null = null;
  let currentProjItem: Project | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (line.includes("## PROFILE")) {
      currentSection = "PROFILE";
      continue;
    }
    if (line.includes("## EXPERIENCE")) {
      currentSection = "EXPERIENCE";
      if (currentExpItem) {
        experiences.push(currentExpItem);
        currentExpItem = null;
      }
      continue;
    }
    if (line.includes("## PROJECTS")) {
      currentSection = "PROJECTS";
      if (currentProjItem) {
        projects.push(currentProjItem);
        currentProjItem = null;
      }
      continue;
    }

    if (currentSection === "PROFILE") {
      parseProfileLine(line, profile);
    } else if (currentSection === "EXPERIENCE") {
      currentExpItem = parseExperienceLine(line, experiences, currentExpItem);
    } else if (currentSection === "PROJECTS") {
      currentProjItem = parseProjectLine(line, projects, currentProjItem);
    }
  }

  if (currentExpItem) {
    experiences.push(currentExpItem);
  }
  if (currentProjItem) {
    projects.push(currentProjItem);
  }

  return { experiences, profile, projects };
};

export interface ValidationError {
  message: string;
  line?: number;
  fix?: string;
}

export interface ValidationResult {
  errors: ValidationError[];
  isValid: boolean;
  parsed: ParsedPortfolio;
}

export const validatePortfolioMarkdown = (markdown: string): ValidationResult => {
  const errors: ValidationError[] = [];
  const lines = markdown.split("\n");

  const profileIdx = lines.findIndex((l) => l.includes("## PROFILE"));
  const experienceIdx = lines.findIndex((l) => l.includes("## EXPERIENCE"));
  const projectsIdx = lines.findIndex((l) => l.includes("## PROJECTS"));

  if (profileIdx === -1) {
    errors.push({
      fix: "add '## PROFILE' on its own line",
      message: "missing section: ## PROFILE",
    });
  }
  if (experienceIdx === -1) {
    errors.push({
      fix: "add '## EXPERIENCE' on its own line",
      message: "missing section: ## EXPERIENCE",
    });
  }
  if (projectsIdx === -1) {
    errors.push({
      fix: "add '## PROJECTS' on its own line",
      message: "missing section: ## PROJECTS",
    });
  }

  const parsed = parsePortfolioMarkdown(markdown);

  if (profileIdx !== -1) {
    if (!parsed.profile.name) {
      errors.push({
        fix: "add 'Name: Your Name' under ## PROFILE",
        line: profileIdx + 1,
        message: "missing field: Name:",
      });
    }
    if (!parsed.profile.username) {
      errors.push({
        fix: "add 'Username: yourhandle' under ## PROFILE",
        line: profileIdx + 1,
        message: "missing field: Username:",
      });
    }

    // Validate email format
    if (parsed.profile.email) {
      const emailResult = z.string().email().safeParse(parsed.profile.email);
      if (!emailResult.success) {
        errors.push({
          fix: "use a valid email like you@domain.com",
          line: profileIdx + 1,
          message: `invalid email: ${parsed.profile.email}`,
        });
      }
    } else {
      errors.push({
        fix: "add 'Email: you@domain.com' under ## PROFILE",
        line: profileIdx + 1,
        message: "missing field: Email:",
      });
    }

    // Validate link URLs
    const urlSchema = z.string().url();
    for (const [, link] of Object.entries(parsed.profile.links)) {
      if (link.url && !urlSchema.safeParse(link.url).success) {
        errors.push({
          fix: `use a valid URL for '${link.label}' (e.g. https://example.com)`,
          line: profileIdx + 1,
          message: `invalid URL for ${link.label}: ${link.url}`,
        });
      }
    }
  }

  return {
    errors,
    isValid: errors.length === 0,
    parsed,
  };
};
