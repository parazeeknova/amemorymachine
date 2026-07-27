import {
  ArrowLeftIcon,
  CheckIcon,
  InfoIcon,
  PushPinIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import type { ExperienceItem, Profile, Project } from "#/shared/types";
import { useTheme } from "#/shared/hooks/use-theme";
import { setFlashToast } from "#/features/console/components/flash-toast";
import { generatePortfolioMarkdown, validatePortfolioMarkdown } from "../lib/portfolio-markdown";
import { FormatGuideModal } from "./format-guide-modal";
import { PortfolioLivePreview } from "./portfolio-live-preview";

interface PortfolioEditorProps {
  initialProfile?: Profile;
  initialExperiences?: ExperienceItem[];
  initialProjects?: Project[];
  onPinComplete?: () => void;
}

export const PortfolioEditor = ({
  initialProfile,
  initialExperiences,
  initialProjects,
  onPinComplete,
}: PortfolioEditorProps) => {
  const { isDarkMode } = useTheme();
  const t = (dark: string, light: string) => (isDarkMode ? dark : light);

  const [rawMarkdown, setRawMarkdown] = useState(() =>
    generatePortfolioMarkdown(initialProfile, initialExperiences, initialProjects),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  useEffect(() => {
    setRawMarkdown(generatePortfolioMarkdown(initialProfile, initialExperiences, initialProjects));
  }, [initialProfile, initialExperiences, initialProjects]);

  const deferredMarkdown = useDeferredValue(rawMarkdown);

  // Syntax validation - deferred to keep main thread scrolling & typing 60+ FPS smooth
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
      setTimeout(() => {
        target.selectionStart = start + 2;
        target.selectionEnd = start + 2;
      }, 0);
    }
  };

  const handlePin = async () => {
    if (!validation.isValid) {
      setFlashToast("cannot pin template: fix syntax errors first");
      return;
    }

    setIsSaving(true);
    try {
      const { parsed } = validation;

      const res = await fetch("/api/console/templates", {
        body: JSON.stringify({
          description: parsed.profile.description,
          email: parsed.profile.email,
          experiences: parsed.experiences,
          links: parsed.profile.links,
          name: parsed.profile.name,
          projects: parsed.projects,
          tagline: parsed.profile.tagline,
          username: parsed.profile.username,
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      setIsPinned(true);
      setFlashToast("portfolio template pinned to / route");
      if (onPinComplete) {
        onPinComplete();
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      setFlashToast(`failed to pin portfolio template: ${msg}`);
    } finally {
      setIsSaving(false);
    }
  };

  const renderPinIcon = () => {
    if (isPinned) {
      return <CheckIcon size={12} />;
    }
    if (validation.isValid) {
      return <PushPinIcon size={12} />;
    }
    return <WarningCircleIcon size={12} />;
  };

  const getPinText = () => {
    if (isSaving) {
      return "pinning...";
    }
    if (isPinned) {
      return "pinned to /";
    }
    if (!validation.isValid) {
      return `fix format errors (${validation.errors.length})`;
    }
    return "pin template to /";
  };

  const getPinButtonClass = () => {
    if (isPinned) {
      return "border-emerald-500/40 bg-emerald-500/20 text-emerald-400";
    }
    if (validation.isValid) {
      return t(
        "border-purple-500/40 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20",
        "border-purple-600/40 bg-purple-500/10 text-purple-700 hover:bg-purple-500/20",
      );
    }
    return "border-rose-500/30 bg-rose-500/5 text-rose-400 cursor-not-allowed opacity-80";
  };

  return (
    <div className="w-full flex flex-col h-[calc(100vh-3.5rem)] px-4 py-2 space-y-2 text-left">
      {/* Super Minimal Top Header */}
      <div className="flex items-center justify-between shrink-0 py-1">
        <button
          className={`text-[11px] lowercase flex items-center gap-1.5 transition-colors ${t(
            "text-text-dark/50 hover:text-text-dark",
            "text-text-light/50 hover:text-text-light",
          )}`}
          onClick={() => onPinComplete?.()}
          type="button"
        >
          <ArrowLeftIcon size={12} /> back to templates
        </button>

        <div className="flex items-center gap-2">
          <button
            className={`text-[10px] lowercase px-2 py-0.5 border flex items-center gap-1 transition-colors ${t(
              "border-border-dark/60 text-text-dark/50 hover:text-text-dark hover:border-purple-500/40",
              "border-border-light/60 text-text-light/50 hover:text-text-light hover:border-purple-600/40",
            )}`}
            onClick={() => setIsGuideOpen(true)}
            title="view format guidelines"
            type="button"
          >
            <InfoIcon size={11} /> format guide
          </button>

          <button
            className={`text-[11px] lowercase px-3 py-1 border flex items-center gap-1.5 transition-colors ${getPinButtonClass()}`}
            disabled={isSaving || !validation.isValid}
            onClick={handlePin}
            type="button"
          >
            {renderPinIcon()}
            {getPinText()}
          </button>
        </div>
      </div>

      {/* Single Unified Box Container: Left (Editor) | Separator Line | Right (Live Preview) */}
      <div
        className={`flex flex-col lg:flex-row border overflow-hidden flex-1 min-h-0 ${t(
          "border-border-dark bg-white/2",
          "border-border-light bg-black/2",
        )}`}
      >
        {/* Left Half: Monospace Code Editor */}
        <div
          className={`w-full lg:w-1/2 flex flex-col overflow-hidden border-b lg:border-b-0 lg:border-r ${t(
            "border-border-dark",
            "border-border-light",
          )}`}
        >
          {/* Syntax Error Warning Banner */}
          {!validation.isValid && (
            <div className="p-2 border-b border-rose-500/20 bg-rose-500/5 text-[10px] font-mono text-rose-400 space-y-0.5 shrink-0">
              <div className="font-semibold flex items-center gap-1">
                <WarningCircleIcon size={11} /> syntax error in template format:
              </div>
              {validation.errors.map((err, idx) => (
                <div key={`${err}-${idx}`} className="pl-3">
                  • {err}
                </div>
              ))}
            </div>
          )}

          {/* Editor Container */}
          <div className="flex-1 relative overflow-hidden bg-transparent">
            <textarea
              aria-label="Portfolio Template Markdown Editor"
              className={`w-full h-full py-4 px-4 bg-transparent outline-none overflow-auto whitespace-pre-wrap break-words resize-none font-mono text-[12px] ${t(
                "text-text-dark caret-white placeholder:text-text-dark/20",
                "text-text-light caret-black placeholder:text-text-light/20",
              )}`}
              style={{ lineHeight: "1.4" }}
              onChange={(e) => setRawMarkdown(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your markdown template here..."
              spellCheck={false}
              value={rawMarkdown}
            />
          </div>
        </div>

        {/* Right Half: Live Preview */}
        <div className="w-full lg:w-1/2 flex flex-col overflow-hidden">
          <PortfolioLivePreview
            errors={validation.errors}
            isValid={validation.isValid}
            parsedData={validation.parsed}
          />
        </div>
      </div>

      {/* Format Guide Modal */}
      <FormatGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </div>
  );
};
