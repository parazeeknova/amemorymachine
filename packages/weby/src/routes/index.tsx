import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import { gsap } from "gsap";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type { BlogManifestSection, ExperienceItem, Profile, Project } from "#/shared/types";
import { GitHubActivity } from "#/features/github/components/calendar";
import { GitHubStats } from "#/features/github/components/stats";
import { CodeforcesCard } from "#/features/codeforces/components/card";
import { useCFSettings } from "#/features/templates/hooks/use-cf-settings";
import {
  ExperienceSection,
  ProfileSection,
  SocialLinks,
} from "#/features/landing/components/sections";
import { ReadmeViewer } from "#/features/landing/components/readme-viewer";
import {
  HackathonSection,
  OpenSourceSection,
  ProjectList,
  WorldlineVisualizer,
} from "#/features/landing/components/projects";
import { BlogReaderPanel } from "#/features/blog/components/blog-reader-panel";
import { LoginPopup } from "#/features/auth/components/login-popup";
import { useIsDesktop } from "#/shared/lib/desktop";
import { logger } from "#/shared/lib/logger";
import { DesktopFrontPage } from "#/features/auth/components/desktop-front-page";
import {
  useBlogManifest,
  useExperience,
  useIsFetchingData,
  useProfile,
  useProjects,
} from "#/features/landing/hooks/use-data";
import { getBlogManifest, getExperience, getProfile, getProjects } from "#/server/backy";
import {
  buildPersonJsonLd,
  buildPortfolioDescription,
  buildPortfolioTitle,
  buildWebSiteJsonLd,
  getSiteOrigin,
} from "#/server/seo";
import { useTheme } from "#/shared/hooks/use-theme";
import { crossfadeVideo, getHeaderGradient } from "#/shared/lib/video-helpers";

interface PortfolioLoaderData {
  profile?: Profile;
  experience?: ExperienceItem[];
  projects?: Project[];
  manifest?: BlogManifestSection[];
}

const useIsMobile = (): boolean => {
  const getSnapshot = useCallback(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return window.innerWidth < 1024;
  }, []);

  const getServerSnapshot = useCallback(() => false, []);

  // eslint-disable-next-line promise/prefer-await-to-callbacks -- useSyncExternalStore requires callback pattern
  const subscribe = useCallback((callback: () => void) => {
    // eslint-disable-next-line promise/prefer-await-to-callbacks -- event handler callback required
    const handleResize = () => callback();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
};

interface ThemeButtonRefs {
  buttonRef: React.RefObject<HTMLButtonElement | null>;
  indicatorRef: React.RefObject<HTMLSpanElement | null>;
}

const useThemeButtonHover = (): ThemeButtonRefs => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const themeButton = buttonRef.current;
    const themeIndicator = indicatorRef.current;
    if (!(themeButton && themeIndicator)) {
      return;
    }

    const enter = () => {
      const { color } = getComputedStyle(themeButton);
      gsap.to(themeIndicator, {
        backgroundColor: color,
        borderWidth: 0,
        duration: 0.18,
        ease: "power2.out",
      });
    };

    const leave = () => {
      gsap.to(themeIndicator, {
        backgroundColor: "rgba(0,0,0,0)",
        borderWidth: 1,
        duration: 0.18,
        ease: "power2.in",
      });
    };

    themeButton.addEventListener("mouseenter", enter);
    themeButton.addEventListener("mouseleave", leave);
    themeButton.addEventListener("focus", enter);
    themeButton.addEventListener("blur", leave);

    return () => {
      themeButton.removeEventListener("mouseenter", enter);
      themeButton.removeEventListener("mouseleave", leave);
      themeButton.removeEventListener("focus", enter);
      themeButton.removeEventListener("blur", leave);
    };
  }, []);

  return { buttonRef, indicatorRef };
};

// eslint-disable-next-line complexity
const Home = function Home() {
  // eslint-disable-next-line no-use-before-define -- Route is defined below
  const loaderData = Route.useLoaderData();
  const isDesktop = useIsDesktop();
  const { isDarkMode, toggleTheme: toggleThemeStore } = useTheme();

  const [viewMode, setViewMode] = useState<"portfolio" | "blogs">("portfolio");
  const [selectedBlogSlug, setSelectedBlogSlug] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<{
    productUrl?: string;
    readmeUrl: string;
    repoUrl?: string;
    title: string;
  } | null>(null);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleScroll = () => {
      const { body } = document;
      const doc = document.documentElement;

      const scrollTop = Math.max(window.scrollY, body.scrollTop, doc.scrollTop);
      const clientHeight = window.innerHeight || doc.clientHeight || body.clientHeight;
      const scrollHeight = Math.max(body.scrollHeight, doc.scrollHeight);

      const isScrollable = scrollHeight > clientHeight + 50;
      const atBottom = isScrollable && scrollTop + clientHeight >= scrollHeight - 40;

      setIsAtBottom(atBottom);
    };

    document.addEventListener("scroll", handleScroll, { capture: true, passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    handleScroll();

    return () => {
      document.removeEventListener("scroll", handleScroll, { capture: true });
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  const themeRefs = useThemeButtonHover();
  const themeRefsRight = useThemeButtonHover();

  const { data: profile } = useProfile(loaderData?.profile);
  const { data: experience } = useExperience(loaderData?.experience);
  const { data: projects } = useProjects(loaderData?.projects);

  useEffect(() => {
    if (profile) {
      logger.info(profile, "landing page profile data");
    }
  }, [profile]);
  const { data: manifest = [] } = useBlogManifest(loaderData?.manifest);
  const queriesPending = useIsFetchingData({
    experience: loaderData?.experience,
    profile: loaderData?.profile,
    projects: loaderData?.projects,
  });
  // When the loader provided data (SSR or client-side navigation), the page
  // never shows loading skeletons — content renders immediately and matches
  // the server HTML exactly.
  const isPending =
    !loaderData?.profile && !loaderData?.experience && !loaderData?.projects
      ? queriesPending
      : false;

  if (isDesktop) {
    return <DesktopFrontPage />;
  }

  const firstPostSlug = useMemo(() => {
    for (const section of manifest) {
      if (section.children && section.children.length > 0) {
        return section.children[0].slug;
      }
    }
    return null;
  }, [manifest]);

  const firstProject = useMemo(() => projects?.find((p) => p.readmeUrl) ?? null, [projects]);

  // Auto-select first blog or first project with readme
  useEffect(() => {
    if (selectedBlogSlug || selectedProject) {
      return;
    }
    if (firstPostSlug) {
      setSelectedBlogSlug(firstPostSlug);
    } else if (firstProject?.readmeUrl) {
      setSelectedProject({
        productUrl: firstProject.productUrl,
        readmeUrl: firstProject.readmeUrl,
        repoUrl: firstProject.repoUrl,
        title: firstProject.title,
      });
    }
  }, [firstPostSlug, firstProject, selectedBlogSlug, selectedProject]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const nextVideoRef = useRef<HTMLVideoElement>(null);
  const gradientRef = useRef<HTMLDivElement>(null);
  const videoHeaderRef = useRef<HTMLDivElement>(null);
  const videoActiveNext = useRef(false);

  // Reveal the header video with the same blur-fade the content below uses,
  // so the whole first screen animates in as one. The container itself is
  // faded (not the <video> children, which keep their own opacity logic for
  // theme crossfades).
  useLayoutEffect(() => {
    if (isPending) {
      return;
    }
    const el = videoHeaderRef.current;
    if (!el) {
      return;
    }
    gsap.killTweensOf(el);
    gsap.fromTo(
      el,
      { filter: "blur(12px)", opacity: 0, scale: 1.02, y: -8 },
      {
        duration: 0.8,
        ease: "power2.out",
        filter: "blur(0px)",
        opacity: 1,
        scale: 1,
        y: 0,
      },
    );
  }, [isPending]);

  useEffect(() => {
    const darkSrc = profile?.darkVideo || "/header.webm";
    const lightSrc = profile?.lightVideo || "/footer.webm";
    const src = isDarkMode ? darkSrc : lightSrc;
    const safePlay = async (video: HTMLVideoElement) => {
      try {
        await video.play();
      } catch {
        // Ignore autoplay errors
      }
    };
    if (videoActiveNext.current) {
      if (nextVideoRef.current) {
        if (nextVideoRef.current.getAttribute("src") !== src) {
          nextVideoRef.current.src = src;
        }
        nextVideoRef.current.style.opacity = "1";
        void safePlay(nextVideoRef.current);
      }
      if (videoRef.current) {
        videoRef.current.style.opacity = "0";
      }
    } else {
      if (videoRef.current) {
        if (videoRef.current.getAttribute("src") !== src) {
          videoRef.current.src = src;
        }
        videoRef.current.style.opacity = "1";
        void safePlay(videoRef.current);
      }
      if (nextVideoRef.current) {
        nextVideoRef.current.style.opacity = "0";
      }
    }
  }, [isDarkMode, profile?.darkVideo, profile?.lightVideo]);

  const toggleTheme = useCallback(() => {
    toggleThemeStore();
  }, [toggleThemeStore]);

  const animatedToggleTheme = useCallback(() => {
    const nextDark = !isDarkMode;
    const darkSrc = profile?.darkVideo || "/header.webm";
    const lightSrc = profile?.lightVideo || "/footer.webm";
    const nextSrc = nextDark ? darkSrc : lightSrc;
    const fromRef = videoActiveNext.current ? nextVideoRef : videoRef;
    const toRef = videoActiveNext.current ? videoRef : nextVideoRef;

    crossfadeVideo(fromRef, toRef, nextSrc, () => {
      videoActiveNext.current = !videoActiveNext.current;
      toggleTheme();
    });
  }, [isDarkMode, profile?.darkVideo, profile?.lightVideo, toggleTheme]);

  const handleProjectDetail = useCallback(
    (project: { productUrl?: string; readmeUrl?: string; repoUrl?: string; title: string }) => {
      if (!project.readmeUrl) {
        return;
      }
      setSelectedBlogSlug(null);
      setSelectedProject({
        productUrl: project.productUrl,
        readmeUrl: project.readmeUrl,
        repoUrl: project.repoUrl,
        title: project.title,
      });
      setViewMode("blogs");
    },
    [],
  );

  const handleSelectPost = useCallback((slug: string) => {
    setSelectedProject(null);
    setSelectedBlogSlug(slug);
    setViewMode("blogs");
  }, []);

  // Extract GitHub username from profile or env
  const githubUsername = (() => {
    const url = profile?.links?.github?.url;
    if (url) {
      const match = url.match(/github\.com\/([^/]+)/);
      if (match) {
        return match[1];
      }
    }
    return "parazeeknova";
  })();

  const { data: cfSettings } = useCFSettings();

  useEffect(() => {
    if (cfSettings) {
      logger.info(
        { enabled: cfSettings.enabled, username: cfSettings.username },
        "landing: cf settings loaded",
      );
    }
  }, [cfSettings]);

  if (viewMode === "blogs") {
    const activeSlug = selectedBlogSlug ?? firstPostSlug ?? "";
    return (
      <div
        data-theme={isDarkMode ? "dark" : "light"}
        className={`h-screen w-full select-none overflow-hidden ${
          isDarkMode ? "bg-bg-dark text-text-dark" : "bg-bg-light text-text-light"
        }`}
      >
        {selectedProject ? (
          <ReadmeViewer
            isDarkMode={isDarkMode}
            isMobile={isMobile}
            manifest={manifest}
            onBack={() => {
              setSelectedProject(null);
              if (firstPostSlug) {
                setSelectedBlogSlug(firstPostSlug);
              }
            }}
            onSelectPost={handleSelectPost}
            onSelectProject={handleProjectDetail}
            onSwitchToAbout={() => setViewMode("portfolio")}
            onToggleTheme={toggleTheme}
            productUrl={selectedProject.productUrl}
            projectTitle={selectedProject.title}
            projects={projects}
            readmeUrl={selectedProject.readmeUrl}
            repoUrl={selectedProject.repoUrl}
            themeButtonRef={themeRefsRight.buttonRef as React.RefObject<HTMLButtonElement | null>}
            themeIndicatorRef={
              themeRefsRight.indicatorRef as React.RefObject<HTMLSpanElement | null>
            }
          />
        ) : (
          <BlogReaderPanel
            isDarkMode={isDarkMode}
            isMobile={isMobile}
            manifest={manifest}
            onSelectPost={handleSelectPost}
            onSelectProject={handleProjectDetail}
            onSwitchToAbout={() => setViewMode("portfolio")}
            onToggleTheme={toggleTheme}
            projects={projects}
            slug={activeSlug}
            themeButtonRef={themeRefsRight.buttonRef as React.RefObject<HTMLButtonElement | null>}
            themeIndicatorRef={
              themeRefsRight.indicatorRef as React.RefObject<HTMLSpanElement | null>
            }
          />
        )}
      </div>
    );
  }

  const headerGradient = getHeaderGradient(isDarkMode);

  return (
    <div
      data-theme={isDarkMode ? "dark" : "light"}
      className={`min-h-screen w-full select-none overflow-y-auto transition-colors duration-500 ${
        isDarkMode ? "bg-bg-dark text-text-dark" : "bg-bg-light text-text-light"
      }`}
    >
      {/* Header Video */}
      <div
        ref={videoHeaderRef}
        className="relative mx-auto w-full max-w-3xl h-48 sm:h-64 overflow-hidden"
        style={{ opacity: 0 }}
      >
        <video
          ref={nextVideoRef}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0 }}
          src={profile?.lightVideo || "/footer.webm"}
        />
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          src={profile?.darkVideo || "/header.webm"}
        />
        <div
          ref={gradientRef}
          className="absolute inset-0 -bottom-1 pointer-events-none"
          style={{ background: headerGradient }}
        />
      </div>

      <div className="-mt-1 mx-auto flex max-w-3xl flex-col gap-6 sm:gap-8 p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-end gap-3 w-full">
          <button
            className={`text-[13px] lowercase focus:outline-none hover:opacity-70 ${
              isDarkMode
                ? "text-text-dark/60 hover:text-text-dark"
                : "text-text-light/60 hover:text-text-light"
            }`}
            onClick={() => setViewMode("blogs")}
            type="button"
          >
            blogs
          </button>
          <button
            aria-label="Toggle theme"
            className="rounded-full p-2 focus:outline-none focus-visible:ring-1 focus-visible:ring-current/40"
            onClick={animatedToggleTheme}
            ref={themeRefs.buttonRef}
            type="button"
          >
            <span className="sr-only">Toggle theme</span>
            <span
              className="block h-3 w-3 rounded-full border border-current"
              ref={themeRefs.indicatorRef}
              style={{ backgroundColor: "transparent" }}
            />
          </button>
        </div>

        <ProfileSection isMobile={isMobile} isPending={isPending} profile={profile} />

        <ExperienceSection experience={experience} isPending={isPending} />

        <div className="shrink-0 space-y-2">
          <h3 className="font-medium text-base">voo look what i made</h3>
          <ProjectList initialData={loaderData?.projects} onDetail={handleProjectDetail} />
        </div>

        <HackathonSection initialData={loaderData?.projects} />

        <OpenSourceSection />

        <WorldlineVisualizer />

        <ClientOnly>
          <GitHubActivity isDarkMode={isDarkMode} username={githubUsername}>
            <GitHubStats />
          </GitHubActivity>
        </ClientOnly>

        {/* Codeforces renders inside ClientOnly: the card fetches live data
            client-side, and SSR-ing a loading skeleton that hydrates to
            different content would cause a hydration mismatch. */}
        {(!cfSettings || cfSettings.enabled) && (
          <ClientOnly>
            <CodeforcesCard username={cfSettings?.username || "parazeeknova"} />
          </ClientOnly>
        )}

        <div className="shrink-0 flex items-center justify-between pt-2">
          <SocialLinks profile={profile} />
          <LoginPopup isAtBottom={isAtBottom} isDarkMode={isDarkMode} />
        </div>

        <div className="flex justify-end pt-4 pb-2">
          <span className="font-display text-4xl sm:text-5xl opacity-40">— El Psy Kongroo</span>
        </div>
      </div>
    </div>
  );
};

// fetchPublicApi reads a same-origin public API route (client-side loader
// path). The server-side loader path calls backy directly instead.
const fetchPublicApi = async <T,>(path: string): Promise<T> => {
  const res = await fetch(path);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
};

export const Route = createFileRoute("/")({
  component: Home,
  head: ({ loaderData }: { loaderData?: PortfolioLoaderData }) => {
    const origin = getSiteOrigin();
    const ogImage = `${origin}/verso-og.png`;
    const profile = loaderData?.profile;
    const title = buildPortfolioTitle(profile);
    const description = buildPortfolioDescription(profile);
    const personJsonLd = buildPersonJsonLd(profile, origin);
    const websiteJsonLd = buildWebSiteJsonLd(profile, origin);
    const jsonLd = [websiteJsonLd, ...(personJsonLd ? [personJsonLd] : [])]
      .map((schema) => JSON.stringify(schema))
      .join("\n");
    return {
      links: [{ href: origin, rel: "canonical" }],
      meta: [
        { title },
        { content: description, name: "description" },
        {
          content:
            "verso, wiki, knowledge base, self-hosted, open-source, markdown, real-time collaboration",
          name: "keywords",
        },
        { content: "index, follow, max-image-preview:large", name: "robots" },
        { content: profile?.username || "verso", name: "author" },
        { content: profile?.name || "verso", name: "application-name" },
        { content: "#111111", name: "theme-color" },
        { content: title, property: "og:title" },
        { content: description, property: "og:description" },
        { content: "website", property: "og:type" },
        { content: `${origin}/`, property: "og:url" },
        { content: "verso", property: "og:site_name" },
        { content: "en_US", property: "og:locale" },
        { content: ogImage, property: "og:image" },
        { content: "1200", property: "og:image:width" },
        { content: "630", property: "og:image:height" },
        { content: "image/png", property: "og:image:type" },
        { content: "summary_large_image", property: "twitter:card" },
        { content: title, property: "twitter:title" },
        { content: description, property: "twitter:description" },
        { content: ogImage, property: "twitter:image" },
      ],
      scripts: [
        {
          children: jsonLd,
          type: "application/ld+json",
        },
      ],
    };
  },
  loader: async ({ context }): Promise<PortfolioLoaderData> => {
    const { queryClient } = context;
    // On the server, call backy directly (absolute URLs via BACKY_ORIGIN).
    // On the client, fetch the same-origin public API routes instead.
    const profileLoader = import.meta.env.SSR
      ? getProfile
      : () => fetchPublicApi<Profile>("/api/profile");
    const experienceLoader = import.meta.env.SSR
      ? getExperience
      : () => fetchPublicApi<ExperienceItem[]>("/api/experience");
    const projectsLoader = import.meta.env.SSR
      ? getProjects
      : () => fetchPublicApi<Project[]>("/api/projects");
    const manifestLoader = import.meta.env.SSR
      ? getBlogManifest
      : () => fetchPublicApi<BlogManifestSection[]>("/api/blogs");
    await Promise.all([
      queryClient.ensureQueryData({ queryFn: profileLoader, queryKey: ["profile"] }),
      queryClient.ensureQueryData({ queryFn: experienceLoader, queryKey: ["experience"] }),
      queryClient.ensureQueryData({ queryFn: projectsLoader, queryKey: ["projects"] }),
      queryClient.ensureQueryData({ queryFn: manifestLoader, queryKey: ["blogManifest"] }),
    ]);
    const result: PortfolioLoaderData = {
      experience: queryClient.getQueryData<ExperienceItem[]>(["experience"]),
      manifest: queryClient.getQueryData<BlogManifestSection[]>(["blogManifest"]),
      profile: queryClient.getQueryData<Profile>(["profile"]),
      projects: queryClient.getQueryData<Project[]>(["projects"]),
    };
    // Always seed the cache with the loader result so stale persisted cache
    // from localStorage never wins over fresh server data during hydration.
    queryClient.setQueryData(["profile"], result.profile);
    queryClient.setQueryData(["experience"], result.experience);
    queryClient.setQueryData(["projects"], result.projects);
    queryClient.setQueryData(["blogManifest"], result.manifest);
    return result;
  },
});
