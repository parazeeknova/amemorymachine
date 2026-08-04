import { memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { ExperienceItem, Link, Profile, Project } from "#/shared/types";
import { gsap } from "gsap";
import { useTheme } from "#/shared/hooks/use-theme";
import {
  ArrowUpRightIcon,
  GithubLogoIcon,
  LinkedinLogoIcon,
  XLogoIcon,
  EnvelopeSimpleIcon,
} from "@phosphor-icons/react";
import { AnimatedLink } from "#/shared/components/animated-link";
import { IframeModal } from "#/shared/components/iframe-modal";
import { SkeletonBar } from "#/shared/components/skeleton";
import { useSquiggleDraw } from "#/shared/hooks/use-squiggle-draw";
import { markdownToHtml } from "#/features/blog/lib/markdown-to-html";

const getLink = (links: Record<string, Link> | undefined, key: string): Link | undefined => {
  if (!links) {
    return undefined;
  }
  if (links[key]) {
    return links[key];
  }
  const matchedKey = Object.keys(links).find((k) => k.includes(key));
  return matchedKey ? links[matchedKey] : undefined;
};

interface ProfileSectionProps {
  isMobile?: boolean;
  isPending?: boolean;
  profile: Profile | undefined;
}

// eslint-disable-next-line complexity
export const ProfileSection = ({ profile, isPending }: ProfileSectionProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const portfolio = getLink(profile?.links, "portfolio");
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  const [isPortfolioOpen, setIsPortfolioOpen] = useState(false);
  const isProfileReady = !isPending && Boolean(profile);

  // Draw the squiggly description underlines in after the text reveal.
  useSquiggleDraw(isProfileReady, sectionRef, { delay: 0.45 });

  // useLayoutEffect so GSAP applies the hidden "from" state before the browser
  // paints the freshly mounted content — the skeleton hands off to the blurred
  // reveal state with no flash of fully-rendered content in between.
  useLayoutEffect(() => {
    if (isPending || !profile) {
      return;
    }
    const el = sectionRef.current;
    if (!el) {
      return;
    }

    const children = [...el.children];
    if (children.length === 0) {
      return;
    }

    gsap.killTweensOf(children);
    gsap.fromTo(
      children,
      {
        filter: "blur(12px)",
        opacity: 0,
        scale: 0.98,
        y: 16,
      },
      {
        duration: 0.65,
        ease: "power2.out",
        filter: "blur(0px)",
        opacity: 1,
        scale: 1,
        stagger: 0.08,
        y: 0,
      },
    );
  }, [isPending, profile]);

  const descriptionHtml = useMemo(
    () => (profile?.description ? markdownToHtml(profile.description) : ""),
    [profile?.description],
  );

  // While the profile is still loading, render soft bars that mirror the final
  // layout (name line, tagline/email line, description paragraphs). The GSAP
  // fade-in above then animates from these to the real content, so the swap
  // reads as one continuous reveal instead of a jarring skeleton->content jump.
  if (isPending && !profile) {
    return (
      <div className="shrink-0 skeleton-shimmer" aria-hidden>
        <SkeletonBar className="h-12 w-3/5 sm:h-16" />
        <div className="mt-5 mb-6 space-y-1 sm:mb-8">
          <SkeletonBar className="h-4 w-2/5" />
        </div>
        <div className="space-y-2">
          <SkeletonBar className="h-3.5 w-full" />
          <SkeletonBar className="h-3.5 w-11/12" />
          <SkeletonBar className="h-3.5 w-4/5" />
        </div>
      </div>
    );
  }

  return (
    <div className="shrink-0" ref={sectionRef} style={{ perspective: 1000 }}>
      {profile?.name && (
        <h1 className="font-display font-normal text-5xl sm:text-7xl pl-2">{profile.name}</h1>
      )}

      {(profile?.username || portfolio || profile?.resumeUrl) && (
        <p className="mb-6 flex items-baseline gap-2.5 text-sm sm:mb-8">
          {profile?.username && (
            <span className="opacity-60" style={{ fontFamily: '"Ubuntu Mono", monospace' }}>
              @{profile.username}
            </span>
          )}
          {portfolio && (
            <button
              className="squiggle-link inline-flex cursor-pointer items-baseline gap-1 bg-transparent p-0 font-inherit text-inherit"
              onClick={() => setIsPortfolioOpen(true)}
              type="button"
            >
              portfolio
              <ArrowUpRightIcon size={13} />
            </button>
          )}
          {profile?.resumeUrl && (
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

      {isResumeOpen && profile?.resumeUrl && (
        <IframeModal
          onClose={() => setIsResumeOpen(false)}
          title="resume"
          url={profile.resumeUrl}
        />
      )}
      {isPortfolioOpen && portfolio?.url && (
        <IframeModal
          onClose={() => setIsPortfolioOpen(false)}
          title="portfolio"
          url={portfolio.url}
        />
      )}

      {descriptionHtml && (
        <div
          className="prose-desc text-sm leading-relaxed text-justify sm:text-base"
          dangerouslySetInnerHTML={{ __html: descriptionHtml }}
        />
      )}
    </div>
  );
};

interface ExperienceSectionProps {
  experience: ExperienceItem[] | undefined;
  isPending?: boolean;
}

export type ExperienceTabKey = "professional" | "research" | "university clubs";

export interface TabGroup {
  key: string;
}

export const getExperienceGroups = (experience: ExperienceItem[] | undefined): TabGroup[] => {
  const professional = (experience ?? []).filter((e) => e.section === "professional" || !e.section);
  const research = (experience ?? []).filter((e) => e.section === "research");
  const clubs = (experience ?? []).filter((e) => e.section === "university clubs");
  return [
    ...(professional.length > 0 ? [{ key: "professional" as const }] : []),
    ...(research.length > 0 ? [{ key: "research" as const }] : []),
    ...(clubs.length > 0 ? [{ key: "university clubs" as const }] : []),
  ];
};

export const getProjectGroups = (projects: Project[] | undefined): TabGroup[] => {
  const prod = (projects ?? []).filter((p) => p.section === "prod" || !p.section);
  const personal = (projects ?? []).filter((p) => p.section === "personal");
  const freelance = (projects ?? []).filter((p) => p.section === "freelance");
  return [
    ...(prod.length > 0 ? [{ key: "prod" as const }] : []),
    ...(personal.length > 0 ? [{ key: "personal" as const }] : []),
    ...(freelance.length > 0 ? [{ key: "freelance" as const }] : []),
  ];
};

export const TabBar = memo(
  ({
    groups,
    active,
    onSelect,
  }: {
    groups: TabGroup[];
    active: string;
    onSelect: (key: string) => void;
  }) => {
    const { isDarkMode } = useTheme();
    const indicatorRef = useRef<HTMLDivElement>(null);
    const tabRefs = useRef<Partial<Record<string, HTMLButtonElement | null>>>({});
    const isFirstRender = useRef(true);

    useLayoutEffect(() => {
      const btn = tabRefs.current[active];
      const indicator = indicatorRef.current;
      if (!btn || !indicator) {
        return;
      }
      if (isFirstRender.current) {
        isFirstRender.current = false;
        gsap.set(indicator, { left: btn.offsetLeft, width: btn.offsetWidth });
        return;
      }
      gsap.killTweensOf(indicator);
      // the squiggle is reborn under the new tab: it draws in left to right
      // (width grows from 0) while the wave bulges and wobbles as it lands
      gsap.set(indicator, { left: btn.offsetLeft, width: 0 });
      gsap.to(indicator, {
        duration: 0.5,
        ease: "power3.out",
        width: btn.offsetWidth,
      });
      gsap.fromTo(
        indicator,
        { opacity: 0.4, rotation: -3, scaleY: 2 },
        {
          duration: 0.6,
          ease: "elastic.out(1.1, 0.4)",
          opacity: 1,
          rotation: 0,
          scaleY: 1,
          transformOrigin: "50% 100%",
        },
      );
    }, [active]);

    const squiggleSvg = isDarkMode
      ? "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='7' viewBox='0 0 20 7'%3E%3Cpath d='M0 4 C 2.5 1.5, 5 1.5, 7.5 4 S 12.5 6.5, 15 4 S 20 1.5, 20 4' fill='none' stroke='%23b58cff' stroke-width='2.2' stroke-linecap='round'/%3E%3C/svg%3E\")"
      : "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='7' viewBox='0 0 20 7'%3E%3Cpath d='M0 4 C 2.5 1.5, 5 1.5, 7.5 4 S 12.5 6.5, 15 4 S 20 1.5, 20 4' fill='none' stroke='%237c3aed' stroke-width='2.2' stroke-linecap='round'/%3E%3C/svg%3E\")";

    return (
      <div className="relative inline-flex items-baseline gap-6">
        {groups.map((group) => {
          const isActive = group.key === active;
          const textClass = {
            active: isDarkMode ? "text-text-dark" : "text-text-light",
            idle: isDarkMode
              ? "text-text-dark/45 hover:text-text-dark/80"
              : "text-text-light/45 hover:text-text-light/80",
          }[isActive ? "active" : "idle"];
          return (
            <button
              key={group.key}
              ref={(el) => {
                tabRefs.current[group.key] = el;
              }}
              className={`relative z-10 px-0.5 pb-1 text-xs lowercase transition-colors duration-200 select-none cursor-pointer ${textClass}`}
              onClick={() => onSelect(group.key)}
              type="button"
            >
              {group.key}
            </button>
          );
        })}
        <div
          ref={indicatorRef}
          className="absolute left-0 -bottom-1 h-[7px]"
          style={{
            backgroundImage: squiggleSvg,
            backgroundPosition: "left bottom",
            backgroundRepeat: "repeat-x",
            willChange: "left, width, transform",
          }}
        />
      </div>
    );
  },
);

const ExperienceRow = memo(
  ({ item, withAnimClass }: { item: ExperienceItem; withAnimClass?: boolean }) => (
    <div key={item.title} className={withAnimClass ? "experience-item" : undefined}>
      <h3 className="font-medium text-xs sm:text-sm">{item.title}</h3>
      <p className="text-gray-500 text-xs sm:text-sm">
        {item.location} | {item.period}
      </p>
      {item.description &&
        (item.section === "research" ? (
          // Research entries carry markdown links (paper, ORCID) in the
          // description, so render them as HTML instead of plain text.
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
  ),
);

export const ExperienceSection = ({ experience, isPending }: ExperienceSectionProps) => {
  const [activeTab, setActiveTab] = useState<ExperienceTabKey>("professional");
  const [isExpanded, setIsExpanded] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const extraRef = useRef<HTMLDivElement>(null);
  const fadeRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);
  const isTabFirstRender = useRef(true);

  const professional = (experience ?? []).filter((e) => e.section === "professional" || !e.section);
  const research = (experience ?? []).filter((e) => e.section === "research");
  const clubs = (experience ?? []).filter((e) => e.section === "university clubs");
  const groups = getExperienceGroups(experience);
  const resolvedTab = groups.some((g) => g.key === activeTab)
    ? activeTab
    : (groups[0]?.key ?? "professional");
  const activeItems =
    {
      professional,
      research,
      "university clubs": clubs,
    }[resolvedTab] ?? [];
  const hasMore = resolvedTab === "professional" && professional.length > 3;
  const visibleItems = hasMore ? professional.slice(0, 3) : activeItems;
  const extraItems = hasMore ? professional.slice(3) : [];

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
    if (isPending || !experience || experience.length === 0) {
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
        y: 16,
      },
      {
        duration: 0.65,
        ease: "power2.out",
        filter: "blur(0px)",
        opacity: 1,
        scale: 1,
        stagger: 0.07,
        y: 0,
      },
    );
  }, [isPending, experience]);

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
  }, [activeTab, experience]);

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
      <div className="shrink-0 space-y-3 skeleton-shimmer sm:space-y-4" aria-hidden>
        {[0, 1, 2].map((i) => (
          <div className="space-y-1" key={i}>
            <SkeletonBar className="h-3.5 w-1/2" />
            <SkeletonBar className="h-3 w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  if (!experience || experience.length === 0) {
    return null;
  }

  return (
    <div className="shrink-0 space-y-6">
      <h3 className="font-medium text-base lowercase">work i did</h3>
      {groups.length > 1 && (
        <TabBar groups={groups} active={activeTab} onSelect={handleTabSelect} />
      )}
      <div ref={listRef} className="relative space-y-3 sm:space-y-4" style={{ perspective: 1000 }}>
        {visibleItems.map((item) => (
          <ExperienceRow item={item} key={item.title} withAnimClass />
        ))}

        {/* Club photos: optional per-entry images collected into a
            single-row strip under the university clubs tab. */}
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
                    className="flex-1 min-w-0 h-24 object-cover border border-border sm:h-28"
                    key={src}
                    src={src}
                    style={{ transform: imgIdx % 2 === 0 ? "rotate(-3deg)" : "rotate(3deg)" }}
                  />
                ))}
              </div>
            );
          })()}

        {extraItems.length > 0 && (
          <div
            className="space-y-3 sm:space-y-4 overflow-hidden mt-3 sm:mt-4"
            ref={extraRef}
            style={{ height: 0, opacity: 0 }}
          >
            {extraItems.map((item) => (
              <ExperienceRow item={item} key={item.title} />
            ))}
          </div>
        )}

        {extraItems.length > 0 && (
          <div
            className="pointer-events-none absolute right-0 bottom-0 left-0 h-16 fade-overlay"
            ref={fadeRef}
          />
        )}

        {hasMore && (
          <button
            className="link-underline mt-1 text-gray-400 text-xs w-full text-center sm:text-left sm:w-auto select-none cursor-pointer"
            onClick={() => setIsExpanded((prev) => !prev)}
            type="button"
          >
            {isExpanded ? "view less" : "see more"}
          </button>
        )}
      </div>
    </div>
  );
};

interface SocialLinksProps {
  profile: Profile | undefined;
}

export const SocialLinks = ({ profile }: SocialLinksProps) => {
  const github = getLink(profile?.links, "github");
  const linkedin = getLink(profile?.links, "linkedin");
  const twitter = getLink(profile?.links, "twitter");

  return (
    <div className="flex items-center gap-4">
      {github?.url && (
        <AnimatedLink
          href={github.url}
          rel="noopener noreferrer"
          target="_blank"
          className="text-text-light/60 dark:text-text-dark/60 hover:text-text-light dark:hover:text-text-dark flex items-center gap-1.5"
          aria-label="GitHub"
        >
          <GithubLogoIcon size={18} />
          <span className="hidden sm:inline text-sm lowercase">{github.label}</span>
        </AnimatedLink>
      )}
      {linkedin?.url && (
        <AnimatedLink
          href={linkedin.url}
          rel="noopener noreferrer"
          target="_blank"
          className="text-text-light/60 dark:text-text-dark/60 hover:text-text-light dark:hover:text-text-dark flex items-center gap-1.5"
          aria-label="LinkedIn"
        >
          <LinkedinLogoIcon size={18} />
          <span className="hidden sm:inline text-sm lowercase">{linkedin.label}</span>
        </AnimatedLink>
      )}
      {twitter?.url && (
        <AnimatedLink
          href={twitter.url}
          rel="noopener noreferrer"
          target="_blank"
          className="text-text-light/60 dark:text-text-dark/60 hover:text-text-light dark:hover:text-text-dark flex items-center gap-1.5"
          aria-label="Twitter/X"
        >
          <XLogoIcon size={18} />
          <span className="hidden sm:inline text-sm lowercase">{twitter.label}</span>
        </AnimatedLink>
      )}
      {profile?.email && (
        <AnimatedLink
          href={`mailto:${profile.email}`}
          rel="noopener noreferrer"
          className="text-text-light/60 dark:text-text-dark/60 hover:text-text-light dark:hover:text-text-dark flex items-center gap-1.5"
          aria-label="Email"
        >
          <EnvelopeSimpleIcon size={18} />
          <span className="hidden sm:inline text-sm lowercase">email</span>
        </AnimatedLink>
      )}
    </div>
  );
};
