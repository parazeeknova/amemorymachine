import { memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRightIcon } from "@phosphor-icons/react";
import { gsap } from "gsap";
import { useTheme } from "#/shared/hooks/use-theme";
import type { ExperienceItem, Profile, Project } from "#/shared/types";
import type { ParsedPortfolio, ValidationError } from "../lib/portfolio-markdown";
import { markdownToHtml } from "#/features/blog/lib/markdown-to-html";
import { generatePortfolioMarkdown } from "../lib/portfolio-markdown";
import { GitHubActivity } from "#/features/github/components/calendar";
import { GitHubStats } from "#/features/github/components/stats";
import {
  HackathonSection,
  OpenSourceSection,
  ProjectThumb,
  WorldlineVisualizer,
} from "#/features/landing/components/projects";
import {
  getExperienceGroups,
  getProjectGroups,
  SocialLinks,
  TabBar,
} from "#/features/landing/components/sections";
import type { ExperienceTabKey } from "#/features/landing/components/sections";
import { IframeModal } from "#/shared/components/iframe-modal";
import { useSquiggleDraw } from "#/shared/hooks/use-squiggle-draw";
import { useGitHubSettings } from "../hooks/use-github-settings";
import { useCFSettings } from "../hooks/use-cf-settings";
import { CodeforcesCard } from "#/features/codeforces/components/card";

interface PortfolioLivePreviewProps {
  errors: ValidationError[];
  isValid: boolean;
  parsedData: ParsedPortfolio;
}

const PreviewProfileSection = memo(({ profile }: { profile: Profile }) => {
  const descriptionHtml = useMemo(
    () => (profile.description ? markdownToHtml(profile.description) : ""),
    [profile.description],
  );
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  const [isPortfolioOpen, setIsPortfolioOpen] = useState(false);

  const portfolioLink =
    profile.links?.portfolio ||
    Object.values(profile.links || {}).find(
      (l) => l.label.toLowerCase().includes("portfolio") || l.url.includes("folio"),
    );

  const taglineText = profile.tagline || portfolioLink?.label;

  // Draw the squiggly description underlines in when the preview appears.
  useSquiggleDraw(Boolean(descriptionHtml), sectionRef, { delay: 0.2 });

  return (
    <div className="shrink-0 space-y-3" ref={sectionRef}>
      {profile.name && (
        <h1 className="font-display font-normal text-4xl sm:text-6xl pl-1">{profile.name}</h1>
      )}

      {(profile.username || taglineText || profile.resumeUrl) && (
        <p className="mb-4 flex items-baseline gap-2.5 text-sm">
          {profile.username && <span className="opacity-60 font-mono">@{profile.username}</span>}
          {taglineText && (
            <button
              className="squiggle-link inline-flex cursor-pointer items-baseline gap-1 bg-transparent p-0 font-inherit text-inherit"
              onClick={() => setIsPortfolioOpen(true)}
              type="button"
            >
              portfolio
              <ArrowUpRightIcon size={13} />
            </button>
          )}
          {profile.resumeUrl && (
            <button
              className="squiggle-link inline-flex cursor-pointer items-baseline gap-1 bg-transparent p-0 font-inherit text-inherit"
              onClick={() => setIsResumeOpen(true)}
              type="button"
            >
              resume
              <ArrowUpRightIcon size={13} />
            </button>
          )}
        </p>
      )}

      {isResumeOpen && profile.resumeUrl && (
        <IframeModal
          onClose={() => setIsResumeOpen(false)}
          title="resume"
          url={profile.resumeUrl}
        />
      )}
      {isPortfolioOpen && portfolioLink?.url && (
        <IframeModal
          onClose={() => setIsPortfolioOpen(false)}
          title="portfolio"
          url={portfolioLink.url}
        />
      )}

      {descriptionHtml && (
        <div
          className="text-sm leading-relaxed text-justify sm:text-base prose-desc"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: descriptionHtml }}
        />
      )}
    </div>
  );
});

const PreviewExperienceSection = memo(({ experiences }: { experiences: ExperienceItem[] }) => {
  const [activeTab, setActiveTab] = useState<ExperienceTabKey>("professional");
  const listRef = useRef<HTMLDivElement>(null);
  const isTabFirstRender = useRef(true);

  const professional = experiences.filter((e) => e.section === "professional" || !e.section);
  const research = experiences.filter((e) => e.section === "research");
  const clubs = experiences.filter((e) => e.section === "university clubs");
  const groups = getExperienceGroups(experiences);
  const resolvedTab = groups.some((g) => g.key === activeTab)
    ? activeTab
    : (groups[0]?.key ?? "professional");
  const activeItems =
    {
      professional,
      research,
      "university clubs": clubs,
    }[resolvedTab] ?? [];

  const handleTabSelect = (next: string) => {
    const target: ExperienceTabKey =
      next === "professional" || next === "research" || next === "university clubs"
        ? next
        : "professional";
    if (target === activeTab) {
      return;
    }
    const el = listRef.current;
    if (!el) {
      setActiveTab(target);
      return;
    }
    gsap.killTweensOf(el.children);
    gsap.to([...el.children], {
      duration: 0.16,
      ease: "power2.in",
      filter: "blur(6px)",
      onComplete: () => setActiveTab(target),
      opacity: 0,
      stagger: 0.02,
      y: -8,
    });
  };

  useLayoutEffect(() => {
    if (isTabFirstRender.current) {
      isTabFirstRender.current = false;
      return;
    }
    const el = listRef.current;
    if (!el) {
      return;
    }
    const items = [...el.querySelectorAll(".experience-item")];
    if (items.length === 0) {
      return;
    }
    gsap.killTweensOf(items);
    gsap.fromTo(
      items,
      {
        filter: "blur(12px)",
        opacity: 0,
        scale: 0.98,
        y: 14,
      },
      {
        duration: 0.5,
        ease: "power2.out",
        filter: "blur(0px)",
        opacity: 1,
        scale: 1,
        stagger: 0.06,
        y: 0,
      },
    );
  }, [activeTab, experiences]);

  if (experiences.length === 0) {
    return null;
  }

  return (
    <div className="shrink-0 space-y-4">
      <h3 className="font-medium text-base lowercase">work i did</h3>
      {groups.length > 1 && (
        <TabBar groups={groups} active={activeTab} onSelect={handleTabSelect} />
      )}
      <div ref={listRef} className="relative space-y-4">
        {activeItems.map((item, idx) => (
          <div key={`${item.title}-${idx}`} className="space-y-0.5 experience-item">
            <h4 className="font-medium text-xs sm:text-sm">{item.title}</h4>
            <p className="text-gray-500 text-xs sm:text-sm">
              {item.location} | {item.period}
            </p>
            {item.description &&
              (item.section === "research" ? (
                // eslint-disable-next-line react/no-danger
                <div
                  className="prose-desc mt-1.5 w-full text-justify text-xs leading-relaxed text-gray-400 sm:text-[13px]"
                  dangerouslySetInnerHTML={{ __html: markdownToHtml(item.description) }}
                />
              ) : (
                <p className="mt-1.5 w-full text-justify text-xs leading-relaxed text-gray-400 sm:text-[13px]">
                  {item.description}
                </p>
              ))}
          </div>
        ))}
        {resolvedTab === "university clubs" &&
          (() => {
            const clubImgs = clubs.map((c) => c.image).filter((img): img is string => Boolean(img));
            if (clubImgs.length === 0) {
              return null;
            }
            return (
              <div className="flex gap-2">
                {clubImgs.map((src, imgIdx) => (
                  <img
                    alt=""
                    className="edge-fade flex-1 min-w-0 h-24 object-cover sm:h-28"
                    draggable={false}
                    key={src}
                    src={src}
                    style={{ transform: imgIdx % 2 === 0 ? "rotate(-3deg)" : "rotate(3deg)" }}
                  />
                ))}
              </div>
            );
          })()}
      </div>
    </div>
  );
});

const PreviewProjectsSection = memo(({ projects }: { projects: Project[] }) => {
  const [activeTab, setActiveTab] = useState<"prod" | "personal" | "freelance">("prod");
  const listRef = useRef<HTMLDivElement>(null);
  const isTabFirstRender = useRef(true);

  const groups = getProjectGroups(projects);
  const resolvedTab = groups.some((g) => g.key === activeTab)
    ? activeTab
    : (groups[0]?.key ?? "prod");
  const filtered = projects.filter((p) => (p.section ?? "prod") === resolvedTab);

  const handleTabSelect = (next: string) => {
    const target: "prod" | "personal" | "freelance" =
      next === "personal" || next === "freelance" ? next : "prod";
    if (target === activeTab) {
      return;
    }
    const el = listRef.current;
    if (!el) {
      setActiveTab(target);
      return;
    }
    gsap.killTweensOf(el.children);
    gsap.to([...el.children], {
      duration: 0.16,
      ease: "power2.in",
      filter: "blur(6px)",
      onComplete: () => setActiveTab(target),
      opacity: 0,
      stagger: 0.02,
      y: -8,
    });
  };

  useLayoutEffect(() => {
    if (isTabFirstRender.current) {
      isTabFirstRender.current = false;
      return;
    }
    const el = listRef.current;
    if (!el) {
      return;
    }
    const items = [...el.children];
    if (items.length === 0) {
      return;
    }
    gsap.killTweensOf(items);
    gsap.fromTo(
      items,
      {
        filter: "blur(12px)",
        opacity: 0,
        scale: 0.98,
        y: 14,
      },
      {
        duration: 0.5,
        ease: "power2.out",
        filter: "blur(0px)",
        opacity: 1,
        scale: 1,
        stagger: 0.06,
        y: 0,
      },
    );
  }, [activeTab]);

  if (projects.length === 0) {
    return null;
  }

  return (
    <div className="shrink-0 space-y-3 text-left">
      <h3 className="font-medium text-base lowercase">voo look what i made</h3>
      {groups.length > 1 && (
        <TabBar groups={groups} active={resolvedTab} onSelect={handleTabSelect} />
      )}
      <div ref={listRef} className="space-y-6 pt-1">
        {filtered.map((proj, idx) => {
          const isEven = idx % 2 === 0;
          return (
            <div
              key={`${proj.title}-${idx}`}
              className={`flex items-center gap-3 sm:gap-4 ${isEven ? "" : "flex-row-reverse"}`}
            >
              {(proj.image || proj.logo) && (
                <ProjectThumb
                  className="w-20 h-20 sm:w-28 sm:h-28 border border-white/10"
                  index={idx}
                  project={proj}
                />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-xs sm:text-sm">{proj.title}</h3>
                {proj.desc && (
                  <p className="mt-1 text-justify text-gray-500 text-xs sm:text-sm leading-relaxed">
                    {proj.desc}
                  </p>
                )}
                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
                  {proj.stack && (
                    <span className="text-gray-500 text-[11px] font-mono">{proj.stack}</span>
                  )}
                  {proj.repoUrl && (
                    <a
                      className="text-[#b58cff] text-[11px] lowercase hover:opacity-70"
                      href={proj.repoUrl}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      repo
                    </a>
                  )}
                  {proj.productUrl && (
                    <a
                      className="text-[#b58cff] text-[11px] lowercase hover:opacity-70"
                      href={proj.productUrl}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      product
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

export const PortfolioLivePreview = memo(
  // eslint-disable-next-line complexity
  ({ errors, isValid, parsedData }: PortfolioLivePreviewProps) => {
    const { isDarkMode } = useTheme();
    const containerRef = useRef<HTMLDivElement>(null);
    const [isRawOpen, setIsRawOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const { experiences, profile, projects } = parsedData;
    const { data: ghSettings } = useGitHubSettings();
    const { data: cfSettings } = useCFSettings();

    const rawMarkdown = useMemo(
      () => generatePortfolioMarkdown(profile, experiences, projects),
      [experiences, profile, projects],
    );

    useEffect(() => {
      const el = containerRef.current;
      if (!el) {
        return;
      }
      const onScroll = () => setIsScrolled(el.scrollTop > 80);
      el.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
      return () => el.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
      if (!isRawOpen) {
        return;
      }
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setIsRawOpen(false);
        }
      };
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    }, [isRawOpen]);

    const lightVideoUrl = profile.lightVideo || "https://img.przknv.cc/t/footer.mp4";
    const darkVideoUrl = profile.darkVideo || "https://img.przknv.cc/t/header.mp4";

    const lightThumb = lightVideoUrl
      ? `/api/console/video-thumbnail?url=${encodeURIComponent(lightVideoUrl)}`
      : undefined;
    const darkThumb = darkVideoUrl
      ? `/api/console/video-thumbnail?url=${encodeURIComponent(darkVideoUrl)}`
      : undefined;

    const headerGradient = isDarkMode
      ? "linear-gradient(to bottom, transparent 0%, rgba(10, 10, 10, 0.4) 60%, #0a0a0a 100%)"
      : "linear-gradient(to bottom, transparent 0%, rgba(250, 250, 250, 0.4) 60%, #fafafa 100%)";

    if (!isValid) {
      return (
        <div className="flex flex-col items-center justify-center h-full px-4">
          <div className="text-[10px] font-mono space-y-2 max-w-full">
            {errors.map((err, idx) => (
              <div key={`${err.message}-${idx}`}>
                <div className="flex items-baseline gap-2">
                  {err.line && (
                    <span
                      className={`shrink-0 ${isDarkMode ? "text-amber-500/40" : "text-amber-600/50"}`}
                    >
                      L{err.line}
                    </span>
                  )}
                  <span className={isDarkMode ? "text-amber-400/80" : "text-amber-700/80"}>
                    {err.message}
                  </span>
                </div>
                {err.fix && (
                  <div
                    className={`mt-0.5 italic ${isDarkMode ? "text-text-dark/25" : "text-text-light/40"}`}
                  >
                    &rarr; {err.fix}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div
        ref={containerRef}
        className={`h-full overflow-y-auto overflow-x-hidden transform-gpu ${isDarkMode ? "bg-bg-dark text-text-dark" : "bg-bg-light text-text-light"}`}
        style={{ WebkitOverflowScrolling: "touch", willChange: "scroll-position" }}
        onClickCapture={(e) => {
          const anchor = (e.target as HTMLElement).closest("a");
          if (anchor) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
      >
        {/* Top Banner Cover Video Thumbnails */}
        <div className="relative mx-auto w-full h-36 sm:h-44 overflow-hidden transform-gpu bg-black">
          {lightThumb && (
            <img
              alt="Light theme header"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-700"
              style={{ opacity: isDarkMode ? 0 : 1 }}
              src={lightThumb}
            />
          )}
          {darkThumb && (
            <img
              alt="Dark theme header"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-700"
              style={{ opacity: isDarkMode ? 1 : 0 }}
              src={darkThumb}
            />
          )}
          <div
            className="absolute inset-0 -bottom-1 pointer-events-none"
            style={{ background: headerGradient }}
          />
        </div>

        {/* Main Content Area matching / route */}
        <div className="-mt-4 mx-auto flex max-w-3xl flex-col gap-6 sm:gap-8 p-4 sm:p-6 lg:p-8 text-left">
          {/* floating mini nav, matching the / route */}
          <nav
            aria-label="quick nav"
            className={`sticky top-0 z-50 flex items-center gap-4 self-end px-3 py-2 transition-opacity duration-300 bg-linear-to-b ${
              isDarkMode
                ? "from-[#b58cff]/25 via-[#b58cff]/8 to-transparent"
                : "from-[#7c3aed]/18 via-[#7c3aed]/6 to-transparent"
            } ${isScrolled ? "opacity-100" : "pointer-events-none opacity-0"}`}
          >
            <button
              className="text-[13px] lowercase opacity-60 transition-opacity hover:opacity-100"
              onClick={() => setIsRawOpen(true)}
              type="button"
            >
              raw
            </button>
            <span className="text-[13px] lowercase opacity-60">blogs</span>
            <span className="inline-block h-3 w-3 rounded-full border border-current opacity-60" />
          </nav>

          {/* Navbar simulated links */}
          <div className="flex items-center justify-end gap-3 w-full">
            <button
              className="text-[13px] lowercase opacity-60 transition-opacity hover:opacity-100"
              onClick={() => setIsRawOpen(true)}
              type="button"
            >
              raw
            </button>
            <span className="text-[13px] lowercase opacity-60">blogs</span>
            <span className="h-3 w-3 rounded-full border border-current opacity-60 inline-block" />
          </div>

          <PreviewProfileSection profile={profile} />
          <PreviewExperienceSection experiences={experiences} />
          <PreviewProjectsSection projects={projects} />
          <HackathonSection />
          <OpenSourceSection />
          <WorldlineVisualizer />
          {(ghSettings?.enabled || cfSettings?.enabled) && (
            <>
              {ghSettings?.enabled && (
                <GitHubActivity
                  isDarkMode={isDarkMode}
                  username={ghSettings.username || "parazeeknova"}
                >
                  {ghSettings?.hasToken && <GitHubStats />}
                </GitHubActivity>
              )}
              {cfSettings?.enabled && (
                <CodeforcesCard username={cfSettings.username || "parazeeknova"} />
              )}
            </>
          )}
          <div className="shrink-0 flex items-center justify-between pt-2">
            <SocialLinks profile={profile} />
          </div>

          <div className="flex justify-end pt-4 pb-2">
            <span className="font-display text-3xl sm:text-4xl opacity-40">— El Psy Kongroo</span>
          </div>
        </div>

        {/* raw portfolio markdown modal */}
        {isRawOpen && (
          <div
            aria-label="Raw portfolio markdown"
            aria-modal="true"
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            role="dialog"
          >
            <div
              aria-hidden
              className="absolute inset-0 bg-black/50"
              onClick={() => setIsRawOpen(false)}
            />
            <div
              className={`relative flex max-h-[85vh] w-full max-w-2xl flex-col border ${
                isDarkMode ? "border-border-dark bg-bg-dark" : "border-border-light bg-bg-light"
              }`}
            >
              <div
                className={`flex items-center justify-between border-b px-3 py-2 ${
                  isDarkMode ? "border-border-dark/40" : "border-border-light/40"
                }`}
              >
                <span className="font-mono text-[11px] lowercase text-gray-500">portfolio.md</span>
                <button
                  aria-label="Close"
                  className={`text-[11px] lowercase hover:opacity-70 ${
                    isDarkMode ? "text-text-dark/60" : "text-text-light/60"
                  }`}
                  onClick={() => setIsRawOpen(false)}
                  type="button"
                >
                  close
                </button>
              </div>
              <pre className="overflow-auto p-4 font-mono text-[11px] leading-relaxed whitespace-pre-wrap break-words text-gray-400">
                {rawMarkdown}
              </pre>
            </div>
          </div>
        )}
      </div>
    );
  },
);
