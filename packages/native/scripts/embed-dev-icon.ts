import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

// Embeds the app icon into the electrobun dev launcher exes on Windows.
// Electrobun's own embed step depends on an `rcedit` module that is missing
// from its published package, so dev builds end up with a generic exe icon
// (no titlebar/taskbar icon). This script fills that gap using the ICO files
// electrobun already generates next to the build output.
//
// Safe to re-run: skips exes that are already iconed, no-ops off Windows.
const RCEDIT_VERSION = "v2.0.0";
const RCEDIT_URL = `https://github.com/electron/rcedit/releases/download/${RCEDIT_VERSION}/rcedit-x64.exe`;

const root = join(import.meta.dirname, "..");
const binDir = join(root, "build", "dev-win-x64", "Amemorymachine-dev", "bin");
const toolsDir = join(root, "build", "tools");
const rceditPath = join(toolsDir, "rcedit-x64.exe");

const targets = [
  {
    exe: join(binDir, "launcher.exe"),
    ico: join(root, "build", "dev-win-x64", "temp-launcher-icon.ico"),
  },
  { exe: join(binDir, "bun.exe"), ico: join(root, "build", "dev-win-x64", "temp-bun-icon.ico") },
];

if (process.platform !== "win32") {
  console.log("embed-dev-icon: Windows only, skipping.");
  process.exit(0);
}

if (!targets.every((t) => existsSync(t.exe))) {
  console.log(
    `embed-dev-icon: dev exes not built yet at ${binDir} — run \`bun run dev\` once, then re-run this script.`,
  );
  process.exit(0);
}

if (!existsSync(rceditPath)) {
  console.log(`embed-dev-icon: downloading rcedit ${RCEDIT_VERSION}...`);
  mkdirSync(toolsDir, { recursive: true });
  const res = await fetch(RCEDIT_URL);
  if (!res.ok) {
    throw new Error(`rcedit download failed: ${res.status} ${res.statusText}`);
  }
  await Bun.write(rceditPath, res);
}

for (const { exe, ico } of targets) {
  if (!existsSync(ico)) {
    console.log(`embed-dev-icon: missing icon ${ico}, skipping ${exe}.`);
    continue;
  }
  console.log(`embed-dev-icon: embedding ${ico} -> ${exe}`);
  const proc = Bun.spawnSync([rceditPath, exe, "--set-icon", ico], {
    stderr: "pipe",
    stdout: "pipe",
  });
  if (proc.exitCode !== 0) {
    console.error(`embed-dev-icon: rcedit failed for ${exe}:\n${proc.stderr.toString()}`);
    process.exit(1);
  }
}
console.log("embed-dev-icon: done. Restart the dev app to see the icon.");
