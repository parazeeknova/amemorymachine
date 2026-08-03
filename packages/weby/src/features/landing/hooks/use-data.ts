import type { BlogManifestSection, ExperienceItem, Profile, Project } from "#/shared/types";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

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

const saveToStorage = <T>(key: string, data: T): void => {
  if (typeof window === "undefined") {
    return;
  }
  try {
    localStorage.setItem(`verso_cache_${key}`, JSON.stringify(data));
  } catch {
    // ignore storage quota errors
  }
};

export const useProfile = (initialData?: Profile) =>
  useQuery<Profile>({
    initialData,
    queryFn: async ({ signal }) => {
      const data = await fetchJson<Profile>("/api/profile", { signal });
      saveToStorage("profile", data);
      return data;
    },
    queryKey: ["profile"],
    refetchOnMount: true,
    staleTime: 1000 * 30,
  });

export const useExperience = (initialData?: ExperienceItem[]) =>
  useQuery<ExperienceItem[]>({
    initialData,
    queryFn: async ({ signal }) => {
      const data = await fetchJson<ExperienceItem[]>("/api/experience", { signal });
      saveToStorage("experience", data);
      return data;
    },
    queryKey: ["experience"],
    refetchOnMount: true,
    staleTime: 1000 * 30,
  });

export const useProjects = (initialData?: Project[]) =>
  useQuery<Project[]>({
    initialData,
    queryFn: async ({ signal }) => {
      const data = await fetchJson<Project[]>("/api/projects", { signal });
      saveToStorage("projects", data);
      return data;
    },
    queryKey: ["projects"],
    refetchOnMount: true,
    staleTime: 1000 * 30,
  });

export const useBlogManifest = (initialData?: BlogManifestSection[]) =>
  useQuery<BlogManifestSection[]>({
    initialData,
    queryFn: ({ signal }) => fetchJson<BlogManifestSection[]>("/api/blogs", { signal }),
    queryKey: ["blogManifest"],
  });

export const useIsFetchingData = (initialData?: {
  profile?: Profile;
  experience?: ExperienceItem[];
  projects?: Project[];
}): boolean => {
  const profile = useProfile(initialData?.profile);
  const experience = useExperience(initialData?.experience);
  const projects = useProjects(initialData?.projects);

  return profile.isPending || experience.isPending || projects.isPending;
};
