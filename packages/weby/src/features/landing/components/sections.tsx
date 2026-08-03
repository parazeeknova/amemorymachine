import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { ExperienceItem, Link, Profile } from "#/shared/types";
import { gsap } from "gsap";
import {
  ArrowUpRightIcon,
  GithubLogoIcon,
  LinkedinLogoIcon,
  XLogoIcon,
  EnvelopeSimpleIcon,
} from "@phosphor-icons/react";
import { AnimatedLink } from "#/shared/components/animated-link";
import { ResumeModal } from "#/shared/components/resume-modal";
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
        <p className="mb-6 flex items-center gap-2.5 text-sm sm:mb-8">
          {profile?.username && (
            <span className="opacity-60" style={{ fontFamily: '"Ubuntu Mono", monospace' }}>
              @{profile.username}
            </span>
          )}
          {portfolio && (
            <AnimatedLink
              className="squiggle-link flex items-center gap-1"
              href={portfolio.url}
              rel="noopener noreferrer"
              target="_blank"
            >
              portfolio
              <ArrowUpRightIcon size={13} />
            </AnimatedLink>
          )}
          {profile?.resumeUrl && (
            <button
              className="squiggle-link flex cursor-pointer items-center gap-1 bg-transparent p-0 font-inherit text-inherit"
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
        <ResumeModal onClose={() => setIsResumeOpen(false)} url={profile.resumeUrl} />
      )}

      {descriptionHtml && (
        <div
          className="prose-desc text-sm leading-relaxed sm:text-base"
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

export const ExperienceSection = ({ experience, isPending }: ExperienceSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const extraRef = useRef<HTMLDivElement>(null);
  const fadeRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

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

  const hasMore = experience.length > 3;

  return (
    <div className="shrink-0 space-y-3 sm:space-y-4">
      <div className="relative space-y-3 sm:space-y-4" ref={listRef} style={{ perspective: 1000 }}>
        {experience.slice(0, 3).map((item) => (
          <div key={item.title} className="experience-item">
            <h3 className="font-medium text-xs sm:text-sm">{item.title}</h3>
            <p className="text-gray-500 text-xs sm:text-sm">
              {item.location} | {item.period}
            </p>
          </div>
        ))}

        {hasMore && (
          <div
            className="space-y-3 sm:space-y-4 overflow-hidden mt-3 sm:mt-4"
            ref={extraRef}
            style={{ height: 0, opacity: 0 }}
          >
            {experience.slice(3).map((item) => (
              <div key={item.title}>
                <h3 className="font-medium text-xs sm:text-sm">{item.title}</h3>
                <p className="text-gray-500 text-xs sm:text-sm">
                  {item.location} | {item.period}
                </p>
              </div>
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
          className="link-underline mt-1 text-gray-400 text-xs w-full text-center sm:text-left sm:w-auto select-none cursor-pointer"
          onClick={() => setIsExpanded((prev) => !prev)}
          type="button"
        >
          {isExpanded ? "view less" : "see more"}
        </button>
      )}
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
