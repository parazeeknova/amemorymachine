import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { QueryClientProvider } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createRootRouteWithContext, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { useState } from "react";
import { createTheme, MantineProvider } from "@mantine/core";

import { useTheme } from "#/shared/hooks/use-theme";
import "#/shared/lib/i18n";

import mantineCss from "@mantine/core/styles.css?url";
import appCss from "../styles.css?url";

const theme = createTheme({
  fontFamily: '"Ubuntu Mono", monospace',
  fontFamilyMonospace: '"Ubuntu Mono", monospace',
});

const RootComponent = () => {
  // eslint-disable-next-line no-use-before-define -- Route is defined below
  const { queryClient } = Route.useRouteContext();

  const [persister] = useState(() => {
    if (typeof window === "undefined") {
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
      persistOptions={{
        buster: `amemorymachine-${import.meta.env.VITE_APP_VERSION || "dev"}`,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        persister,
      }}
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
  "try{var storedAmemorymachineTheme=null;",
  "var nativeTheme=null;",
  "if(window.__amemorymachineInitialTheme&&window.__amemorymachineInitialTheme.preference){nativeTheme=window.__amemorymachineInitialTheme.preference}",
  "if(nativeTheme==='light'||nativeTheme==='dark'){resolvedTheme=nativeTheme}",
  // In the native app (Electrobun), the shell handles theme — skip slow sync localStorage reads.
  // __amemorymachineEnv may not be injected yet; pathname is always available as fallback.
  "else if(!window.__amemorymachineEnv&&window.location.pathname.indexOf('/desktop')!==0){",
  "var storedAmemorymachineThemeRaw=localStorage.getItem('amemorymachine-theme');",
  "if(storedAmemorymachineThemeRaw){var parsedAmemorymachineTheme=JSON.parse(storedAmemorymachineThemeRaw);var amemorymachinePreference=parsedAmemorymachineTheme.state&&parsedAmemorymachineTheme.state.preference;",
  "if(amemorymachinePreference==='light'||amemorymachinePreference==='dark'||amemorymachinePreference==='system')storedAmemorymachineTheme=amemorymachinePreference}",
  "if(!storedAmemorymachineTheme){var legacyPreference=localStorage.getItem('theme-preference');",
  "if(legacyPreference==='light'||legacyPreference==='dark'||legacyPreference==='system')storedAmemorymachineTheme=legacyPreference}",
  "if(!storedAmemorymachineTheme){var legacyTheme=localStorage.getItem('theme');",
  "if(legacyTheme==='light'||legacyTheme==='dark')storedAmemorymachineTheme=legacyTheme}",
  "if(storedAmemorymachineTheme){resolvedTheme=storedAmemorymachineTheme==='system'",
  "?(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light')",
  ":storedAmemorymachineTheme}}}catch(e){}",
  "document.documentElement.dataset.theme=resolvedTheme;",
  "document.documentElement.dataset.mantineColorScheme=resolvedTheme",
  "})()",
].join("");

const RootShell = ({ children }: { children: React.ReactNode }) => (
  <html lang="en" data-theme="dark" data-mantine-color-scheme="dark" suppressHydrationWarning>
    <head>
      <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      <HeadContent />
    </head>
    <body>
      {children}
      <Scripts />
    </body>
  </html>
);

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
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
        href: "/amemorymachine.svg",
        rel: "icon",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        color: "#000000",
        href: "/amemorymachine.svg",
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
        content: "amemorymachine — self-hosted markdown editor and personal knowledge base",
        name: "description",
      },
      {
        content: "amemorymachine, markdown editor, personal knowledge base, self-hosted, notes",
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
        content: "amemorymachine",
        property: "og:title",
      },
      {
        content: "amemorymachine — self-hosted markdown editor and personal knowledge base",
        property: "og:description",
      },
      {
        content: "https://amemorymachine.cc/amemorymachine-og.png",
        property: "og:image",
      },
      {
        content: "https://amemorymachine.cc",
        property: "og:url",
      },
      {
        content: "summary_large_image",
        property: "twitter:card",
      },
      {
        content: "amemorymachine",
        property: "twitter:title",
      },
      {
        content: "amemorymachine — self-hosted markdown editor and personal knowledge base",
        property: "twitter:description",
      },
      {
        content: "https://amemorymachine.cc/amemorymachine-og.png",
        property: "twitter:image",
      },
      {
        content: "amemorymachine",
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
        content: "amemorymachine",
        name: "apple-mobile-web-app-title",
      },
      {
        content: "yes",
        name: "mobile-web-app-capable",
      },
    ],
    title: "amemorymachine",
  }),
  notFoundComponent: () => <p>Not Found</p>,
  shellComponent: RootShell,
});
