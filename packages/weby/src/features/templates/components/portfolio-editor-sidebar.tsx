import {
  ArrowCounterClockwiseIcon,
  ArrowLeftIcon,
  BookOpenIcon,
  ClockCounterClockwiseIcon,
  FloppyDiskIcon,
  GithubLogoIcon,
  ShapesIcon,
} from "@phosphor-icons/react";
import { useTheme } from "#/shared/hooks/use-theme";
import { SidebarTooltip } from "#/features/console/components/sidebar-tooltip";
import { useGitHubSettings } from "../hooks/use-github-settings";
import { usePortfolioEditorControls, usePortfolioStore } from "./portfolio-editor-context";

export const PortfolioEditorSidebar = () => {
  const { isDarkMode } = useTheme();
  const t = (dark: string, light: string) => (isDarkMode ? dark : light);
  const ctrl = usePortfolioEditorControls();
  const isPinned = ctrl?.isPinned ?? false;
  const setIsGuideOpen = usePortfolioStore((s) => s.setIsGuideOpen);
  const setIsHistoryOpen = usePortfolioStore((s) => s.setIsHistoryOpen);
  const setIsGithubConfigOpen = usePortfolioStore((s) => s.setIsGithubConfigOpen);
  
  const history = usePortfolioStore((s) => s.history);
  const { data: gitHubSettings } = useGitHubSettings();

  const navItemClass = (isActive: boolean) =>
    isActive
      ? t("bg-white/5 text-text-dark/90", "bg-black/3 text-text-light/90")
      : t(
          "text-text-dark/50 hover:bg-white/5 hover:text-text-dark/80",
          "text-text-light/50 hover:bg-black/3 hover:text-text-light/80",
        );

  if (!ctrl) {
    return (
      <div className="min-h-0 w-full flex-1 flex flex-col overflow-y-auto px-4">
        <div
          className={`flex items-center justify-between px-1 py-2 border-b ${t("border-border-dark", "border-border-light")}`}
        >
          <span className={`text-[11px] lowercase ${t("text-text-dark/40", "text-text-light/40")}`}>
            loading...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-0 w-full flex-1 flex flex-col overflow-y-auto px-4">
      <div
        className={`flex items-center justify-between px-1 py-2 border-b ${t("border-border-dark", "border-border-light")}`}
      >
        <button
          onClick={ctrl.onBack}
          className={`flex items-center gap-1.5 text-[11px] lowercase ${t("text-text-dark/70 hover:text-text-dark/90", "text-text-light/70 hover:text-text-light/90")}`}
          type="button"
        >
          <ArrowLeftIcon size={12} />
          back
        </button>
        <span className={`text-[11px] lowercase ${t("text-text-dark/40", "text-text-light/40")}`}>
          portfolio
        </span>
      </div>

      <div className="mt-2">
        <p
          className={`px-1 mb-1 text-[10px] uppercase tracking-wider ${t("text-text-dark/30", "text-text-light/30")}`}
        >
          template
        </p>

        <button
          className={`flex w-full items-center gap-2 px-1 py-1.5 text-left text-[11px] lowercase ${ctrl.isSaving || !ctrl.hasChanges ? `cursor-not-allowed opacity-40 ${t("text-text-dark/50", "text-text-light/50")}` : navItemClass(false)}`}
          disabled={ctrl.isSaving || !ctrl.hasChanges}
          onClick={ctrl.handlePin}
          type="button"
        >
          <FloppyDiskIcon size={12} />
          <span className="flex-1">save</span>
          {history.length > 0 && (
            <span
              className={`text-[9px] font-mono px-1 py-0.5 ${t("text-text-dark/25 bg-white/3", "text-text-light/25 bg-black/3")}`}
            >
              {history.length}
            </span>
          )}
        </button>

        <button
          className={`flex w-full items-center gap-2 px-1 py-1.5 text-left text-[11px] lowercase ${navItemClass(false)}`}
          onClick={() => setIsGuideOpen(true)}
          type="button"
        >
          <BookOpenIcon size={12} />
          format guide
        </button>

        <button
          className={`flex w-full items-center gap-2 px-1 py-1.5 text-left text-[11px] lowercase ${navItemClass(false)}`}
          onClick={ctrl.handleReset}
          type="button"
        >
          <ArrowCounterClockwiseIcon size={12} />
          reset to boilerplate
        </button>

        <SidebarTooltip label={history.length === 0 ? "save a template first" : ""}>
          <button
            className={`flex w-full items-center gap-2 px-1 py-1.5 text-left text-[11px] lowercase ${history.length === 0 ? `cursor-not-allowed opacity-40 ${t("text-text-dark/50", "text-text-light/50")}` : navItemClass(false)}`}
            disabled={history.length === 0}
            onClick={() => setIsHistoryOpen(true)}
            type="button"
          >
            <ClockCounterClockwiseIcon size={12} />
            template history
          </button>
        </SidebarTooltip>

        <button
          className={`flex w-full items-center gap-2 px-1 py-1.5 text-left text-[11px] lowercase ${navItemClass(false)}`}
          onClick={() => setIsGithubConfigOpen(true)}
          type="button"
        >
          <GithubLogoIcon size={12} />
          <span className="flex-1">github config</span>
          <span
            className={`w-1.5 h-1.5 ${gitHubSettings?.enabled ? "bg-emerald-400" : t("bg-text-dark/20", "bg-text-light/20")}`}
          />
        </button>

        <SidebarTooltip label="coming soon">
          <button
            className={`flex w-full cursor-not-allowed items-center gap-2 px-1 py-1.5 text-left text-[11px] lowercase opacity-40 ${t("text-text-dark/50", "text-text-light/50")}`}
            type="button"
          >
            <ShapesIcon size={12} />
            presets
          </button>
        </SidebarTooltip>
      </div>

      <div className="mt-auto pb-1">
        <div
          className={`flex items-center justify-between px-1 ${t("border-border-dark", "border-border-light")}`}
        >
          <span className={`text-[10px] lowercase ${t("text-text-dark/25", "text-text-light/25")}`}>
            pin state
          </span>
          <span
            className={`flex items-center gap-1 text-[10px] lowercase ${isPinned ? "text-purple-400" : t("text-text-dark/25", "text-text-light/25")}`}
          >
            {isPinned ? "active" : "inactive"}
          </span>
        </div>
      </div>
    </div>
  );
};
