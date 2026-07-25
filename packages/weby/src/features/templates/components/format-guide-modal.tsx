import { CheckCircleIcon, XIcon } from "@phosphor-icons/react";
import { useTheme } from "#/shared/hooks/use-theme";

interface FormatGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FormatGuideModal = ({ isOpen, onClose }: FormatGuideModalProps) => {
  const { isDarkMode } = useTheme();
  const t = (dark: string, light: string) => (isDarkMode ? dark : light);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className={`w-full max-w-xl max-h-[85vh] flex flex-col border shadow-2xl p-5 text-left lowercase ${t(
          "bg-bg-dark border-border-dark text-text-dark",
          "bg-bg-light border-border-light text-text-light",
        )}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border-dark/50 shrink-0">
          <div>
            <h3 className="text-sm font-semibold">template format guidelines</h3>
            <p className={`text-[11px] mt-0.5 ${t("text-text-dark/40", "text-text-light/40")}`}>
              markdown structure rules for sync to database
            </p>
          </div>
          <button
            className={`p-1 transition-colors ${t("text-text-dark/40 hover:text-text-dark", "text-text-light/40 hover:text-text-light")}`}
            onClick={onClose}
            type="button"
          >
            <XIcon size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 font-mono text-[11px] leading-relaxed">
          {/* Section 1: Required Headers */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-purple-400 font-bold">
              <CheckCircleIcon size={14} /> 1. required section comment headers
            </div>
            <p className={t("text-text-dark/50", "text-text-light/50")}>
              the parser looks for these exact comment strings to partition sections:
            </p>
            <pre
              className={`p-2.5 border text-[10px] overflow-x-auto ${t("border-border-dark bg-white/3 text-purple-300", "border-border-light bg-black/3 text-purple-700")}`}
            >
              {`<!-- ==================== PROFILE SECTION (REQUIRED BY PORTFOLIO) ==================== -->
<!-- ==================== EXPERIENCE TIMELINE (REQUIRED BY PORTFOLIO) ==================== -->
<!-- ==================== PROJECT SHOWCASE (REQUIRED BY PORTFOLIO) ==================== -->`}
            </pre>
          </div>

          {/* Section 2: Profile Section */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-purple-400 font-bold">
              <CheckCircleIcon size={14} /> 2. profile section fields
            </div>
            <pre
              className={`p-2.5 border text-[10px] overflow-x-auto ${t("border-border-dark bg-white/3 text-text-dark/80", "border-border-light bg-black/3 text-text-light/80")}`}
            >
              {`Name: Your Full Name
Tagline: your title or tagline
Username: yourusername
Email: your@email.com
Description: short bio or summary paragraph.

Links:
- label: https://your-link.com
- github: https://github.com/username`}
            </pre>
          </div>

          {/* Section 3: Experience Section */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-purple-400 font-bold">
              <CheckCircleIcon size={14} /> 3. experience items format
            </div>
            <pre
              className={`p-2.5 border text-[10px] overflow-x-auto ${t("border-border-dark bg-white/3 text-text-dark/80", "border-border-light bg-black/3 text-text-light/80")}`}
            >
              {`### Job Title — Company Name
- Location: Remote (City, Country)
- Period: Month YY' – Present`}
            </pre>
          </div>

          {/* Section 4: Projects Section */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-purple-400 font-bold">
              <CheckCircleIcon size={14} /> 4. project items format
            </div>
            <pre
              className={`p-2.5 border text-[10px] overflow-x-auto ${t("border-border-dark bg-white/3 text-text-dark/80", "border-border-light bg-black/3 text-text-light/80")}`}
            >
              {`### Project Name
- Desc: Project description string
- Image: https://img-url.png
- Stack: React, TypeScript, Bun, Tailwind
- Readme: https://raw.github...
- Repo: https://github...
- Product: https://app-domain.com`}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-border-dark/50 flex justify-end shrink-0">
          <button
            className={`px-3 py-1 text-[11px] border font-mono lowercase transition-colors ${t(
              "border-purple-500/40 text-purple-400 bg-purple-500/10 hover:bg-purple-500/20",
              "border-purple-600/40 text-purple-700 bg-purple-500/10 hover:bg-purple-500/20",
            )}`}
            onClick={onClose}
            type="button"
          >
            got it
          </button>
        </div>
      </div>
    </div>
  );
};
