import { homedir } from "node:os";
import { mkdirSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { join } from "node:path";
import { platform } from "node:process";

const APP_NAME = ".verso";

export const getConfigDir = (): string => {
  const home = homedir();
  const plat: string = platform;
  if (plat === "linux") {
    return join(home, ".config", APP_NAME);
  }
  if (plat === "darwin") {
    return join(home, "Library", "Application Support", APP_NAME);
  }
  if (plat === "win32") {
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    return join(process.env.APPDATA ?? homedir(), APP_NAME);
  }
  return join(home, ".config", APP_NAME);
};

export const getAppConfigDir = (env: "dev" | "prod"): string => join(getConfigDir(), env);

export const getMachineId = (): string | null => {
  try {
    const id = readFileSync("/etc/machine-id", "utf-8").trim();
    if (id.length > 0) {
      return id;
    }
  } catch {
    // no machine-id available
  }
  return null;
};

interface UuidFile {
  dev: string;
  prod: string;
}

const generateUuid = (): string => {
  // eslint-disable-next-line no-bitwise
  const bytes = randomBytes(16);
  // eslint-disable-next-line no-bitwise
  bytes[6] = (bytes[6] & 15) | 64;
  // eslint-disable-next-line no-bitwise
  bytes[8] = (bytes[8] & 63) | 128;
  return `${bytes.slice(0, 4).toString("hex")}-${bytes.slice(4, 6).toString("hex")}-${bytes
    .slice(6, 8)
    .toString("hex")}-${bytes.slice(8, 10).toString("hex")}-${bytes.slice(10, 16).toString("hex")}`;
};

const getEnvId = (env: "dev" | "prod"): string => {
  const configDir = getConfigDir();
  const uuidFile = join(configDir, "ids.json");
  try {
    if (existsSync(uuidFile)) {
      const data = JSON.parse(readFileSync(uuidFile, "utf-8")) as UuidFile;
      if (data[env]) {
        return data[env];
      }
    }
  } catch {
    // corrupted or missing, regenerate
  }
  return generateUuid();
};

export const resolveEnvId = (env: "dev" | "prod"): string => {
  const configDir = getConfigDir();
  const uuidFile = join(configDir, "ids.json");
  const id = getEnvId(env);
  try {
    if (!existsSync(configDir)) {
      mkdirSync(configDir, { recursive: true });
    }
    let existing: UuidFile = { dev: "", prod: "" };
    if (existsSync(uuidFile)) {
      existing = JSON.parse(readFileSync(uuidFile, "utf-8")) as UuidFile;
    }
    existing[env] = id;
    writeFileSync(uuidFile, JSON.stringify(existing, null, 2));
  } catch {
    // best effort
  }
  return id;
};

export const getEnvDataDir = (env: "dev" | "prod"): string =>
  join(getAppConfigDir(env), resolveEnvId(env));
