import type { BlogManifestSection, ExperienceItem, Profile, Project } from "#/shared/types";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { isDesktopApp } from "#/shared/lib/desktop";

const fetchJson = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const res = await fetch(url, init);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
};

export const useIsMounted = (): boolean => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
};

const getInitialFromStorage = <T>(key: string): T | undefined => {
  // WebKit (Electrobun) has very slow sync localStorage — skip placeholder reads
  if (typeof window === "undefined" || isDesktopApp()) {
    return undefined;
  }
  try {
    const raw = localStorage.getItem(`verso_cache_${key}`);
    return raw ? (JSON.parse(raw) as T) : undefined;
  } catch {
    return undefined;
  }
};

const saveToStorage = <T>(key: string, data: T): void => {
  if (typeof window === "undefined" || isDesktopApp()) {
    return;
  }
  try {
    localStorage.setItem(`verso_cache_${key}`, JSON.stringify(data));
  } catch {
    // ignore storage quota errors
  }
};

export const useProfile = () =>
  useQuery<Profile>({
    placeholderData: () => getInitialFromStorage<Profile>("profile"),
    queryFn: async ({ signal }) => {
      const data = await fetchJson<Profile>("/api/profile", { signal });
      saveToStorage("profile", data);
      return data;
    },
    queryKey: ["profile"],
  });

export const useExperience = () =>
  useQuery<ExperienceItem[]>({
    placeholderData: () => getInitialFromStorage<ExperienceItem[]>("experience"),
    queryFn: async ({ signal }) => {
      const data = await fetchJson<ExperienceItem[]>("/api/experience", { signal });
      saveToStorage("experience", data);
      return data;
    },
    queryKey: ["experience"],
  });

export const useProjects = () =>
  useQuery<Project[]>({
    placeholderData: () => getInitialFromStorage<Project[]>("projects"),
    queryFn: async ({ signal }) => {
      const data = await fetchJson<Project[]>("/api/projects", { signal });
      saveToStorage("projects", data);
      return data;
    },
    queryKey: ["projects"],
  });

export const useBlogManifest = () =>
  useQuery<BlogManifestSection[]>({
    queryFn: ({ signal }) => fetchJson<BlogManifestSection[]>("/api/blogs", { signal }),
    queryKey: ["blogManifest"],
  });

interface TemplateInfo {
  description: string;
  icon: string;
  id: string;
  isDefault: boolean;
  title: string;
}

export const useTemplates = () =>
  useQuery<TemplateInfo[]>({
    queryFn: ({ signal }) => fetchJson<TemplateInfo[]>("/api/console/templates", { signal }),
    queryKey: ["console-templates"],
  });

export const useIsFetchingData = (): boolean => {
  const profile = useProfile();
  const experience = useExperience();
  const projects = useProjects();

  return profile.isPending || experience.isPending || projects.isPending;
};
