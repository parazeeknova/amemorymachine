import { WarningCircleIcon } from "@phosphor-icons/react";
import { ExperienceSection, ProfileSection, SocialLinks } from "#/features/landing";
import { useTheme } from "#/shared/hooks/use-theme";
import type { ParsedPortfolio } from "../lib/portfolio-markdown";

interface PortfolioLivePreviewProps {
  errors: string[];
  isValid: boolean;
  parsedData: ParsedPortfolio;
}

export const PortfolioLivePreview = ({
  errors,
  isValid,
  parsedData,
}: PortfolioLivePreviewProps) => {
  const { isDarkMode } = useTheme();

  if (!isValid) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="p-3 mb-3 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <WarningCircleIcon size={24} />
        </div>
        <h4 className="text-sm font-medium lowercase text-text-dark/80 dark:text-text-dark/80">
          syntax error in template
        </h4>
        <p className="mt-1 text-[11px] max-w-xs leading-relaxed text-text-dark/40 dark:text-text-dark/40">
          fix the markdown structure errors to restore live preview:
        </p>

        <div className="w-full max-w-xs mt-4 space-y-1.5 text-left">
          {errors.map((err) => (
            <div
              key={err}
              className="p-2 text-[10px] font-mono border rounded border-rose-500/30 bg-rose-500/5 text-rose-400"
            >
              • {err}
            </div>
          ))}
        </div>
      </div>
    );
  }

  const { experiences, profile, projects } = parsedData;

  const headerGradient = isDarkMode
    ? "linear-gradient(to bottom, transparent 0%, rgba(10, 10, 10, 0.4) 60%, #0a0a0a 100%)"
    : "linear-gradient(to bottom, transparent 0%, rgba(250, 250, 250, 0.4) 60%, #fafafa 100%)";

  return (
    <div
      className="h-full overflow-y-auto overscroll-contain bg-bg-light dark:bg-bg-dark text-text-light dark:text-text-dark"
      onClickCapture={(e) => {
        const anchor = (e.target as HTMLElement).closest("a");
        if (anchor) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
    >
      {/* Top Banner Cover Video */}
      <div className="relative mx-auto w-full h-36 sm:h-44 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          src="https://img.przknv.cc/t/header.mp4"
        />
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

        {/* Profile Section */}
        <ProfileSection isMobile={false} isPending={false} profile={profile} />

        {/* Experience Section */}
        {experiences.length > 0 && (
          <div className="shrink-0 space-y-2">
            <h3 className="font-medium text-base lowercase">work i did</h3>
            <ExperienceSection experience={experiences} isPending={false} />
          </div>
        )}

        {/* Projects Showcase */}
        {projects.length > 0 && (
          <div className="shrink-0 space-y-3 text-left">
            <h3 className="font-medium text-base lowercase">voo look what i made</h3>
            <div className="space-y-6 pt-1">
              {projects.map((proj, idx) => {
                const isEven = idx % 2 === 0;
                const linkUrl = proj.productUrl || proj.repoUrl;
                return (
                  <div
                    key={proj.title + idx}
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
                        <img
                          alt={proj.title}
                          className="w-full h-full object-cover"
                          src={proj.image}
                        />
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
        )}

        {/* Social Links & Footer */}
        <div className="shrink-0 flex items-center justify-between pt-2">
          <SocialLinks profile={profile} />
        </div>

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
};
