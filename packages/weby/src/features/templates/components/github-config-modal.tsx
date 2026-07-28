import { GithubLogoIcon, PencilSimpleIcon, XIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { useTheme } from "#/shared/hooks/use-theme";
import { GitHubStats } from "#/features/github/components/stats";
import { useGitHubSettings, useUpdateGitHubSettings } from "../hooks/use-github-settings";

interface GithubConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const relativeTime = (iso?: string) => {
  if (!iso) {
    return "";
  }
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) {
    return "just now";
  }
  if (mins < 60) {
    return `${mins}m ago`;
  }
  const hours = Math.floor(mins / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }
  return `${Math.floor(hours / 24)}d ago`;
};

const underlineInput = (t: (d: string, l: string) => string) =>
  `w-full px-0 py-0.5 text-[10px] font-mono outline-none bg-transparent border-0 border-b ${t("border-text-dark/20 focus:border-text-dark/40 placeholder:text-text-dark/15", "border-text-light/20 focus:border-text-light/40 placeholder:text-text-light/15")}`;

// eslint-disable-next-line complexity
export const GithubConfigModal = ({ isOpen, onClose }: GithubConfigModalProps) => {
  const { isDarkMode } = useTheme();
  const t = (dark: string, light: string) => (isDarkMode ? dark : light);
  const { data: settings } = useGitHubSettings();
  const updateSettings = useUpdateGitHubSettings();
  const [token, setToken] = useState("");
  const [username, setUsername] = useState("");
  const [editingUsername, setEditingUsername] = useState(false);
  const [editingToken, setEditingToken] = useState(false);

  if (!isOpen) {
    return null;
  }

  const handleToggle = () => {
    if (settings) {
      updateSettings.mutate({ enabled: !settings.enabled });
    }
  };

  const saveUsername = () => {
    if (username.trim()) {
      updateSettings.mutate(
        { username: username.trim() },
        {
          onSuccess: () => {
            setUsername("");
            setEditingUsername(false);
          },
        },
      );
    }
  };

  const saveToken = () => {
    if (token.trim()) {
      updateSettings.mutate(
        { token: token.trim() },
        {
          onSuccess: () => {
            setToken("");
            setEditingToken(false);
          },
        },
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs">
      <div className="flex justify-center pt-16">
        <div
          className={`border ${t("bg-bg-dark border-border-dark text-text-dark", "bg-bg-light border-border-light text-text-light")}`}
        >
          <div className="p-3 space-y-3 text-left w-80">
            {/* Toggle + Close */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GithubLogoIcon
                  size={12}
                  className={t("text-text-dark/40", "text-text-light/40")}
                />
                <span className="text-[11px] lowercase">show github activity</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  aria-label="toggle github activity"
                  className={`w-8 h-4.5 flex items-center transition-colors px-0.5 ${settings?.enabled ? "bg-emerald-500/40" : t("bg-white/10", "bg-black/10")}`}
                  onClick={handleToggle}
                  type="button"
                >
                  <div
                    className={`w-3.5 h-3.5 transition-transform ${settings?.enabled ? "translate-x-3.5 bg-emerald-500" : "translate-x-0 bg-white/50"}`}
                  />
                </button>
                <button
                  className={`p-0.5 transition-colors ${t("text-text-dark/30 hover:text-text-dark", "text-text-light/30 hover:text-text-light")}`}
                  onClick={onClose}
                  type="button"
                >
                  <XIcon size={14} />
                </button>
              </div>
            </div>

            {settings?.enabled && (
              <>
                <div
                  className={`border-t ${t("border-border-dark/20", "border-border-light/20")}`}
                />

                {/* Username */}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] lowercase opacity-50">username</span>
                    {editingUsername ? (
                      <div className="flex items-center gap-1 flex-1">
                        <input
                          className={underlineInput(t)}
                          autoFocus
                          onChange={(e) => setUsername(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              saveUsername();
                            }
                          }}
                          placeholder={settings?.username || "parazeeknova"}
                          value={username}
                        />
                        <button
                          className="text-[10px] lowercase opacity-50 hover:opacity-100"
                          onClick={saveUsername}
                          type="button"
                        >
                          save
                        </button>
                        <button
                          className="text-[10px] lowercase opacity-30 hover:opacity-100"
                          onClick={() => setEditingUsername(false)}
                          type="button"
                        >
                          cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="text-[10px] font-mono">
                          {settings?.username || "parazeeknova"}
                        </span>
                        <button
                          className="opacity-30 hover:opacity-100"
                          onClick={() => setEditingUsername(true)}
                          type="button"
                        >
                          <PencilSimpleIcon size={10} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* API Key */}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] lowercase opacity-50">api key</span>
                    {editingToken ? (
                      <div className="flex items-center gap-1 flex-1">
                        <input
                          className={underlineInput(t)}
                          autoFocus
                          onChange={(e) => setToken(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              saveToken();
                            }
                          }}
                          placeholder={settings?.hasToken ? "••••••••" : "ghp_..."}
                          type="password"
                          value={token}
                        />
                        <button
                          className="text-[10px] lowercase opacity-50 hover:opacity-100"
                          onClick={saveToken}
                          type="button"
                        >
                          save
                        </button>
                        <button
                          className="text-[10px] lowercase opacity-30 hover:opacity-100"
                          onClick={() => setEditingToken(false)}
                          type="button"
                        >
                          cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <span
                          className={`text-[10px] ${settings?.hasToken ? "text-emerald-400" : "opacity-30"}`}
                        >
                          {settings?.hasToken
                            ? `ghp_**** · ${relativeTime(settings.tokenUpdatedAt)}`
                            : "not set"}
                        </span>
                        <button
                          className="opacity-30 hover:opacity-100"
                          onClick={() => setEditingToken(true)}
                          type="button"
                        >
                          <PencilSimpleIcon size={10} />
                        </button>
                        {settings?.hasToken && (
                          <button
                            className="text-[10px] lowercase opacity-30 hover:opacity-100"
                            onClick={() => updateSettings.mutate({ token: "" })}
                            type="button"
                          >
                            clear
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Preview */}
                {settings?.hasToken && (
                  <>
                    <div
                      className={`border-t ${t("border-border-dark/20", "border-border-light/20")}`}
                    />
                    <div className="scale-75 origin-top-left opacity-60">
                      <GitHubStats />
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
