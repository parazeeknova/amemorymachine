import type { ExperienceItem, Profile, Project } from "#/shared/types";

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
  const pDesc =
    profile?.description ??
    "Engineer and founder, building systems, infrastructure, and tools. Author of [asocialmedia](https://www.asocialmedia.cc). Runs [Singularity Works](https://www.itsingularity.com), an opinionated product studio.";

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
    ]
  )
    .map((exp) => `### ${exp.title}\n- Location: ${exp.location}\n- Period: ${exp.period}`)
    .join("\n\n");

  const projsArr = (
    projects ?? [
      {
        desc: "A fully declarative, highly opinionated, and reproducible NixOS/Hyprland desktop environment.",
        image: "https://img.przknv.cc/t/doty.png",
        productUrl: "https://github.com/parazeeknova/doty",
        readmeUrl:
          "https://raw.githubusercontent.com/parazeeknova/doty/refs/heads/main/.github/README.md",
        repoUrl: "https://github.com/parazeeknova/doty",
        stack: "Nix, NixOS, Hyprland, Quickshell, Rust",
        title: "Doty is an over-configured nix flake for opinionated developers",
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

export interface ValidationResult {
  errors: string[];
  isValid: boolean;
  parsed: ParsedPortfolio;
}

export const validatePortfolioMarkdown = (markdown: string): ValidationResult => {
  const errors: string[] = [];
  const lines = markdown.split("\n");

  const hasProfileSection = lines.some((l) => l.includes("## PROFILE"));
  const hasExperienceSection = lines.some((l) => l.includes("## EXPERIENCE"));
  const hasProjectsSection = lines.some((l) => l.includes("## PROJECTS"));

  if (!hasProfileSection) {
    errors.push("Missing section header: ## PROFILE");
  }
  if (!hasExperienceSection) {
    errors.push("Missing section header: ## EXPERIENCE");
  }
  if (!hasProjectsSection) {
    errors.push("Missing section header: ## PROJECTS");
  }

  const parsed = parsePortfolioMarkdown(markdown);

  if (hasProfileSection) {
    if (!parsed.profile.name) {
      errors.push("Profile section is missing 'Name:' field");
    }
    if (!parsed.profile.username) {
      errors.push("Profile section is missing 'Username:' field");
    }
    if (!parsed.profile.email) {
      errors.push("Profile section is missing 'Email:' field");
    }
  }

  return {
    errors,
    isValid: errors.length === 0,
    parsed,
  };
};
