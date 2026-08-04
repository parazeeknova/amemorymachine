import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface GitHubSettings {
  enabled: boolean;
  username: string;
  hasToken: boolean;
  tokenUpdatedAt?: string;
}

const fetchJson = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const res = await fetch(url, init);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
};

export const useGitHubSettings = () =>
  useQuery<GitHubSettings>({
    queryFn: ({ signal }) => fetchJson<GitHubSettings>("/api/console/github-settings", { signal }),
    queryKey: ["github-settings"],
    staleTime: 1000 * 60,
  });

export const useUpdateGitHubSettings = () => {
  const queryClient = useQueryClient();
  return useMutation<
    GitHubSettings,
    Error,
    { enabled?: boolean; username?: string; token?: string }
  >({
    mutationFn: (body) =>
      fetchJson<GitHubSettings>("/api/console/github-settings", {
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["github-settings"] });
      queryClient.invalidateQueries({ queryKey: ["github-stats"] });
    },
  });
};
