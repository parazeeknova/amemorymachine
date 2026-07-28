import { WarningCircleIcon } from "@phosphor-icons/react";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import type { ExperienceItem, Profile, Project } from "#/shared/types";
import { useTheme } from "#/shared/hooks/use-theme";
import { setFlashToast } from "#/features/console/components/flash-toast";
import { generatePortfolioMarkdown, validatePortfolioMarkdown } from "../lib/portfolio-markdown";
import { usePortfolioStore } from "../stores/portfolio-store";
import { setPortfolioEditorControls } from "./portfolio-editor-context";
import { FormatGuideModal } from "./format-guide-modal";
import { TemplateHistoryModal } from "./template-history-modal";
import { PortfolioLivePreview } from "./portfolio-live-preview";
import { usePinTemplate, useTemplates } from "../hooks/use-templates";

interface PortfolioEditorProps {
  initialProfile?: Profile;
  initialExperiences?: ExperienceItem[];
  initialProjects?: Project[];
  onBack?: () => void;
}

export const PortfolioEditor = ({
  initialProfile,
  initialExperiences,
  initialProjects,
  onBack,
}: PortfolioEditorProps) => {
  const { isDarkMode } = useTheme();
  const t = (dark: string, light: string) => (isDarkMode ? dark : light);

  const [rawMarkdown, setRawMarkdown] = useState(() => {
    const savedDraft = usePortfolioStore.getState().draft;
    if (savedDraft) {
      return savedDraft;
    }
    return generatePortfolioMarkdown(initialProfile, initialExperiences, initialProjects);
  });

  const undoStack = useRef<string[]>([]);
  const redoStack = useRef<string[]>([]);
  const batchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastPushed = useRef<string>("");

  const pushUndo = useCallback((value: string) => {
    if (value === lastPushed.current) {
      return;
    }
    lastPushed.current = value;
    undoStack.current.push(value);
    if (undoStack.current.length > 200) {
      undoStack.current.shift();
    }
    redoStack.current = [];
  }, []);

  const handleChange = useCallback(
    (value: string) => {
      setRawMarkdown(value);
      if (batchTimer.current) {
        clearTimeout(batchTimer.current);
      }
      batchTimer.current = setTimeout(() => {
        pushUndo(value);
        usePortfolioStore.getState().setDraft(value);
      }, 300);
    },
    [pushUndo],
  );

  const isGuideOpen = usePortfolioStore((s) => s.isGuideOpen);
  const setIsGuideOpen = usePortfolioStore((s) => s.setIsGuideOpen);
  const isHistoryOpen = usePortfolioStore((s) => s.isHistoryOpen);
  const setIsHistoryOpen = usePortfolioStore((s) => s.setIsHistoryOpen);
  const setIsPinned = usePortfolioStore((s) => s.setIsPinned);
  const addHistorySnapshot = usePortfolioStore((s) => s.addHistorySnapshot);
  const setDraft = usePortfolioStore((s) => s.setDraft);
  const queryClient = useQueryClient();

  const { data: templates } = useTemplates();
  const isPinned = templates?.some((tmpl) => tmpl.isDefault) ?? false;

  const pinTemplate = usePinTemplate();

  // Sync derived isPinned from React Query data into Zustand for the sidebar
  useEffect(() => {
    setIsPinned(isPinned);
  }, [isPinned, setIsPinned]);

  const deferredMarkdown = useDeferredValue(rawMarkdown);
  const validation = useMemo(() => validatePortfolioMarkdown(deferredMarkdown), [deferredMarkdown]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const val = target.value;
      const updated = `${val.slice(0, start)}  ${val.slice(end)}`;
      setRawMarkdown(updated);
      pushUndo(updated);
      redoStack.current = [];
      setTimeout(() => {
        target.selectionStart = start + 2;
        target.selectionEnd = start + 2;
      }, 0);
      return;
    }

    if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
      e.preventDefault();
      if (batchTimer.current) {
        clearTimeout(batchTimer.current);
        batchTimer.current = null;
        pushUndo(e.currentTarget.value);
      }
      if (undoStack.current.length > 0) {
        const current = e.currentTarget.value;
        const prev = undoStack.current.pop();
        if (prev) {
          redoStack.current.push(current);
          setRawMarkdown(prev);
          lastPushed.current = prev;
        }
      }
      return;
    }

    if ((e.metaKey || e.ctrlKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
      e.preventDefault();
      if (batchTimer.current) {
        clearTimeout(batchTimer.current);
        batchTimer.current = null;
        pushUndo(e.currentTarget.value);
      }
      if (redoStack.current.length > 0) {
        const current = e.currentTarget.value;
        const next = redoStack.current.pop();
        if (next) {
          undoStack.current.push(current);
          setRawMarkdown(next);
          lastPushed.current = next;
        }
      }
    }
  };

  const handlePin = useCallback(() => {
    const current = validatePortfolioMarkdown(rawMarkdown);
    if (!current.isValid) {
      setFlashToast("cannot pin template: fix syntax errors first");
      return;
    }

    const { parsed } = current;
    pinTemplate.mutate(
      {
        description: parsed.profile.description,
        email: parsed.profile.email ?? "",
        experiences: parsed.experiences,
        links: parsed.profile.links,
        name: parsed.profile.name,
        projects: parsed.projects,
        tagline: parsed.profile.tagline,
        username: parsed.profile.username ?? "",
      },
      {
        onError: (error) => {
          const msg = error instanceof Error ? error.message : String(error);
          setFlashToast(`failed to pin portfolio template: ${msg}`);
        },
        onSuccess: () => {
          addHistorySnapshot(rawMarkdown);
          setDraft(null);
          queryClient.setQueryData(["profile"], parsed.profile);
          queryClient.setQueryData(["experience"], parsed.experiences);
          queryClient.setQueryData(["projects"], parsed.projects);
          // Also update localStorage caches that the landing page uses as placeholderData
          try {
            localStorage.setItem("verso_cache_profile", JSON.stringify(parsed.profile));
            localStorage.setItem("verso_cache_experience", JSON.stringify(parsed.experiences));
            localStorage.setItem("verso_cache_projects", JSON.stringify(parsed.projects));
          } catch {
            // ignore storage quota errors
          }
          setFlashToast("portfolio template pinned to / route");
        },
      },
    );
  }, [rawMarkdown, pinTemplate, addHistorySnapshot, setDraft, queryClient]);

  const handleReset = useCallback(() => {
    const boilerplate = generatePortfolioMarkdown();
    setRawMarkdown(boilerplate);
    setDraft(null);
    undoStack.current = [];
    redoStack.current = [];
    lastPushed.current = "";
    setFlashToast("template reset to boilerplate");
  }, [setDraft]);

  const handleHistoryRestore = useCallback(
    (markdown: string) => {
      setRawMarkdown(markdown);
      setDraft(markdown);
      undoStack.current = [];
      redoStack.current = [];
      lastPushed.current = "";
      setIsHistoryOpen(false);
      setFlashToast("restored template from history");
    },
    [setDraft, setIsHistoryOpen],
  );

  // Expose controls to the sidebar via external store
  useEffect(() => {
    setPortfolioEditorControls({
      handlePin,
      handleReset,
      isPinned,
      isSaving: pinTemplate.isPending,
      onBack: () => onBack?.(),
    });
  }, [handlePin, handleReset, isPinned, pinTemplate.isPending, onBack]);

  useEffect(() => () => setPortfolioEditorControls(null), []);

  return (
    <div className="w-full flex flex-col h-[calc(100vh-3.5rem)] p-4 text-left">
      <div
        className={`flex flex-col lg:flex-row border overflow-hidden flex-1 min-h-0 ${t(
          "border-border-dark bg-white/2",
          "border-border-light bg-black/2",
        )}`}
      >
        <div
          className={`w-full lg:w-1/2 flex flex-col overflow-hidden border-b lg:border-b-0 lg:border-r ${t(
            "border-border-dark",
            "border-border-light",
          )}`}
        >
          {!validation.isValid && (
            <div className="p-2 border-b border-rose-500/20 bg-rose-500/5 text-[10px] font-mono text-rose-400 space-y-0.5 shrink-0">
              <div className="font-semibold flex items-center gap-1">
                <WarningCircleIcon size={11} /> syntax error in template format:
              </div>
              {validation.errors.map((err, idx) => (
                <div key={`${err}-${idx}`} className="pl-3">
                  &bull; {err}
                </div>
              ))}
            </div>
          )}

          <div className="flex-1 relative overflow-hidden bg-transparent">
            <textarea
              aria-label="Portfolio Template Markdown Editor"
              className={`w-full h-full py-4 px-4 bg-transparent outline-none overflow-auto whitespace-pre-wrap break-words resize-none font-mono text-[12px] ${t(
                "text-text-dark caret-white placeholder:text-text-dark/20",
                "text-text-light caret-black placeholder:text-text-light/20",
              )}`}
              style={{ lineHeight: "1.4" }}
              onChange={(e) => handleChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your markdown template here..."
              spellCheck={false}
              value={rawMarkdown}
            />
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex flex-col overflow-hidden">
          <PortfolioLivePreview
            errors={validation.errors}
            isValid={validation.isValid}
            parsedData={validation.parsed}
          />
        </div>
      </div>

      <FormatGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
      <TemplateHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onRestore={handleHistoryRestore}
      />
    </div>
  );
};
