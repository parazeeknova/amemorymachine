import { BrowserWindow, Updater, PATHS } from "electrobun/bun";
import { join } from "node:path";
import { loadAuth, loadTheme, isSessionExpired } from "../lib/storage";
import { resolveEnvId } from "../lib/paths";

const DEV_SERVER_PORT = 3000;
const DEV_SERVER_URL = `http://localhost:${DEV_SERVER_PORT}`;

const shellCommand = async (cmd: string): Promise<string> => {
  try {
    const proc = Bun.spawn(["sh", "-c", cmd], {
      signal: AbortSignal.timeout(800),
      stderr: "ignore",
      stdout: "pipe",
    });
    proc.unref();
    const output = await new Response(proc.stdout).text();
    await proc.exited;
    return output.trim();
  } catch {
    return "";
  }
};

const runWindows = async (args: string[]): Promise<string> => {
  try {
    const proc = Bun.spawn(args, {
      signal: AbortSignal.timeout(800),
      stderr: "ignore",
      stdout: "pipe",
    });
    proc.unref();
    const output = await new Response(proc.stdout).text();
    await proc.exited;
    return output.trim();
  } catch {
    return "";
  }
};

const isDevChannel = async (): Promise<boolean> => {
  const channel = await Updater.localInfo.channel();
  return channel === "dev";
};

const getAppUrl = async (): Promise<{ url: string; env: "dev" | "prod" }> => {
  const dev = await isDevChannel();
  if (dev) {
    let retries = 0;
    while (retries < 50) {
      try {
        await fetch(DEV_SERVER_URL, { method: "HEAD" });
        console.log(`HMR enabled: Using Vite dev server at ${DEV_SERVER_URL}`);
        return { env: "dev", url: DEV_SERVER_URL };
      } catch {
        // eslint-disable-next-line promise/avoid-new
        await new Promise<void>((resolve) => {
          setTimeout(resolve, 200);
        });
        retries += 1;
      }
    }
    throw new Error(
      "Vite dev server not detected after 10 seconds. Please make sure the dev server is running (e.g. by running 'bun run dev').",
    );
  }

  const port = process.env.PORT || "3000";
  process.env.PORT = port;
  process.env.NODE_ENV = "production";

  if (!process.env.BACKY_ORIGIN) {
    process.env.BACKY_ORIGIN = "https://verso-serve.przknv.cc";
  }

  const serverPath = join(PATHS.VIEWS_FOLDER, "weby-server", "server", "index.mjs");

  console.log(`Starting production Nitro server from: ${serverPath}`);
  try {
    await import(serverPath);
    console.log(`Nitro server running on http://localhost:${port}`);
    return { env: "prod", url: `http://localhost:${port}` };
  } catch (error) {
    console.error("Failed to start Nitro SSR server:", error);
    throw error;
  }
};

const injectState = (win: BrowserWindow, env: "dev" | "prod") => {
  let authJson = "";
  let themeJson = "";

  const authState = loadAuth(env);
  if (authState && !isSessionExpired(authState)) {
    authJson = JSON.stringify({
      deviceName: authState.session.deviceName,
      expiresAt: authState.session.expiresAt,
      user: authState.session.user,
    });
  }

  const themeState = loadTheme(env);
  if (themeState) {
    themeJson = JSON.stringify({
      preference: themeState.preference,
      resolvedAt: themeState.resolvedAt,
    });
  }

  const js = `
    window.__versoInitialAuthData = ${authJson};
    window.__versoInitialTheme = ${themeJson};
    window.__versoEnv = '${env}';
  `;
  try {
    win.webview.executeJavascript(js);
  } catch {
    // webview not ready yet; dom-ready will retry
  }
};

const applyOsTheme = (win: BrowserWindow, theme: "light" | "dark") => {
  const js = `window.dispatchEvent(new CustomEvent('verso:os-theme', { detail: '${theme}' }));`;
  try {
    win.webview.executeJavascript(js);
  } catch {
    // webview not ready yet; dom-ready will retry
  }
};

const getLinuxTheme = async (): Promise<"light" | "dark"> => {
  const de = (process.env.XDG_CURRENT_DESKTOP ?? "").toLowerCase();

  const portal = await shellCommand(
    "gdbus call --session --dest org.freedesktop.portal.Desktop --object-path /org/freedesktop/portal/desktop --method org.freedesktop.portal.Settings.Read org.freedesktop.appearance color-scheme 2>/dev/null",
  );
  const portalMatch = portal.match(/uint32\s+(\d+)/);
  if (portalMatch) {
    const value = Number(portalMatch[1]);
    if (value === 2) {
      return "dark";
    }
    if (value === 1) {
      return "light";
    }
  }

  if (de.includes("gnome") || de.includes("unity") || de.includes("pop")) {
    const scheme = await shellCommand(
      "gsettings get org.gnome.desktop.interface color-scheme 2>/dev/null",
    );
    if (scheme.includes("prefer-dark")) {
      return "dark";
    }
    if (scheme.includes("prefer-light")) {
      return "light";
    }
  }

  if (de.includes("kde") || de.includes("plasma")) {
    const scheme =
      (await shellCommand("kreadconfig5 --group General --key ColorScheme 2>/dev/null")) ||
      (await shellCommand("grep -r 'ColorScheme=' ~/.config/kdeglobals 2>/dev/null"));
    if (/dark/i.test(scheme)) {
      return "dark";
    }
    return "light";
  }

  if (de.includes("xfce")) {
    const themeName = await shellCommand("xfconf-query -c xsettings -p /Net/ThemeName 2>/dev/null");
    if (/dark/i.test(themeName)) {
      return "dark";
    }
    return "light";
  }

  const gtkTheme =
    (await shellCommand("gsettings get org.gnome.desktop.interface gtk-theme 2>/dev/null")) ||
    (await shellCommand("grep -i 'gtk-theme-name' ~/.config/gtk-3.0/settings.ini 2>/dev/null"));
  if (/dark/i.test(gtkTheme)) {
    return "dark";
  }
  return "light";
};

const getOsTheme = async (): Promise<"light" | "dark"> => {
  try {
    const { platform } = process;
    if (platform === "darwin") {
      const output = await shellCommand("defaults read -g AppleInterfaceStyle 2>/dev/null");
      return output.includes("Dark") ? "dark" : "light";
    }
    if (platform === "win32") {
      const output = await runWindows([
        "reg",
        "query",
        "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize",
        "/v",
        "SystemUsesLightTheme",
      ]);
      const match = output.match(/SystemUsesLightTheme\s+REG_DWORD\s+0x([0-9a-fA-F]+)/);
      if (match) {
        return Number.parseInt(match[1], 16) === 0 ? "dark" : "light";
      }
      return "light";
    }
    if (platform === "linux") {
      return await getLinuxTheme();
    }
  } catch {
    // ignore
  }
  return "light";
};

const main = async () => {
  const { url, env } = await getAppUrl();
  resolveEnvId(env);

  const mainWindow = new BrowserWindow({
    frame: {
      height: 800,
      width: 1200,
      x: 100,
      y: 100,
    },
    title: "Verso",
    url: `${url}/desktop`,
  });

  injectState(mainWindow, env);

  mainWindow.on("dom-ready", async () => {
    injectState(mainWindow, env);
    const theme = await getOsTheme();
    applyOsTheme(mainWindow, theme);
  });

  void (async () => {
    const initialTheme = await getOsTheme();
    applyOsTheme(mainWindow, initialTheme);

    let lastTheme = initialTheme;
    const poll = async () => {
      const theme = await getOsTheme();
      if (theme !== lastTheme) {
        lastTheme = theme;
        applyOsTheme(mainWindow, theme);
      }
      await Bun.sleep(2000);
      void poll();
    };
    void poll();
  })();

  console.log(`Verso desktop application started! Window ID: ${mainWindow.id}`);
};

void main();
