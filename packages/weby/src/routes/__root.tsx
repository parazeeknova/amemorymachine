import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createRootRoute, HeadContent, Outlet, Scripts, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { createTheme, MantineProvider } from "@mantine/core";

import { useTheme } from "#/shared/hooks/use-theme";
import { isDesktopApp } from "#/shared/lib/desktop";
import { setAuthCache } from "#/features/auth/lib/auth-cache";
import "#/shared/lib/i18n";

import mantineCss from "@mantine/core/styles.css?url";
import appCss from "../styles.css?url";

let globalNavigate: ((opts: { replace: boolean; to: string }) => void | Promise<void>) | null =
  null;

export const setGlobalNavigate = (
  fn: ((opts: { replace: boolean; to: string }) => void | Promise<void>) | null,
) => {
  globalNavigate = fn;
};

const isAuthError = (error: unknown): boolean => {
  if (error instanceof Error && error.message.includes("HTTP 401")) {
    return true;
  }
  if (error instanceof Error && error.message.includes("HTTP 403")) {
    return true;
  }
  return false;
};

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: 1000 * 60 * 60 * 24,
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
        retry: 1,
        staleTime: 1000 * 60 * 60,
      },
    },
    mutationCache: new MutationCache({
      onError: (error) => {
        if (isAuthError(error)) {
          setAuthCache("unauthenticated");
          if (globalNavigate) {
            globalNavigate({ replace: true, to: "/" });
          }
        }
      },
    }),
    queryCache: new QueryCache({
      onError: (error) => {
        if (isAuthError(error)) {
          setAuthCache("unauthenticated");
          if (globalNavigate) {
            globalNavigate({ replace: true, to: "/" });
          }
        }
      },
    }),
  });

const theme = createTheme({
  fontFamily: '"Ubuntu Mono", monospace',
  fontFamilyMonospace: '"Ubuntu Mono", monospace',
});

const RootComponent = () => {
  const [queryClient] = useState(createQueryClient);
  const router = useRouter();

  useEffect(() => {
    setGlobalNavigate((opts) => router.navigate(opts));
    return () => setGlobalNavigate(null);
  }, [router]);

  const [persister] = useState(() => {
    if (typeof window === "undefined") {
      return;
    }
    // WebKit (Electrobun) has very slow sync localStorage — skip persistence entirely
    if (isDesktopApp()) {
      return;
    }
    return createSyncStoragePersister({
      storage: window.localStorage,
    });
  });
  const { isDarkMode } = useTheme();

  if (!persister) {
    return (
      <QueryClientProvider client={queryClient}>
        <MantineProvider theme={theme} forceColorScheme={isDarkMode ? "dark" : "light"}>
          <Outlet />
        </MantineProvider>
      </QueryClientProvider>
    );
  }

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ maxAge: 1000 * 60 * 60 * 24 * 7, persister }}
    >
      <MantineProvider theme={theme} forceColorScheme={isDarkMode ? "dark" : "light"}>
        <Outlet />
      </MantineProvider>
    </PersistQueryClientProvider>
  );
};

const THEME_SCRIPT = [
  "(function(){",
  "var resolvedTheme=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';",
  "try{var storedVersoTheme=null;",
  "var nativeTheme=null;",
  "if(window.__versoInitialTheme&&window.__versoInitialTheme.preference){nativeTheme=window.__versoInitialTheme.preference}",
  "if(nativeTheme==='light'||nativeTheme==='dark'){resolvedTheme=nativeTheme}",
  // In the native app (Electrobun), the shell handles theme — skip slow sync localStorage reads.
  // __versoEnv may not be injected yet; pathname is always available as fallback.
  "else if(!window.__versoEnv&&window.location.pathname.indexOf('/desktop')!==0){",
  "var storedVersoThemeRaw=localStorage.getItem('verso-theme');",
  "if(storedVersoThemeRaw){var parsedVersoTheme=JSON.parse(storedVersoThemeRaw);var versoPreference=parsedVersoTheme.state&&parsedVersoTheme.state.preference;",
  "if(versoPreference==='light'||versoPreference==='dark'||versoPreference==='system')storedVersoTheme=versoPreference}",
  "if(!storedVersoTheme){var legacyPreference=localStorage.getItem('theme-preference');",
  "if(legacyPreference==='light'||legacyPreference==='dark'||legacyPreference==='system')storedVersoTheme=legacyPreference}",
  "if(!storedVersoTheme){var legacyTheme=localStorage.getItem('theme');",
  "if(legacyTheme==='light'||legacyTheme==='dark')storedVersoTheme=legacyTheme}",
  "if(storedVersoTheme){resolvedTheme=storedVersoTheme==='system'",
  "?(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light')",
  ":storedVersoTheme}}}catch(e){}",
  "document.documentElement.dataset.theme=resolvedTheme;",
  "document.documentElement.dataset.mantineColorScheme=resolvedTheme",
  "})()",
].join("");

const RootShell = ({ children }: { children: React.ReactNode }) => (
  <html lang="en" data-theme="dark" data-mantine-color-scheme="dark" suppressHydrationWarning>
    <head>
      <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      <script
        defer
        src="https://tracking.przknv.cc/script.js"
        data-website-id="2e47b7c9-3f7a-4e37-b435-3922b269c7ec"
      />
      <HeadContent />
    </head>
    <body>
      {children}
      <Scripts />
    </body>
  </html>
);

export const Route = createRootRoute({
  component: RootComponent,
  head: () => ({
    links: [
      {
        href: mantineCss,
        rel: "stylesheet",
      },
      {
        href: appCss,
        rel: "stylesheet",
      },
      {
        href: "/verso.svg",
        rel: "icon",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        color: "#000000",
        href: "/verso.svg",
        rel: "mask-icon",
      },
    ],
    meta: [
      {
        charSet: "utf-8",
      },
      {
        content: "width=device-width, initial-scale=1",
        name: "viewport",
      },
      {
        content: "#000000",
        name: "msapplication-TileColor",
      },
      {
        content: "#ffffff",
        name: "theme-color",
      },
      {
        content: "third year undergrad, full stack and devops engineer",
        name: "description",
      },
      {
        content: "gist, parazeeknova, developer, fullstack, devops",
        name: "keywords",
      },
      {
        content: "parazeeknova",
        name: "author",
      },
      {
        content: "website",
        property: "og:type",
      },
      {
        content: "gist - parazeeknova",
        property: "og:title",
      },
      {
        content: "third year undergrad, fullstack & devops engineer",
        property: "og:description",
      },
      {
        content:
          "http://cdn.itssingularity.com/images/2026/05/02/52d60e02dc868234b4c03f50270ba3f0.png",
        property: "og:image",
      },
      {
        content: "https://folio.przknv.cc",
        property: "og:url",
      },
      {
        content: "summary_large_image",
        property: "twitter:card",
      },
      {
        content: "gist - parazeeknova",
        property: "twitter:title",
      },
      {
        content: "third year undergrad, fullstack & devops engineer",
        property: "twitter:description",
      },
      {
        content:
          "http://cdn.itssingularity.com/images/2026/05/02/52d60e02dc868234b4c03f50270ba3f0.png",
        property: "twitter:image",
      },
      {
        content: "gist - parazeeknova",
        name: "application-name",
      },
      {
        content: "yes",
        name: "apple-mobile-web-app-capable",
      },
      {
        content: "default",
        name: "apple-mobile-web-app-status-bar-style",
      },
      {
        content: "gist",
        name: "apple-mobile-web-app-title",
      },
      {
        content: "yes",
        name: "mobile-web-app-capable",
      },
    ],
    title: "gist - parazeeknova",
  }),
  notFoundComponent: () => <p>Not Found</p>,
  shellComponent: RootShell,
});
