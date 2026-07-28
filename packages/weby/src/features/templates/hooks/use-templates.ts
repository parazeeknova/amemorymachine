import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface TemplateInfo {
  description: string;
  icon: string;
  id: string;
  isDefault: boolean;
  title: string;
}

const fetchJson = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const res = await fetch(url, init);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
};

export const useTemplates = () =>
  useQuery<TemplateInfo[]>({
    queryFn: ({ signal }) => fetchJson<TemplateInfo[]>("/api/console/templates", { signal }),
    queryKey: ["console-templates"],
    staleTime: 1000 * 30,
  });

export interface PinTemplateInput {
  description: string;
  email: string;
  experiences: unknown[];
  links: Record<string, { label: string; url: string }>;
  name: string;
  projects: unknown[];
  tagline: string;
  username: string;
}

export const usePinTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: PinTemplateInput) =>
      fetchJson<{ message: string; status: string }>("/api/console/templates", {
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["console-templates"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["experience"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
};
