import { GithubLogoIcon, XIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { useTheme } from "#/shared/hooks/use-theme";
import { GitHubStats } from "#/features/github/components/stats";
import { useGitHubSettings, useUpdateGitHubSettings } from "../hooks/use-github-settings";

interface GithubConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const relativeTime = (iso?: string) => {
  if (!iso) {return "";}
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) {return "just now";}
  if (mins < 60) {return `${mins}m ago`;}
  const hours = Math.floor(mins / 60);
  if (hours < 24) {return `${hours}h ago`;}
  return `${Math.floor(hours / 24)}d ago`;
};

// eslint-disable-next-line complexity
export const GithubConfigModal = ({ isOpen, onClose }: GithubConfigModalProps) => {
  const { isDarkMode } = useTheme();
  const t = (dark: string, light: string) => (isDarkMode ? dark : light);
  const { data: settings } = useGitHubSettings();
  const updateSettings = useUpdateGitHubSettings();
  const [token, setToken] = useState("");
  const [username, setUsername] = useState("");
  const [showTokenInput, setShowTokenInput] = useState(false);

  if (!isOpen) {
    return null;
  }

  const handleToggle = () => {
    if (settings) {
      updateSettings.mutate({ enabled: !settings.enabled });
    }
  };

  const handleSaveUsername = () => {
    if (username.trim()) {
      updateSettings.mutate({ username: username.trim() }, { onSuccess: () => setUsername("") });
    }
  };

  const handleSaveToken = () => {
    if (token.trim()) {
      updateSettings.mutate({ token: token.trim() }, { onSuccess: () => setToken("") });
    }
  };

  const handleClearToken = () => updateSettings.mutate({ token: "" });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className={`w-full max-w-lg max-h-[85vh] flex flex-col border ${t("bg-bg-dark border-border-dark text-text-dark", "bg-bg-light border-border-light text-text-light")}`}
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
          {/* Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-medium lowercase">show github activity</span>
              <p className={`text-[10px] ${t("text-text-dark/40", "text-text-light/40")}`}>
                display contribution graph and stats on landing page
              </p>
            </div>
            <button
              aria-label="toggle github activity"
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

          {/* Username */}
          <div>
            <span className="text-[11px] font-medium lowercase">github username</span>
            <p className={`text-[10px] ${t("text-text-dark/40", "text-text-light/40")}`}>
              {settings?.username ? `current: ${settings.username}` : "defaults to parazeeknova"}
            </p>
            <div className="flex gap-2 mt-1.5">
              <input
                className={`flex-1 px-2 py-1 text-[11px] font-mono border outline-none bg-transparent ${t("border-border-dark focus:border-text-dark/40 placeholder:text-text-dark/20", "border-border-light focus:border-text-light/40 placeholder:text-text-light/20")}`}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={settings?.username || "parazeeknova"}
                value={username}
              />
              <button
                className={`px-3 py-1 text-[10px] lowercase border transition-colors ${t("border-border-dark hover:bg-white/5", "border-border-light hover:bg-black/5")}`}
                disabled={!username.trim() || updateSettings.isPending}
                onClick={handleSaveUsername}
                type="button"
              >
                save
              </button>
            </div>
          </div>

          <div className={`border-t ${t("border-border-dark", "border-border-light")}`} />

          {/* API Key Section */}
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium lowercase">api key (optional)</span>
              <button
                className={`text-[10px] lowercase ${t("text-text-dark/40 hover:text-text-dark", "text-text-light/40 hover:text-text-light")}`}
                onClick={() => setShowTokenInput(!showTokenInput)}
                type="button"
              >
                {(() => {
                  if (showTokenInput) {
                    return "hide";
                  }
                  if (settings?.hasToken) {
                    return "manage";
                  }
                  return "add";
                })()}
              </button>
            </div>
            <p className={`text-[10px] ${t("text-text-dark/40", "text-text-light/40")}`}>
              {settings?.hasToken
                ? `ghp_**** · valid · ${relativeTime(settings.tokenUpdatedAt)}`
                : "no key · public data only"}
            </p>

            {showTokenInput && (
              <>
                <p className={`text-[10px] mt-1 ${t("text-text-dark/30", "text-text-light/30")}`}>
                  classic token with read:user scope. encrypted at rest (AES-256-GCM).
                </p>
                <div className="flex gap-2 mt-1.5">
                  <input
                    className={`flex-1 px-2 py-1 text-[11px] font-mono border outline-none bg-transparent ${t("border-border-dark focus:border-text-dark/40 placeholder:text-text-dark/20", "border-border-light focus:border-text-light/40 placeholder:text-text-light/20")}`}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder={settings?.hasToken ? "••••••••" : "ghp_..."}
                    type="password"
                    value={token}
                  />
                  <button
                    className={`px-3 py-1 text-[10px] lowercase border transition-colors ${t("border-border-dark hover:bg-white/5", "border-border-light hover:bg-black/5")}`}
                    disabled={!token.trim() || updateSettings.isPending}
                    onClick={handleSaveToken}
                    type="button"
                  >
                    save
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
              </>
            )}
          </div>

          {settings?.hasToken && (
            <>
              <div className={`border-t ${t("border-border-dark", "border-border-light")}`} />
              <div>
                <span className="text-[11px] font-medium lowercase">preview</span>
                <div className="mt-2 scale-75 origin-top-left">
                  <GitHubStats />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
