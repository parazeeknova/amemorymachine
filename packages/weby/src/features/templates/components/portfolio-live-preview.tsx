import { memo, useMemo, useRef } from "react";
import { useTheme } from "#/shared/hooks/use-theme";
import type { ExperienceItem, Link, Profile, Project } from "#/shared/types";
import type { ParsedPortfolio } from "../lib/portfolio-markdown";
import { markdownToHtml } from "#/features/blog/lib/markdown-to-html";

interface PortfolioLivePreviewProps {
  errors: string[];
  isValid: boolean;
  parsedData: ParsedPortfolio;
}

const PreviewProfileSection = memo(({ profile }: { profile: Profile }) => {
  const descriptionHtml = useMemo(
    () => (profile.description ? markdownToHtml(profile.description) : ""),
    [profile.description],
  );

  const portfolioLink =
    profile.links?.portfolio ||
    Object.values(profile.links || {}).find(
      (l) => l.label.toLowerCase().includes("portfolio") || l.url.includes("folio"),
    );

  const taglineText = profile.tagline || portfolioLink?.label;

  return (
    <div className="shrink-0 space-y-3">
      {profile.name && (
        <h1
          className="font-normal text-4xl sm:text-6xl pl-1"
          style={{ fontFamily: '"Louison Adriana", cursive' }}
        >
          {profile.name}
          {profile.username && (
            <span
              className="ml-2 text-sm opacity-50 font-mono"
              style={{ fontFamily: '"Ubuntu Mono", monospace' }}
            >
              @{profile.username}
            </span>
          )}
        </h1>
      )}

      {(taglineText || profile.email) && (
        <p className="mb-4 text-sm sm:text-base">
          {taglineText && (
            <a
              href={portfolioLink?.url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="link-underline"
            >
              {taglineText}
            </a>
          )}
          {taglineText && profile.email && " · "}
          {profile.email && (
            <a href={`mailto:${profile.email}`} className="link-underline">
              {profile.email}
            </a>
          )}
        </p>
      )}

      {descriptionHtml && (
        <div
          className="text-sm leading-relaxed sm:text-base lowercase prose-desc"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: descriptionHtml }}
        />
      )}
    </div>
  );
});

const PreviewExperienceSection = memo(({ experiences }: { experiences: ExperienceItem[] }) => {
  if (experiences.length === 0) {
    return null;
  }

  return (
    <div className="shrink-0 space-y-3">
      <h3 className="font-medium text-base lowercase">work i did</h3>
      <div className="space-y-4">
        {experiences.map((item, idx) => (
          <div key={`${item.title}-${idx}`} className="space-y-0.5">
            <h4 className="font-medium text-xs sm:text-sm">{item.title}</h4>
            <p className="text-gray-500 text-xs sm:text-sm">
              {item.location} | {item.period}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
});

const PreviewProjectsSection = memo(({ projects }: { projects: Project[] }) => {
  if (projects.length === 0) {
    return null;
  }

  return (
    <div className="shrink-0 space-y-3 text-left">
      <h3 className="font-medium text-base lowercase">voo look what i made</h3>
      <div className="space-y-6 pt-1">
        {projects.map((proj, idx) => {
          const isEven = idx % 2 === 0;
          const linkUrl = proj.productUrl || proj.repoUrl;
          return (
            <div
              key={`${proj.title}-${idx}`}
              className={`flex items-center gap-3 sm:gap-4 ${isEven ? "" : "flex-row-reverse"}`}
            >
              {proj.image && (
                <a
                  href={linkUrl || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="relative shrink-0 block w-20 h-20 sm:w-28 sm:h-28 overflow-hidden border border-white/10"
                  style={{ transform: isEven ? "rotate(-3deg)" : "rotate(3deg)" }}
                >
                  <img alt={proj.title} className="w-full h-full object-cover" src={proj.image} />
                </a>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-xs sm:text-sm">{proj.title}</h3>
                {proj.desc && (
                  <p className="mt-1 text-gray-500 text-xs sm:text-sm leading-relaxed">
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

const PreviewSocialLinks = memo(
  ({ links, isDarkMode }: { links?: Record<string, Link>; isDarkMode: boolean }) => {
    if (!links) {
      return null;
    }

    const uniqueLinks = [
      ...new Map(
        Object.entries(links)
          .filter(([k, l]) => k !== "portfolio" && l.url && l.label)
          .map(([, l]) => [l.url, l]),
      ).values(),
    ];

    if (uniqueLinks.length === 0) {
      return null;
    }

    return (
      <div className="shrink-0 flex items-center justify-between pt-2">
        <div className="flex flex-wrap items-center gap-4">
          {uniqueLinks.map((lk, idx) => (
            <a
              key={`${lk.url}-${idx}`}
              href={lk.url}
              target="_blank"
              rel="noreferrer"
              className={`text-xs lowercase ${isDarkMode ? "text-text-dark/60 hover:text-text-dark" : "text-text-light/60 hover:text-text-light"}`}
            >
              {lk.label}
            </a>
          ))}
        </div>
      </div>
    );
  },
);

export const PortfolioLivePreview = memo(
  ({ errors, isValid, parsedData }: PortfolioLivePreviewProps) => {
    const { isDarkMode } = useTheme();
    const containerRef = useRef<HTMLDivElement>(null);
    const { experiences, profile, projects } = parsedData;

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
        <div className="flex flex-col h-full">
          <div className="px-2 py-1 border-b border-rose-500/20 bg-rose-500/5 text-[10px] font-mono text-rose-400">
            {errors.map((err, idx) => (
              <div key={`${err}-${idx}`}>{err}</div>
            ))}
          </div>
          <div className="flex-1 flex items-center justify-center">
            <span
              className={`text-[10px] lowercase ${isDarkMode ? "text-text-dark/25" : "text-text-light/25"}`}
            >
              fix errors to restore preview
            </span>
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
        <div className="-mt-4 mx-auto flex max-w-2xl flex-col gap-6 p-4 sm:p-6 text-left">
          {/* Navbar simulated links */}
          <div className="flex items-center justify-end gap-3 w-full">
            <span className="text-[13px] lowercase opacity-60">blogs</span>
            <span className="h-3 w-3 rounded-full border border-current opacity-60 inline-block" />
          </div>

          <PreviewProfileSection profile={profile} />
          <PreviewExperienceSection experiences={experiences} />
          <PreviewProjectsSection projects={projects} />
          <PreviewSocialLinks links={profile.links} isDarkMode={isDarkMode} />

          <div className="flex justify-end pt-4 pb-2">
            <span
              className="text-3xl sm:text-4xl opacity-40"
              style={{ fontFamily: '"Louison Adriana", cursive' }}
            >
              — with love, {profile.name?.split(" ")[0]?.toLowerCase() || "harsh"}
            </span>
          </div>
        </div>
      </div>
    );
  },
);
