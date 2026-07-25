import {
  ArrowLeftIcon,
  CheckIcon,
  InfoIcon,
  PushPinIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import { useEffect, useMemo, useRef, useState } from "react";
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

  const gutterRef = useRef<HTMLDivElement>(null);

  const [rawMarkdown, setRawMarkdown] = useState(() =>
    generatePortfolioMarkdown(initialProfile, initialExperiences, initialProjects),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  useEffect(() => {
    setRawMarkdown(generatePortfolioMarkdown(initialProfile, initialExperiences, initialProjects));
  }, [initialProfile, initialExperiences, initialProjects]);

  // Syntax validation - instantly recomputed on every character change
  const validation = useMemo(() => validatePortfolioMarkdown(rawMarkdown), [rawMarkdown]);

  const lineCount = useMemo(() => rawMarkdown.split("\n").length, [rawMarkdown]);

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

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (gutterRef.current) {
      gutterRef.current.scrollTop = e.currentTarget.scrollTop;
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
              {validation.errors.map((err) => (
                <div key={err} className="pl-3">
                  • {err}
                </div>
              ))}
            </div>
          )}

          {/* Editor Container with Synchronized Line Gutter + Textarea */}
          <div className="flex-1 flex overflow-hidden font-mono text-[11px]">
            {/* Line Number Gutter */}
            <div
              ref={gutterRef}
              className={`select-none py-3 px-3 text-right border-r font-mono text-[11px] shrink-0 overflow-hidden pointer-events-none w-10 ${t(
                "border-border-dark/40 bg-white/2 text-text-dark/25",
                "border-border-light/40 bg-black/2 text-text-light/25",
              )}`}
              style={{ lineHeight: "1.5rem" }}
            >
              {Array.from({ length: Math.max(lineCount, 40) }, (_, i) => (
                <div key={i + 1} className="h-6 leading-6">
                  {i + 1}
                </div>
              ))}
            </div>

            {/* Editable Textarea with exact 24px (1.5rem) line height */}
            <textarea
              aria-label="Portfolio Template Markdown Editor"
              className={`w-full h-full py-3 px-3 bg-transparent outline-none font-mono text-[11px] overflow-auto overscroll-contain whitespace-pre resize-none ${t(
                "text-text-dark placeholder:text-text-dark/20",
                "text-text-light placeholder:text-text-light/20",
              )}`}
              onChange={(e) => setRawMarkdown(e.target.value)}
              onKeyDown={handleKeyDown}
              onScroll={handleScroll}
              placeholder="Type your markdown template here..."
              spellCheck={false}
              style={{ lineHeight: "1.5rem" }}
              value={rawMarkdown}
              wrap="off"
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
