import { GithubLogoIcon, XIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { useTheme } from "#/shared/hooks/use-theme";
import { useGitHubSettings, useUpdateGitHubSettings } from "../hooks/use-github-settings";

interface GithubConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GithubConfigModal = ({ isOpen, onClose }: GithubConfigModalProps) => {
  const { isDarkMode } = useTheme();
  const t = (dark: string, light: string) => (isDarkMode ? dark : light);
  const { data: settings } = useGitHubSettings();
  const updateSettings = useUpdateGitHubSettings();
  const [token, setToken] = useState("");
  const [saved, setSaved] = useState(false);

  if (!isOpen) {return null;}

  const handleToggle = () => {
    if (settings) {
      updateSettings.mutate({ enabled: !settings.enabled });
    }
  };

  const handleSaveToken = () => {
    if (token.trim()) {
      updateSettings.mutate(
        { token: token.trim() },
        {
          onSuccess: () => {
            setToken("");
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
          },
        },
      );
    }
  };

  const handleClearToken = () => {
    updateSettings.mutate({ token: "" });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className={`w-full max-w-lg max-h-[80vh] flex flex-col border ${t("bg-bg-dark border-border-dark text-text-dark", "bg-bg-light border-border-light text-text-light")}`}
      >
        <div
          className={`flex items-center justify-between px-3 py-1.5 border-b shrink-0 ${t("border-border-dark", "border-border-light")}`}
        >
          <div className="flex items-center gap-2">
            <GithubLogoIcon size={13} className={t("text-text-dark/40", "text-text-light/40")} />
            <span className="text-[12px] font-medium lowercase">github config</span>
          </div>
          <button
            className={`p-1 transition-colors ${t("text-text-dark/40 hover:text-text-dark", "text-text-light/40 hover:text-text-light")}`}
            onClick={onClose}
            type="button"
          >
            <XIcon size={15} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-left">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-medium lowercase">show github activity</span>
              <p className={`text-[10px] ${t("text-text-dark/40", "text-text-light/40")}`}>
                display contribution graph and stats on landing page
              </p>
            </div>
            <button
              className={`w-9 h-5 flex items-center transition-colors px-0.5 ${settings?.enabled ? "bg-emerald-500/40" : t("bg-white/10", "bg-black/10")}`}
              onClick={handleToggle}
              type="button"
            >
              <div
                className={`w-4 h-4 transition-transform ${settings?.enabled ? "translate-x-4 bg-emerald-500" : "translate-x-0 bg-white/50"}`}
              />
            </button>
          </div>

          <div className={`border-t ${t("border-border-dark", "border-border-light")}`} />

          <div>
            <span className="text-[11px] font-medium lowercase">github api key</span>
            <p className={`text-[10px] ${t("text-text-dark/40", "text-text-light/40")}`}>
              classic token with read:user scope. encrypted at rest with AES-256-GCM.
            </p>

            {settings?.hasToken && (
              <div className={`mt-1 text-[10px] ${t("text-emerald-400", "text-emerald-600")}`}>
                token configured &bull; encrypted
              </div>
            )}

            <div className="flex gap-2 mt-2">
              <input
                className={`flex-1 px-2 py-1 text-[11px] font-mono border outline-none bg-transparent ${t("border-border-dark focus:border-text-dark/40 placeholder:text-text-dark/20", "border-border-light focus:border-text-light/40 placeholder:text-text-light/20")}`}
                onChange={(e) => setToken(e.target.value)}
                placeholder="ghp_..."
                type="password"
                value={token}
              />
              <button
                className={`px-3 py-1 text-[10px] lowercase border transition-colors ${t("border-border-dark hover:bg-white/5", "border-border-light hover:bg-black/5")}`}
                disabled={!token.trim() || updateSettings.isPending}
                onClick={handleSaveToken}
                type="button"
              >
                {saved ? "saved" : "save"}
              </button>
              {settings?.hasToken && (
                <button
                  className={`px-3 py-1 text-[10px] lowercase border transition-colors ${t("border-rose-500/20 text-rose-400 hover:bg-rose-500/10", "border-rose-600/20 text-rose-600 hover:bg-rose-500/10")}`}
                  onClick={handleClearToken}
                  type="button"
                >
                  clear
                </button>
              )}
            </div>
            {updateSettings.isPending && (
              <p className={`mt-1 text-[10px] ${t("text-text-dark/30", "text-text-light/30")}`}>
                saving...
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
