import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

const readPackageVersion = (): string => {
  try {
    const pkg = JSON.parse(readFileSync(resolve(import.meta.dirname, "package.json"), "utf-8")) as {
      version: string;
    };
    return pkg.version;
  } catch {
    return "0.0.0";
  }
};

const config = defineConfig(async ({ mode }) => {
  // Merge order (later wins, real process.env wins overall):
  // root .env.development (committed) < package .env files < dotenv-cli injection < OS env.
  // Dev scripts run: dotenv -e ../../.env -e ../../.env.development (first -e wins),
  // so root .env overrides root .env.development before Vite even starts.
  const rootDir = resolve(process.cwd(), "../..");
  const env = {
    ...loadEnv(mode, rootDir, ""),
    ...loadEnv(mode, process.cwd(), ""),
    ...process.env,
  };
  // Proxy target is always backy, never this dev server: use BACKY_PORT,
  // not PORT (PORT is overridden to 3000 for the weby dev server itself).
  const backyPort = env.BACKY_PORT || "7000";
  const appVersion = readPackageVersion();

  const plugins = [devtools(), tailwindcss(), tanstackStart(), viteReact()];

  // Self-hosted node-server build (nitro). Deployed as the amemorymachine-web
  // docker image; Cloudflare Workers is no longer a target.
  const { nitro } = await import("nitro/vite");
  plugins.push(nitro({ noExternals: ["undici"], preset: "node-server" }));

  return {
    // NOTE: `undici` is imported by the SSE stream proxy routes (server-only
    // `Agent` with timeouts disabled). It must stay external in SSR: inlining
    // its CJS entry into the ESM module runner crashes dev SSR with
    // `require is not defined`. The production image already ships
    // `node_modules/undici`, so runtime resolution works in both cases.
    define: {
      "import.meta.env.VITE_APP_ORIGIN": JSON.stringify(
        env.VITE_APP_ORIGIN?.trim() || "https://amemorymachine.cc",
      ),
      "import.meta.env.VITE_APP_VERSION": JSON.stringify(appVersion),
    },
    optimizeDeps: {
      include: ["use-sync-external-store/shim/with-selector", "use-sync-external-store/shim"],
    },
    plugins,
    resolve: {
      dedupe: ["react", "react-dom"],
      tsconfigPaths: true,
    },
    server: {
      proxy: {
        "/api": {
          changeOrigin: true,
          configure: (proxy: {
            on: (event: string, handler: (...args: unknown[]) => void) => void;
          }) => {
            proxy.on("error", (_err: unknown, _req: unknown, res: unknown) => {
              // When backend is unreachable, res may be a net.Socket, not ServerResponse.
              // Try ServerResponse path first, then fall back to raw socket write.
              const sr = res as {
                writeHead?: (code: number, headers: Record<string, string>) => void;
                end?: (body: string) => void;
                writableEnded?: boolean;
              };
              const body = JSON.stringify({ error: "Backend unavailable" });
              if (sr.writeHead && !sr.writableEnded && sr.end) {
                sr.writeHead(502, { "Content-Type": "application/json" });
                sr.end(body);
              } else {
                const sock = res as {
                  writable?: boolean;
                  write?: (d: string) => void;
                  end?: () => void;
                };
                if (sock.writable && sock.write) {
                  sock.write(
                    `HTTP/1.1 502 Bad Gateway\r\nContent-Type: application/json\r\nContent-Length: ${body.length}\r\nConnection: close\r\n\r\n${body}`,
                  );
                  sock.end?.();
                }
              }
            });
          },
          target: `http://localhost:${backyPort}`,
        },
      },
    },
  };
});

export default config;
