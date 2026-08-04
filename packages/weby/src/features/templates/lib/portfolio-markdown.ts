import type { ExperienceItem, Profile, Project } from "#/shared/types";
import { z } from "zod";

export interface ParsedPortfolio {
  experiences: ExperienceItem[];
  profile: Profile;
  projects: Project[];
}

// eslint-disable-next-line complexity
export const generatePortfolioMarkdown = (
  profile?: Profile,
  experiences?: ExperienceItem[],
  projects?: Project[],
): string => {
  const pName = profile?.name ?? "Harsh Sahu";
  const pTagline = profile?.tagline ?? "designer portfolio";
  const pUsername = profile?.username ?? "parazeeknova";
  const pEmail = profile?.email ?? "harsh@itssingularity.com";
  const pResumeUrl = profile?.resumeUrl ?? "https://f.przknv.cc/raw/XghaIR.pdf";
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
        description:
          "Scaled infrastructure for 5 companies to 7-figure INR revenue in under 9 months — Docker VPS fleets on Hetzner/Hostinger/OVH with Nginx/Traefik/Cloudflare and Portainer. Multi-cloud pipelines across AWS (EC2, RDS, S3, Lambda, API Gateway, Route53, VPC), GCP (GKE, GCS, Cloud Functions) and Azure (VMs, Blob Storage, App Service), with serverless offload to Vercel/Lambda/Workers and CI/CD via Jenkins + GitHub Actions. Observability with Prometheus/Grafana/Sentry/PostHog; app layers on Next.js, tRPC, Postgres, Redis, Turso, Convex.",
        location: "Remote (India)",
        period: "August 25' –Present",
        section: "professional",
        title: "Founder & Infrastructure Engineer — Singularity Works",
      },
      {
        description:
          "Built the MERN backend + Socket.IO WebSocket APIs for a multi-tenant HRMS — real-time CRUD powering admin/super-admin dashboards with role-scoped access. RESTful FastAPI services for concurrent multi-camera video streams, handling session lifecycle and fan-out under load.",
        location: "Remote (Muscat, Oman)",
        period: "April 25'–November 25'",
        section: "professional",
        title: "Full Stack Developer Intern — amasQIS.ai",
      },
      {
        description:
          "Led the browser club — cross-functional ops, team-lead coordination, community continuity between semesters. Produced written/visual content on web standards and open-source tooling. Built real-time multiplayer games with live leaderboards, cooperative sabotage hints and pair mechanics.",
        location: "University (VIT)",
        period: "June 25'–February 26'",
        section: "university clubs",
        title: "President — Mozilla Firefox Club (VIT)",
      },
      {
        description:
          "Handled ops, logistics and team coordination. Built a treasure-hunt app with admin dashboard (MongoDB, Express, React, Node) — REST + WebSocket for real-time participant tracking, game state and scoring, deployed on EC2 with Docker. Also shipped event sites and the club landing page.",
        location: "University (VIT)",
        period: "June 25'–January 26'",
        section: "university clubs",
        title: "Operations Manager — AI Club (VIT)",
      },
      {
        description:
          "Frontend work on a non-profit site (first commercial project) — improved visibility and donation flow to widen reach for children lacking education, books and food.",
        location: "Remote (India)",
        period: "April 24'–June 24'",
        section: "professional",
        title: "Frontend Developer — Operation Smile Foundation (NGO,Non-profit)",
      },
    ]
  )
    .map(
      (exp) =>
        `### ${exp.title}\n- Location: ${exp.location}\n- Period: ${exp.period}\n- Description: ${exp.description ?? ""}\n- Section: ${exp.section ?? "professional"}`,
    )
    .join("\n\n");

  const projsArr = (
    projects ?? [
      {
        desc: "asocialmedia (formerly zephyr), the last social platform you'll ever need. now with a cast that talks back.Your internet, unified: feed, communities, real-time chat, rich media, tipping. Powered by Aura, a reputation system that levels with you, and a Cast, characters with their own personas, takes, and beef, who actually read your posts and show up in the comments to agree, argue, or roast you. Zeph's just the one you know best. Built by one person. Ambition: unhinged.",
        image: "https://img.przknv.cc/t/Gk8Fy0aaMAARWSc.jpg",
        logo: "https://img.przknv.cc/t/zephyr.png",
        logoScale: 0.8,
        productUrl: "https://asocialmedia.cc",
        readmeUrl:
          "https://raw.githubusercontent.com/asocialmedia/social/refs/heads/main/.github/README.md",
        repoUrl: "https://github.com/asocialmedia/social",
        section: "prod",
        stack:
          "Next.js, React, Elysia, Elixir, TypeScript, Tailwind CSS, PostgreSQL, Redis, RustFS, RabbitMQ, MeiliSearch, AI-sdk, Docker and more",
        title:
          "asocialmedia formerly zephyr is the last social platform you'll ever need. Open source, cozy, and slightly unhinged.",
      },
      {
        desc: "amemorymachine. built because your brain forgets and your notes app doesn't retrieve. Everything I read, write, hear, or scribble gets ingested, indexed, and made retrievable. OCR pulls text out of images and scans, STT turns voice into notes, TTS reads them back. Runs on local or self-hosted LLMs, no data leaving unless I say so. Notes live as a RAG graph, not a folder tree, so context surfaces on its own instead of getting buried. Realtime markdown docs, Notion-style editing, but the memory underneath actually connects things.",
        image: "https://img.przknv.cc/t/versopp.png",
        logo: "https://img.przknv.cc/t/verso.png",
        productUrl: "https://amemorymachine.cc",
        readmeUrl:
          "https://raw.githubusercontent.com/parazeeknova/verso/refs/heads/main/.github/README.md",
        repoUrl: "https://github.com/parazeeknova/verso",
        section: "prod",
        stack:
          "Tanstack Start, Vite, Vitest, Golang, TypeScript, Postgres, TipTap, CRDTs, Tailwind CSS, Cloudflare, Docker and more",
        title:
          "amemorymachine is a personal knowledge base and folio, blog for public face & private brain, one app",
      },
      {
        desc: "Lumen. a spatial system for organizing work, infinite canvas, not another kanban board.Local-first spatial workspace where tasks live on an infinite canvas instead of a fixed board. Free-form kanban when you want to think in space, structured tasks when you need actual deadlines, offline-first so it survives dropped connections and closed laptops. Realtime collab with no lag, built on CRDTs so two people editing the same board never fight each other. RAG-backed AI reads the whole canvas, not just one card, so you can ask it what's actually going on instead of digging through columns yourself.",
        image: "https://img.przknv.cc/t/Screenshot_2026-07-08_22.51.03.png",
        logo: "https://img.przknv.cc/t/lumen.png",
        productUrl: "https://lumen.itssingularity.com",
        readmeUrl:
          "https://raw.githubusercontent.com/singularityworks-xyz/lumen/refs/heads/origin/.github/README.md",
        repoUrl: "https://github.com/singularityworks-xyz/lumen",
        section: "prod",
        stack:
          "Next.js, Elysia, Elixir, Typescript, Bun, PostgreSQL, Redis, Yjs, Zustand, Tailwind, Tauri, CRDTs, Docker, Playwright, Bun Test, K6 and more",
        title: "Lumen is a spatial system for organizing work.",
      },
      {
        desc: "A fully declarative, highly opinionated, and reproducible NixOS/Hyprland desktop environment. Equipped with a custom Rust-based daemon (wabi), interactive QML-based Quickshell widgets, and dynamic Material You color schemes generated from your wallpapers via Matugen. Includes local AI workflows (OCR, Speech-to-Text, and LLMs) along with Waydroid virtualization and Cockpit server panel integration out of the box. Designed to look gorgeous without bloated overhead.",
        image: "https://img.przknv.cc/t/doty.png",
        logo: "https://img.przknv.cc/t/dotly.png",
        productUrl: "https://github.com/parazeeknova/doty",
        readmeUrl:
          "https://raw.githubusercontent.com/parazeeknova/doty/refs/heads/main/.github/README.md",
        repoUrl: "https://github.com/parazeeknova/doty",
        section: "personal",
        stack:
          "Nix, NixOS, Hyprland, Quickshell, Qt, QML, Rust, Matugen, Waydroid, Distrobox, Home Manager",
        title: "Doty is an over-configured nix flake for opinionated developers",
      },
      {
        desc: "A local-first git visualizer built in Rust with egui. Commit graph, syntax-highlighted diffs, file tree with git status, and drag-to-merge all in a ~5MB binary with no Electron, no webview, no cloud, and no subscription for a picture of your own repo. Talks directly to libgit2. Named at 2am. No regrets.",
        image: "https://img.przknv.cc/t/gitcha.png",
        logo: "https://img.przknv.cc/t/gitcha%20(1).png",
        productUrl: "https://github.com/parazeeknova/gitcha/releases",
        readmeUrl:
          "https://raw.githubusercontent.com/parazeeknova/gitcha/refs/heads/main/.github/README.md",
        repoUrl: "https://github.com/parazeeknova/gitcha",
        section: "prod",
        stack:
          "Rust, egui, eframe, git2, libgit2, diffy, similar, syntect, egui-arbor, egui-phosphor",
        title:
          "Gitcha is a native git GUI written in rust to be blazing fast and light that goes brr",
      },
      {
        desc: "Realtime collaborative spreadsheet, local-first, so it works before the network catches up. CRDT-based syncing means every edit merges cleanly, no last-write-wins, no overwritten formulas. Evaluation runs off the main thread in a worker, so the grid never freezes while it's computing. Virtualized rendering keeps it responsive past 10K+ rows, scrolling and editing stay instant even when the sheet gets heavy. Built for the moment spreadsheets usually fall apart.",
        image: "https://img.przknv.cc/t/papss.png",
        logo: "https://img.przknv.cc/t/papyrus.png",
        logoScale: 0.8,
        productUrl: "https://sheets.przknv.cc",
        readmeUrl:
          "https://raw.githubusercontent.com/parazeeknova/papyrus/refs/heads/main/.github/README.md",
        repoUrl: "https://github.com/parazeeknova/papyrus",
        section: "prod",
        stack:
          "Next.js, Elixir, TypeScript, Bun, Firestore, Yjs, Zustand, Tailwind CSS, CRDTs, Docker and more",
        title: "Papyrus. a spreadsheet that syncs like a doc and scales like a database.",
      },
      {
        desc: "Fast TUI with hierarchical notebooks, fuzzy search, syntax highlighting for 25+ languages, and versioned storage.",
        image: "",
        productUrl: "",
        readmeUrl:
          "https://raw.githubusercontent.com/parazeeknova/snix/refs/heads/main/.github/README.md",
        repoUrl: "https://github.com/parazeeknova/snix",
        section: "personal",
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
        section: "personal",
        stack: "Python, PyQt, QScintilla",
        title: "Nyxtext Zenith is a Keyboard-first code editor",
      },
    ]
  )
    .map(
      (proj) =>
        `### ${proj.title}\n- Desc: ${proj.desc}\n- Image: ${proj.image || ""}\n- Logo: ${proj.logo || ""}\n- LogoScale: ${proj.logoScale ?? 1}\n- Stack: ${proj.stack || ""}\n- Readme: ${proj.readmeUrl || ""}\n- Repo: ${proj.repoUrl || ""}\n- Product: ${proj.productUrl || ""}\n- Section: ${proj.section ?? "prod"}`,
    )
    .join("\n\n");

  return `## PROFILE
Name: ${pName}
Tagline: ${pTagline}
Username: ${pUsername}
Email: ${pEmail}
Resume: ${pResumeUrl}
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
  } else if (line.startsWith("Resume:")) {
    profile.resumeUrl = line.slice("Resume:".length).trim();
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
    return {
      description: "",
      location: "",
      period: "",
      section: "professional",
      title: line.slice(4).trim(),
    };
  }
  if (currentExpItem && line.startsWith("- ")) {
    const itemLine = line.slice(2).trim();
    if (itemLine.toLowerCase().startsWith("location:")) {
      currentExpItem.location = itemLine.slice("location:".length).trim();
    } else if (itemLine.toLowerCase().startsWith("period:")) {
      currentExpItem.period = itemLine.slice("period:".length).trim();
    } else if (itemLine.toLowerCase().startsWith("description:")) {
      currentExpItem.description = itemLine.slice("description:".length).trim();
    } else if (itemLine.toLowerCase().startsWith("section:")) {
      const raw = itemLine.slice("section:".length).trim().toLowerCase();
      currentExpItem.section = raw.startsWith("university") ? "university clubs" : "professional";
    }
  }
  return currentExpItem;
};

const applyProjectField = (project: Project, fieldKey: string, val: string): void => {
  if (fieldKey === "desc" || fieldKey === "description") {
    project.desc = val;
  } else if (fieldKey === "image") {
    project.image = val;
  } else if (fieldKey === "logo") {
    project.logo = val;
  } else if (fieldKey === "logoscale") {
    const parsed = Number(val);
    project.logoScale = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  } else if (fieldKey === "stack") {
    project.stack = val;
  } else if (fieldKey === "readme" || fieldKey === "readmeurl") {
    project.readmeUrl = val;
  } else if (fieldKey === "repo" || fieldKey === "repourl") {
    project.repoUrl = val;
  } else if (fieldKey === "product" || fieldKey === "producturl") {
    project.productUrl = val;
  } else if (fieldKey === "section") {
    project.section = val.toLowerCase().startsWith("personal") ? "personal" : "prod";
  }
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
      logo: "",
      logoScale: 1,
      productUrl: "",
      readmeUrl: "",
      repoUrl: "",
      section: "prod",
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
      applyProjectField(currentProjItem, fieldKey, val);
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
