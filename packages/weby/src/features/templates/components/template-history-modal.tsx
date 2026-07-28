import {
  ClockCounterClockwiseIcon,
  MinusIcon,
  PlusIcon,
  TrashIcon,
  XIcon,
} from "@phosphor-icons/react";
import { useMemo } from "react";
import { useTheme } from "#/shared/hooks/use-theme";
import { usePortfolioStore } from "../stores/portfolio-store";
import { useClearPortfolio } from "../hooks/use-templates";
import { generatePortfolioMarkdown } from "../lib/portfolio-markdown";
import type { TemplateSnapshot } from "../stores/portfolio-store";

interface TemplateHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestore: (markdown: string) => void;
}

const formatTimestamp = (ts: number) => {
  const date = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - ts;
  const diffMins = Math.floor(diffMs / 60_000);

  if (diffMins < 1) {
    return "now";
  }
  if (diffMins < 60) {
    return `${diffMins}m`;
  }
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) {
    return `${diffHours}h`;
  }
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return `${diffDays}d`;
  }
  return date.toLocaleDateString("en-US", { day: "numeric", month: "short" });
};

const formatTime = (ts: number) => {
  const date = new Date(ts);
  return date.toLocaleTimeString("en-US", { hour: "2-digit", hour12: false, minute: "2-digit" });
};

const computeDiff = (current: string, previous: string | null) => {
  const currentLines = current.trim().split("\n").filter(Boolean);
  if (!previous) {
    return { added: currentLines.length, removed: 0 };
  }

  const prevLines = previous.trim().split("\n").filter(Boolean);
  const added = currentLines.filter((l) => !prevLines.includes(l)).length;
  const removed = prevLines.filter((l) => !currentLines.includes(l)).length;

  return { added, removed };
};

export const TemplateHistoryModal = ({ isOpen, onClose, onRestore }: TemplateHistoryModalProps) => {
  const { isDarkMode } = useTheme();
  const t = (dark: string, light: string) => (isDarkMode ? dark : light);
  const history = usePortfolioStore((s) => s.history);
  const clearHistory = usePortfolioStore((s) => s.clearHistory);
  const clearPortfolio = useClearPortfolio();

  const handleClearAll = () => {
    clearHistory();
    clearPortfolio.mutate();
    onRestore(generatePortfolioMarkdown());
  };

  const diffs = useMemo(() => {
    const reversed = [...history].toReversed();
    const result: Record<string, { added: number; removed: number }> = {};
    for (let i = 0; i < reversed.length; i += 1) {
      const snapshot = reversed[i];
      const prev = i > 0 ? reversed[i - 1].markdown : null;
      result[snapshot.id] = computeDiff(snapshot.markdown, prev);
    }
    return result;
  }, [history]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className={`w-full max-w-lg max-h-[80vh] flex flex-col border ${t("bg-bg-dark border-border-dark text-text-dark", "bg-bg-light border-border-light text-text-light")}`}
      >
        <div
          className={`flex items-center justify-between px-3 py-1.5 border-b shrink-0 ${t("border-border-dark", "border-border-light")}`}
        >
          <div className="flex items-center gap-2">
            <ClockCounterClockwiseIcon
              size={13}
              className={t("text-text-dark/40", "text-text-light/40")}
            />
            <span className="text-[12px] font-medium lowercase">history</span>
            {history.length > 0 && (
              <span
                className={`text-[10px] font-mono ${t("text-text-dark/25", "text-text-light/25")}`}
              >
                {history.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {history.length > 0 && (
              <button
                className={`px-2 py-0.5 text-[10px] lowercase transition-colors flex items-center gap-1 ${t("text-text-dark/30 hover:text-rose-400", "text-text-light/30 hover:text-rose-600")}`}
                onClick={handleClearAll}
                type="button"
              >
                <TrashIcon size={11} />
                clear all
              </button>
            )}
            <button
              className={`p-1 transition-colors ${t("text-text-dark/40 hover:text-text-dark", "text-text-light/40 hover:text-text-light")}`}
              onClick={onClose}
              type="button"
            >
              <XIcon size={15} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {history.length === 0 ? (
            <div
              className={`flex flex-col items-center justify-center py-16 gap-1.5 text-center ${t("text-text-dark/25", "text-text-light/25")}`}
            >
              <ClockCounterClockwiseIcon size={20} />
              <span className="text-[10px] lowercase">no history</span>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {history.map((snapshot: TemplateSnapshot) => {
                const diff = diffs[snapshot.id];
                return (
                  <button
                    key={snapshot.id}
                    className={`aspect-square border flex flex-col items-center justify-center gap-0.5 p-2 transition-colors ${t(
                      "border-border-dark hover:bg-white/5",
                      "border-border-light hover:bg-black/3",
                    )}`}
                    onClick={() => onRestore(snapshot.markdown)}
                    type="button"
                  >
                    <span className="text-[11px] font-mono lowercase">
                      {formatTimestamp(snapshot.timestamp)}
                    </span>
                    <span
                      className={`text-[9px] font-mono ${t("text-text-dark/25", "text-text-light/25")}`}
                    >
                      {formatTime(snapshot.timestamp)}
                    </span>
                    {diff && (diff.added > 0 || diff.removed > 0) && (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="flex items-center gap-0.5 text-[9px] text-emerald-400 font-mono">
                          <PlusIcon size={9} weight="bold" />
                          {diff.added}
                        </span>
                        <span className="flex items-center gap-0.5 text-[9px] text-rose-400 font-mono">
                          <MinusIcon size={9} weight="bold" />
                          {diff.removed}
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
