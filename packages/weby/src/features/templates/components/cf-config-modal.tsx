import { Code, PencilSimpleIcon, XIcon } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { logger } from "#/shared/lib/logger";
import { useTheme } from "#/shared/hooks/use-theme";
import { useCFSettings, useUpdateCFSettings } from "../hooks/use-cf-settings";

interface CFConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const underlineInput = (t: (d: string, l: string) => string) =>
  `w-full px-0 py-0.5 text-[10px] font-mono outline-none bg-transparent border-0 border-b ${t("border-text-dark/20 focus:border-text-dark/40 placeholder:text-text-dark/15", "border-text-light/20 focus:border-text-light/40 placeholder:text-text-light/15")}`;

export const CFConfigModal = ({ isOpen, onClose }: CFConfigModalProps) => {
  const { isDarkMode } = useTheme();
  const t = (dark: string, light: string) => (isDarkMode ? dark : light);
  const { data: settings } = useCFSettings();
  const updateSettings = useUpdateCFSettings();
  const [username, setUsername] = useState("");
  const [editingUsername, setEditingUsername] = useState(false);
  const [visible, setVisible] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setVisible(false);
      return;
    }
    setVisible(true);
  }, [isOpen]);

  useEffect(() => {
    if (!visible) {
      return;
    }
    const ctx = gsap.context(() => {
      if (overlayRef.current) {
        gsap.fromTo(overlayRef.current, { opacity: 0 }, { duration: 0.15, opacity: 1 });
      }
      if (cardRef.current) {
        gsap.fromTo(
          cardRef.current,
          { opacity: 0, y: -8 },
          { duration: 0.2, ease: "power2.out", opacity: 1, y: 0 },
        );
      }
    });
    return () => ctx.revert();
  }, [visible]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!visible) {
    return null;
  }

  const handleToggle = () => {
    const nextEnabled = !(settings?.enabled ?? false);
    logger.info({ enabled: nextEnabled }, "cf config: toggling codeforces activity");
    updateSettings.mutate({ enabled: nextEnabled });
  };

  const saveUsername = () => {
    if (username.trim()) {
      logger.info({ username: username.trim() }, "cf config: saving username");
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

  return (
    <div ref={overlayRef} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs">
      <div className="flex justify-center pt-16">
        <div
          ref={cardRef}
          className={`border ${t("bg-bg-dark border-border-dark text-text-dark", "bg-bg-light border-border-light text-text-light")}`}
        >
          <div className="p-3 space-y-3 text-left w-80">
            {/* Toggle + Close */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code size={12} className={t("text-text-dark/40", "text-text-light/40")} />
                <span className="text-[11px] lowercase">show codeforces activity</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  aria-label="toggle codeforces activity"
                  className={`w-8 h-4.5 flex items-center transition-colors px-0.5 ${settings?.enabled ? "bg-amber-500/40" : t("bg-white/10", "bg-black/10")}`}
                  onClick={handleToggle}
                  type="button"
                >
                  <div
                    className={`w-3.5 h-3.5 transition-transform ${settings?.enabled ? "translate-x-3.5 bg-amber-500" : "translate-x-0 bg-white/50"}`}
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
                    <span className="text-[10px] lowercase opacity-50">handle</span>
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

                <div
                  className={`border-t ${t("border-border-dark/20", "border-border-light/20")}`}
                />
                <p className={`text-[9px] italic ${t("text-text-dark/25", "text-text-light/35")}`}>
                  data is fetched from the public Codeforces API. no token required.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
