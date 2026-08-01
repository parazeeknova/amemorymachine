import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { logger } from "#/shared/lib/logger";

interface CFSettings {
  enabled: boolean;
  username: string;
}

const LOCAL_KEY = "verso-cf-settings";
const DEFAULT_SETTINGS: CFSettings = { enabled: false, username: "parazeeknova" };

const loadLocal = (): CFSettings => {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? (JSON.parse(raw) as CFSettings) : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
};

const saveLocal = (s: CFSettings) => {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(s));
  } catch {
    // ignore
  }
};

const fetchJson = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const res = await fetch(url, init);
  if (!res.ok) {
    const contentType = res.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      try {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error ?? `HTTP ${res.status}`);
      } catch {
        throw new Error(`HTTP ${res.status}`);
      }
    }
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
};

export const useCFSettings = () =>
  useQuery<CFSettings>({
    queryFn: async () => {
      try {
        const remote = await fetchJson<CFSettings>("/api/cf/settings");
        logger.info(
          { enabled: remote.enabled, username: remote.username },
          "cf settings loaded from server",
        );
        saveLocal(remote);
        return remote;
      } catch (error) {
        const local = loadLocal();
        logger.warn(
          { error: String(error), local },
          "cf settings: server unreachable, using local fallback",
        );
        return local;
      }
    },
    queryKey: ["cf-settings"],
    staleTime: 0,
  });

export const useUpdateCFSettings = () => {
  const queryClient = useQueryClient();
  return useMutation<CFSettings, Error, { enabled?: boolean; username?: string }>({
    mutationFn: (body) => {
      const current = queryClient.getQueryData<CFSettings>(["cf-settings"]) ?? loadLocal();
      const updated = { ...current, ...body };
      logger.info({ from: current, to: updated }, "cf settings: updating");
      queryClient.setQueryData<CFSettings>(["cf-settings"], updated);
      saveLocal(updated);
      return fetchJson<CFSettings>("/api/console/cf-settings", {
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
    },
    onError: (error) => {
      logger.error({ error: error.message }, "cf settings: update failed");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cf-settings"] });
      queryClient.invalidateQueries({ queryKey: ["codeforces-user"] });
      queryClient.invalidateQueries({ queryKey: ["codeforces-rating"] });
    },
    onSuccess: (data) => {
      logger.info({ enabled: data.enabled, username: data.username }, "cf settings: update saved");
    },
  });
};
