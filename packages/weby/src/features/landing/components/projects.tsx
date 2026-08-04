import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useProjects } from "../hooks/use-data";
import { gsap } from "gsap";
import { ArrowUpRightIcon } from "@phosphor-icons/react";
import type { Project, ProjectSection } from "#/shared/types";
import { SkeletonBar, SkeletonThumb } from "#/shared/components/skeleton";
import { getProjectGroups, TabBar } from "./sections";

const isDesktopHoverAvailable = (): boolean => {
  if (typeof window === "undefined") {
    return false;
  }
  return window.innerWidth >= 768 && window.matchMedia("(hover: hover)").matches;
};

interface ProjectThumbProps {
  className?: string;
  index: number;
  project: Project;
}

export const ProjectThumb = ({
  className = "w-28 h-28 sm:w-36 sm:h-36",
  index,
  project,
}: ProjectThumbProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const thumbRef = useRef<HTMLAnchorElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const previewImgRef = useRef<HTMLImageElement>(null);
  const isEven = index % 2 === 0;

  const linkUrl = project.productUrl || project.repoUrl;
  // Logo shows by default, the product screenshot crossfades in on hover.
  // If only one of the two exists it serves both states.
  const primarySrc = project.logo || project.image;
  const hoverSrc = project.image || project.logo;
  const hasDual = Boolean(project.logo && project.image);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handlePreviewEnter = () => {
    if (!isDesktopHoverAvailable()) {
      return;
    }
    if (!thumbRef.current || !previewRef.current || !previewImgRef.current) {
      return;
    }
    const rect = thumbRef.current.getBoundingClientRect();
    const previewEl = previewRef.current;
    const imgEl = previewImgRef.current;

    gsap.killTweensOf(previewEl);
    gsap.killTweensOf(imgEl);
    gsap.set(previewEl, {
      display: "block",
      height: rect.height,
      left: rect.left,
      opacity: 1,
      top: rect.top,
      width: rect.width,
      x: 0,
      y: 0,
    });
    gsap.set(imgEl, { scale: 1 });

    const previewWidth = 288;
    const previewLeft = isEven ? rect.right + 16 : rect.left - previewWidth - 16;
    const previewTop = rect.top + rect.height / 2;

    gsap.to(previewEl, {
      duration: 0.45,
      ease: "power3.out",
      left: previewLeft,
      rotateX: 0,
      rotateY: 0,
      top: previewTop,
      width: previewWidth,
      yPercent: -50,
    });
    gsap.fromTo(imgEl, { scale: 1.2 }, { duration: 0.5, ease: "power3.out", scale: 1 });
  };

  const handlePreviewMove = (e: React.MouseEvent) => {
    if (!isDesktopHoverAvailable()) {
      return;
    }
    if (!previewRef.current || !thumbRef.current) {
      return;
    }
    const thumbRect = thumbRef.current.getBoundingClientRect();
    const previewWidth = 288;
    const baseLeft = isEven ? thumbRect.right + 16 : thumbRect.left - previewWidth - 16;
    const baseTop = thumbRect.top + thumbRect.height / 2;
    const dx = e.clientX - thumbRect.left - thumbRect.width / 2;
    const dy = e.clientY - thumbRect.top - thumbRect.height / 2;
    gsap.to(previewRef.current, {
      duration: 0.35,
      ease: "power2.out",
      left: baseLeft + dx * 0.06,
      rotateX: -dy * 0.015,
      rotateY: dx * 0.015,
      top: baseTop + dy * 0.06,
    });
  };

  const handlePreviewLeave = () => {
    if (!previewRef.current || !thumbRef.current) {
      return;
    }
    const rect = thumbRef.current.getBoundingClientRect();
    gsap.killTweensOf(previewRef.current);
    gsap.to(previewRef.current, {
      duration: 0.3,
      ease: "power2.in",
      height: rect.height,
      left: rect.left,
      onComplete: () => {
        gsap.set(previewRef.current, { display: "none", yPercent: 0 });
      },
      opacity: 0,
      rotateX: 0,
      rotateY: 0,
      top: rect.top,
      width: rect.width,
      x: 0,
      y: 0,
      yPercent: 0,
    });
  };

  if (!project.image && !project.logo) {
    return null;
  }

  // Logos are square icons that get clipped at full bleed: give them a
  // small inset so they sit cleanly inside the container. Screenshots
  // (and the product layer on hover) stay full-bleed cover.
  const logoClass = project.logo ? "p-1.5 sm:p-2" : "";
  // Optional per-project shrink for logos that render too large
  // (e.g. the asocialmedia squircle). Scaled around the center via a
  // wrapper so the hover scale on the img itself keeps working.
  const logoScale =
    project.logoScale && project.logoScale > 0 && project.logoScale < 1 ? project.logoScale : 1;
  const primaryImg = (hoverScale: string) => (
    <div
      className="flex h-full w-full items-center justify-center"
      style={{ transform: `scale(${logoScale})` }}
    >
      <img
        alt={project.title}
        className={`w-full h-full object-cover ${hoverScale} ${logoClass}`}
        draggable={false}
        src={primarySrc}
      />
    </div>
  );

  if (!linkUrl) {
    return (
      <div
        className={`relative shrink-0 block overflow-hidden ${className}`}
        style={{ transform: isEven ? "rotate(-3deg)" : "rotate(3deg)" }}
      >
        {primaryImg("")}
        {hasDual && (
          <img
            alt={project.title}
            className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-300 hover:opacity-100"
            draggable={false}
            src={hoverSrc}
          />
        )}
      </div>
    );
  }

  return (
    <>
      <a
        ref={thumbRef}
        className={`group relative shrink-0 block overflow-hidden ${className}`}
        href={linkUrl}
        onMouseEnter={handlePreviewEnter}
        onMouseMove={handlePreviewMove}
        onMouseLeave={handlePreviewLeave}
        rel="noopener noreferrer"
        style={{ transform: isEven ? "rotate(-3deg)" : "rotate(3deg)" }}
        target="_blank"
      >
        {primaryImg("transition-transform duration-300 group-hover:scale-110")}
        {hasDual && (
          <img
            alt={project.title}
            className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:scale-110"
            draggable={false}
            src={hoverSrc}
          />
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/50 group-hover:opacity-100">
          <ArrowUpRightIcon className="text-white" size={24} />
        </div>
      </a>
      {isMounted
        ? createPortal(
            <div
              ref={previewRef}
              className="pointer-events-none fixed left-0 top-0 z-50 hidden origin-left"
              style={{ perspective: 800 }}
            >
              <div className="overflow-hidden shadow-2xl border border-white/10 bg-black/80 backdrop-blur-sm">
                <img
                  ref={previewImgRef}
                  alt={project.title}
                  className="block w-72 h-72 object-cover"
                  draggable={false}
                  src={project.image || project.logo}
                />
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
};

interface ProjectCardProps {
  index: number;
  onDetail?: (project: Project) => void;
  project: Project;
}

const ProjectCard = ({ index, onDetail, project }: ProjectCardProps) => {
  const [stackOpen, setStackOpen] = useState(false);
  const isEven = index % 2 === 0;

  const renderThumbnail = () => <ProjectThumb index={index} project={project} />;

  return (
    <div className={`flex items-center gap-3 sm:gap-4 ${isEven ? "" : "flex-row-reverse"}`}>
      {renderThumbnail()}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-xs sm:text-sm">{project.title}</h3>
        <p className="mt-1 text-justify text-gray-500 text-xs sm:text-sm">{project.desc}</p>
        <p className="mt-1 flex items-center gap-2 text-gray-400 text-xs">
          {stackOpen ? (
            <>
              {project.stack}{" "}
              <button
                className="text-gray-500 text-[11px] lowercase hover:text-gray-300 focus:outline-none"
                onClick={(e) => {
                  e.stopPropagation();
                  setStackOpen(false);
                }}
                type="button"
              >
                collapse
              </button>
            </>
          ) : (
            <>
              <button
                className="text-gray-500 text-[11px] lowercase hover:text-gray-300 focus:outline-none"
                onClick={(e) => {
                  e.stopPropagation();
                  setStackOpen(true);
                }}
                type="button"
              >
                stack
              </button>
              {project.readmeUrl && onDetail ? (
                <button
                  className="text-[#b58cff] text-[11px] lowercase hover:opacity-70 focus:outline-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDetail(project);
                  }}
                  type="button"
                >
                  detail
                </button>
              ) : null}
              {project.repoUrl && (
                <a
                  className="text-[#b58cff] text-[11px] lowercase hover:opacity-70"
                  href={project.repoUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  repo
                </a>
              )}
              {project.productUrl && (
                <a
                  className="text-[#b58cff] text-[11px] lowercase hover:opacity-70"
                  href={project.productUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  product
                </a>
              )}
            </>
          )}
        </p>
      </div>
    </div>
  );
};

// Steins;Gate worldline visualizer: a row of vertical audio bars that
// dance on play, plus a single glyph-only play/pause button. No audio
// attached yet, the motion is pure gsap. Gated behind reduced motion.
const PlayGlyph = () => (
  <svg aria-hidden fill="currentColor" viewBox="0 0 10 12" width="10">
    <path d="M0 0 L10 6 L0 12 Z" />
  </svg>
);

const PauseGlyph = () => (
  <svg aria-hidden fill="currentColor" viewBox="0 0 10 12" width="10">
    <rect height="12" width="3.5" x="0" />
    <rect height="12" width="3.5" x="6.5" />
  </svg>
);

export const WorldlineVisualizer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const barEls = useRef<HTMLSpanElement[]>([]);

  useEffect(() => {
    const bars = barEls.current;
    if (bars.length === 0) {
      return;
    }
    const reduced =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isPlaying && !reduced) {
      for (const [i, bar] of bars.entries()) {
        gsap.killTweensOf(bar);
        gsap.to(bar, {
          delay: i * 0.02,
          duration: 0.35 + Math.random() * 0.45,
          ease: "sine.inOut",
          repeat: -1,
          scaleY: 0.3 + Math.random() * 0.9,
          transformOrigin: "50% 50%",
          yoyo: true,
        });
      }
    } else {
      for (const bar of bars) {
        gsap.killTweensOf(bar);
        gsap.to(bar, {
          duration: 0.25,
          ease: "power2.out",
          scaleY: 0.25 + Math.random() * 0.3,
          transformOrigin: "50% 50%",
        });
      }
    }
  }, [isPlaying]);

  return (
    <div className="relative flex h-20 shrink-0 items-center justify-center">
      <div className="flex h-10 w-[79%] items-center gap-[3px] text-gray-500">
        {Array.from({ length: 28 }).map((_, i) => (
          <span
            key={i}
            ref={(el) => {
              if (el) {
                barEls.current[i] = el;
              }
            }}
            className="w-[2px] bg-current"
            style={{ height: "100%", transform: "scaleY(0.25)", transformOrigin: "50% 50%" }}
          />
        ))}
      </div>
      <button
        aria-label={isPlaying ? "pause" : "play"}
        className="absolute top-1/2 right-0 flex h-9 w-9 -translate-y-1/2 items-center justify-center text-gray-500 transition-colors duration-200 hover:text-gray-300"
        onClick={() => setIsPlaying((prev) => !prev)}
        type="button"
      >
        {isPlaying ? <PauseGlyph /> : <PlayGlyph />}
      </button>
    </div>
  );
};

interface ProjectListProps {
  initialData?: Project[];
  onDetail?: (project: Project) => void;
}

// Open source section: Hacktoberfest participation, open-source program
// stints, and the Holopin badge board. Rendered after the hackathon
// timeline.
export const OpenSourceSection = () => (
  <div className="shrink-0 space-y-5">
    <h3 className="font-medium text-base lowercase">open sourcerering</h3>
    <div className="space-y-3">
      <div className="space-y-1.5">
        <p className="font-mono text-[10px] uppercase tracking-wider text-gray-500">
          hacktoberfest 24 · mentor + participant · 16 PRs merged
        </p>
        <p className="font-mono text-[10px] uppercase tracking-wider text-gray-500">
          hacktoberfest 25 · mentor + participant · 48 PRs merged
        </p>
      </div>
      <p className="w-full text-justify text-xs leading-relaxed text-gray-400 sm:text-[13px]">
        Participated in Hacktoberfest 2024 and 2025 as both mentor and participant, merging 16 pull
        requests in 24 and 48 in 25 across open source projects.
      </p>
      <a
        className="inline-block"
        draggable={false}
        href="https://holopin.io/@parazeeknova"
        onContextMenu={(e) => e.preventDefault()}
        rel="noopener noreferrer"
        target="_blank"
      >
        <img
          alt="Holopin badges for parazeeknova"
          className="edge-fade w-full"
          draggable={false}
          src="https://holopin.me/parazeeknova"
        />
      </a>
    </div>
    <div className="space-y-6">
      <div>
        <h4 className="font-medium text-xs sm:text-sm">Social Winter of Code (SWOC)</h4>
        <p className="font-mono text-[10px] uppercase tracking-wider text-gray-500">
          Jan 2025 - Mar 2025 · India · Remote
        </p>
        <p className="mt-1.5 w-full text-justify text-xs leading-relaxed text-gray-400 sm:text-[13px]">
          Served as project admin and contributor: guided participants through their first
          open-source contributions, triaged issues, and kept the project healthy and mergeable for
          the whole program. Ranked 9th overall among all contributors by impact and activity.
        </p>
      </div>
      <div>
        <h4 className="font-medium text-xs sm:text-sm">Summer of Bitcoin</h4>
        <p className="font-mono text-[10px] uppercase tracking-wider text-gray-500">
          Feb 2025 - Mar 2025 · India · Remote
        </p>
        <p className="mt-1.5 w-full text-justify text-xs leading-relaxed text-gray-400 sm:text-[13px]">
          Selected for the Summer of Bitcoin 2025 bootcamp, Developer Track, an open-source program
          for Bitcoin development. Solved blockchain-focused challenges in Rust, working on Bitcoin
          node interactions, multisig transactions, mining, and descriptor wallets.
        </p>
      </div>
    </div>
  </div>
);
// Hackathon timeline: a rail of dated entries below the projects. Reads
// the same /api/projects data, filtered to the optional 'hackathon'
// section; renders nothing when there are no entries.
export const HackathonSection = ({ initialData }: { initialData?: Project[] }) => {
  const { data: projectData, isPending } = useProjects(initialData);
  const hackathons = (projectData ?? []).filter((p) => p.section === "hackathon");

  if (isPending) {
    return (
      <div className="shrink-0 space-y-3 skeleton-shimmer" aria-hidden>
        {[0, 1].map((i) => (
          <div className="flex gap-3" key={i}>
            <SkeletonBar className="h-4 w-1/3" />
            <SkeletonBar className="h-3 w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (hackathons.length === 0) {
    return null;
  }

  return (
    <div className="shrink-0 space-y-5">
      <h3 className="font-medium text-base lowercase">hacking goes brrr</h3>
      <div className="space-y-6">
        {hackathons.map((h) => {
          // Hackathons reuse the readme_url slot as an optional third photo.
          const imgs = [h.image, h.logo, h.readmeUrl].filter(Boolean);
          return (
            <div className="relative pl-6" key={h.title}>
              <span className="absolute left-[3px] top-2 bottom-0 w-px bg-border" aria-hidden />
              {/* eslint-disable-next-line react/no-danger -- meta carries the squiggle-highlight span */}
              <p
                className="font-mono text-[10px] uppercase tracking-wider text-gray-500"
                dangerouslySetInnerHTML={{ __html: h.stack }}
              />
              <h4 className="mt-1 font-medium text-xs sm:text-sm">{h.title}</h4>
              {h.desc && (
                <p className="mt-1.5 w-full text-justify text-xs leading-relaxed text-gray-400 sm:text-[13px]">
                  {h.desc}
                </p>
              )}
              {imgs.length > 0 && (
                <div className="mt-3 flex gap-2">
                  {imgs.map((src, imgIdx) => (
                    <img
                      alt={`${h.title} ${imgIdx + 1}`}
                      className="edge-fade flex-1 min-w-0 h-24 object-cover sm:h-28"
                      draggable={false}
                      key={src}
                      src={src}
                      style={{ transform: imgIdx % 2 === 0 ? "rotate(-3deg)" : "rotate(3deg)" }}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const ProjectList = ({ initialData, onDetail }: ProjectListProps) => {
  const { data: projectData, isPending } = useProjects(initialData);
  const [activeTab, setActiveTab] = useState<ProjectSection>("prod");
  const listRef = useRef<HTMLDivElement>(null);
  const isTabFirstRender = useRef(true);

  const groups = getProjectGroups(projectData);
  const resolvedTab = groups.some((g) => g.key === activeTab)
    ? activeTab
    : (groups[0]?.key ?? "prod");
  const filtered = (projectData ?? []).filter((p) => (p.section ?? "prod") === resolvedTab);

  const handleTabSelect = (next: string) => {
    const target: ProjectSection = next === "personal" || next === "freelance" ? next : "prod";
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

  useLayoutEffect(() => {
    if (isPending || !projectData || projectData.length === 0) {
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
        y: 18,
      },
      {
        duration: 0.65,
        ease: "power2.out",
        filter: "blur(0px)",
        opacity: 1,
        scale: 1,
        stagger: 0.09,
        y: 0,
      },
    );
  }, [isPending, projectData]);

  const renderProjects = () =>
    filtered.map((project, index) => (
      <ProjectCard key={project.title} index={index} onDetail={onDetail} project={project} />
    ));

  return (
    <div className="space-y-3 sm:space-y-4">
      {!isPending && groups.length > 1 && (
        <TabBar groups={groups} active={resolvedTab} onSelect={handleTabSelect} />
      )}
      <div className="space-y-3 sm:space-y-4" ref={listRef} style={{ perspective: 1000 }}>
        {isPending ? (
          <div className="skeleton-shimmer" aria-hidden>
            {[0, 1, 2].map((i) => (
              <div
                className={`flex items-center gap-3 sm:gap-4 ${i % 2 === 1 ? "flex-row-reverse" : ""}`}
                key={i}
              >
                <SkeletonThumb className="w-20 h-20 sm:w-28 sm:h-28" />
                <div className="flex-1 min-w-0 space-y-2">
                  <SkeletonBar className="h-3.5 w-2/3" />
                  <SkeletonBar className="h-3 w-full" />
                  <SkeletonBar className="h-3 w-4/5" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          renderProjects()
        )}
      </div>
    </div>
  );
};

interface MobileProjectListProps {
  initialData?: Project[];
  onDetail?: (project: Project) => void;
}

export const MobileProjectList = ({ initialData, onDetail }: MobileProjectListProps) => {
  const { data: projectData, isPending } = useProjects(initialData);
  const [activeTab, setActiveTab] = useState<ProjectSection>("prod");
  const [isExpanded, setIsExpanded] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const extraRef = useRef<HTMLDivElement>(null);
  const fadeRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);
  const isTabFirstRender = useRef(true);

  const groups = getProjectGroups(projectData);
  const resolvedTab = groups.some((g) => g.key === activeTab)
    ? activeTab
    : (groups[0]?.key ?? "prod");
  const filtered = (projectData ?? []).filter((p) => (p.section ?? "prod") === resolvedTab);

  const handleTabSelect = (next: string) => {
    const target: ProjectSection = next === "personal" || next === "freelance" ? next : "prod";
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
      onComplete: () => {
        setIsExpanded(false);
        setActiveTab(target);
      },
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
    const items = [...el.querySelectorAll(".project-card-visible")];
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

  useLayoutEffect(() => {
    if (isPending || !projectData || projectData.length === 0) {
      return;
    }
    const el = listRef.current;
    if (!el) {
      return;
    }

    const items = [...el.querySelectorAll(".project-card-visible")];
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
        y: 18,
      },
      {
        duration: 0.65,
        ease: "power2.out",
        filter: "blur(0px)",
        opacity: 1,
        scale: 1,
        stagger: 0.09,
        y: 0,
      },
    );
  }, [isPending, projectData]);

  useEffect(() => {
    isFirstRender.current = false;
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      return;
    }
    const extra = extraRef.current;
    if (!extra) {
      return;
    }
    const fade = fadeRef.current;

    if (isExpanded) {
      gsap.fromTo(
        extra,
        { height: 0, opacity: 0 },
        {
          duration: 0.3,
          ease: "power2.inOut",
          height: "auto",
          onComplete: () => {
            extra.style.overflow = "";
          },
          onStart: () => {
            extra.style.overflow = "hidden";
          },
          opacity: 1,
        },
      );
      if (fade) {
        gsap.to(fade, {
          duration: 0.3,
          ease: "power2.inOut",
          opacity: 0,
        });
      }
    } else {
      gsap.to(extra, {
        duration: 0.3,
        ease: "power2.inOut",
        height: 0,
        onStart: () => {
          extra.style.overflow = "hidden";
        },
        opacity: 0,
      });
      if (fade) {
        gsap.to(fade, {
          duration: 0.3,
          ease: "power2.inOut",
          opacity: 1,
        });
      }
    }
  }, [isExpanded]);

  if (isPending) {
    return (
      <div className="skeleton-shimmer" aria-hidden>
        {[0, 1, 2].map((i) => (
          <div
            className={`flex items-center gap-3 sm:gap-4 ${i % 2 === 1 ? "flex-row-reverse" : ""}`}
            key={i}
          >
            <SkeletonThumb className="w-20 h-20 sm:w-28 sm:h-28" />
            <div className="flex-1 min-w-0 space-y-2">
              <SkeletonBar className="h-3.5 w-2/3" />
              <SkeletonBar className="h-3 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!projectData || projectData.length === 0) {
    return null;
  }

  const hasMore = filtered.length > 3;

  return (
    <div className="space-y-3">
      {groups.length > 1 && (
        <TabBar groups={groups} active={resolvedTab} onSelect={handleTabSelect} />
      )}
      <div className="relative space-y-3 sm:space-y-4" ref={listRef} style={{ perspective: 1000 }}>
        {filtered.slice(0, 3).map((project, index) => (
          <div key={project.title} className="project-card-visible">
            <ProjectCard index={index} onDetail={onDetail} project={project} />
          </div>
        ))}

        {hasMore && (
          <div
            className="space-y-3 sm:space-y-4 overflow-hidden mt-3 sm:mt-4"
            ref={extraRef}
            style={{ height: 0, opacity: 0 }}
          >
            {filtered.slice(3).map((project, index) => (
              <ProjectCard
                key={project.title}
                index={index + 3}
                onDetail={onDetail}
                project={project}
              />
            ))}
          </div>
        )}

        {hasMore && (
          <div
            className="pointer-events-none absolute right-0 bottom-0 left-0 h-16 fade-overlay"
            ref={fadeRef}
          />
        )}
      </div>

      {hasMore && (
        <button
          className="link-underline mt-1 text-gray-400 text-xs w-full text-center select-none cursor-pointer"
          onClick={() => setIsExpanded((prev) => !prev)}
          type="button"
        >
          {isExpanded ? "view less" : "see more"}
        </button>
      )}
    </div>
  );
};
