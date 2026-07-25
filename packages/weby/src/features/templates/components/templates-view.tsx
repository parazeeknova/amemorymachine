import { PlusIcon } from "@phosphor-icons/react";
import { useEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";
import { useTheme } from "#/shared/hooks/use-theme";
import { useNavigate } from "@tanstack/react-router";
import { useTemplates } from "#/features/landing";

interface PortfolioTemplatePreviewProps {
  cardRef: React.RefObject<HTMLButtonElement | null>;
}

const PortfolioTemplatePreview = ({ cardRef }: PortfolioTemplatePreviewProps) => {
  const img1Ref = useRef<HTMLDivElement>(null);
  const img2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    const img1 = img1Ref.current;
    const img2 = img2Ref.current;
    if (!card || !img1 || !img2) {
      return;
    }

    const ctx = gsap.context(() => {
      // Set initial V-fan transforms via GSAP to avoid CSS transform shorthand mismatch
      gsap.set(img1, {
        rotate: -8,
        scale: 0.95,
        xPercent: -70,
        yPercent: -50,
      });
      gsap.set(img2, {
        rotate: 8,
        scale: 0.95,
        xPercent: -30,
        yPercent: -50,
      });
    });

    const onEnter = () => {
      ctx.add(() => {
        // Hovered Grid Mode: Side-by-side with 2% edge padding and 1% center gap
        gsap.to(img1, {
          duration: 0.3,
          ease: "power2.out",
          height: "90%",
          left: "2%",
          rotate: 0,
          scale: 1,
          top: "50%",
          width: "47%",
          xPercent: 0,
          yPercent: -50,
        });
        gsap.to(img2, {
          duration: 0.3,
          ease: "power2.out",
          height: "90%",
          left: "51%",
          rotate: 0,
          scale: 1,
          top: "50%",
          width: "47%",
          xPercent: 0,
          yPercent: -50,
        });
      });
    };

    const onLeave = () => {
      ctx.add(() => {
        // Idle V-Fan Mode: Centered overlapping V-fan stack of portrait cards
        gsap.to(img1, {
          duration: 0.3,
          ease: "power2.out",
          height: "90%",
          left: "50%",
          rotate: -8,
          scale: 0.95,
          top: "50%",
          width: "48%",
          xPercent: -70,
          yPercent: -50,
        });
        gsap.to(img2, {
          duration: 0.3,
          ease: "power2.out",
          height: "90%",
          left: "50%",
          rotate: 8,
          scale: 0.95,
          top: "50%",
          width: "48%",
          xPercent: -30,
          yPercent: -50,
        });
      });
    };

    card.addEventListener("mouseenter", onEnter);
    card.addEventListener("mouseleave", onLeave);

    return () => {
      card.removeEventListener("mouseenter", onEnter);
      card.removeEventListener("mouseleave", onLeave);
      ctx.revert();
    };
  }, [cardRef]);

  return (
    <div className="relative flex-1 w-full my-2 overflow-hidden pointer-events-none min-h-40">
      {/* Dark mode image */}
      <div
        ref={img1Ref}
        className="absolute overflow-hidden pointer-events-none rounded-sm shadow-md"
        style={{
          height: "90%",
          left: "50%",
          top: "50%",
          width: "48%",
          zIndex: 1,
        }}
      >
        <img
          alt="Portfolio Dark Template"
          className="w-full h-full object-cover object-top pointer-events-none"
          src="https://img.przknv.cc/t/portfolio-dark-template.png"
        />
      </div>

      {/* Light mode image */}
      <div
        ref={img2Ref}
        className="absolute overflow-hidden pointer-events-none rounded-sm shadow-md"
        style={{
          height: "90%",
          left: "50%",
          top: "50%",
          width: "48%",
          zIndex: 2,
        }}
      >
        <img
          alt="Portfolio Light Template"
          className="w-full h-full object-cover object-top pointer-events-none"
          src="https://img.przknv.cc/t/portfolio-light-template.png"
        />
      </div>
    </div>
  );
};

export const TemplatesView = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const cardRef = useRef<HTMLButtonElement>(null);
  const { data: templates } = useTemplates();

  const isPortfolioActive = templates?.some((tmpl) => tmpl.isDefault) ?? false;

  const t = (dark: string, light: string) => (isDarkMode ? dark : light);

  const now = useMemo(() => new Date(), []);
  const dateStr = now.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    weekday: "short",
  });

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col px-4 pt-12 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className={`text-lg lowercase ${t("text-text-dark", "text-text-light")}`}>templates</h1>
        <span
          className={`shrink-0 text-[10px] lowercase font-mono ${t("text-text-dark/20", "text-text-light/20")}`}
        >
          {dateStr}
        </span>
      </div>
      <p className={`mt-1 text-[12px] lowercase ${t("text-text-dark/30", "text-text-light/30")}`}>
        select a template to customize and pin to your main / route
      </p>

      {/* Templates Section */}
      <div
        className={`mt-8 border-t pt-5 ${t("border-border-dark", "border-border-light")}`}
        id="templates-section"
      >
        <p className={`text-[11px] lowercase mb-3 ${t("text-text-dark/30", "text-text-light/30")}`}>
          available templates
        </p>

        {/* Square Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Developer Portfolio Card (Square) */}
          <div className="flex flex-col">
            <button
              ref={cardRef}
              className={`aspect-square flex flex-col justify-between border border-b-0 p-4 text-left lowercase bg-linear-to-b transition-all overflow-hidden cursor-pointer w-full ${t("border-border-dark from-white/3 to-transparent hover:bg-white/5", "border-border-light from-black/2 to-transparent hover:bg-black/3")}`}
              onClick={() => navigate({ to: "/home/templates/portfolio" })}
              type="button"
            >
              <div className="flex flex-col flex-1 min-h-0 w-full">
                <div className="flex items-center justify-between shrink-0">
                  <h3
                    className={`text-[13px] font-medium ${t("text-text-dark/80", "text-text-light/80")}`}
                  >
                    developer portfolio
                  </h3>
                </div>

                <p
                  className={`mt-2 text-[10px] leading-tight shrink-0 line-clamp-2 ${t("text-text-dark/40", "text-text-light/40")}`}
                >
                  personal developer portfolio with profile bio, work timeline, project showcase,
                  and github stats.
                </p>

                {/* Interactive GSAP V-Fan to Grid Template Preview */}
                <PortfolioTemplatePreview cardRef={cardRef} />
              </div>
            </button>

            {/* Status strip — attached to card */}
            <div
              className={`flex items-center px-2.5 py-1 border border-t-0 text-[9px] lowercase ${isPortfolioActive ? `bg-linear-to-t from-purple-500/10 to-transparent ${t("border-purple-500/30 text-purple-400", "border-purple-600/30 text-purple-700")}` : t("border-border-dark text-text-dark/25", "border-border-light text-text-light/25")}`}
            >
              {isPortfolioActive ? "active on /" : "not in use"}
            </div>
          </div>

          {/* More Templates Coming Soon Card (Square) */}
          <div className="flex flex-col">
            <div
              className={`aspect-square flex flex-col justify-between border border-dashed border-b-0 p-4 text-left lowercase bg-linear-to-b overflow-hidden ${t("border-border-dark/60 from-white/2 to-transparent text-text-dark/30", "border-border-light/60 from-black/2 to-transparent text-text-light/30")}`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <PlusIcon size={14} />
                    <h3 className="text-[13px] font-medium">more templates</h3>
                  </div>
                  <span
                    className={`text-[9px] font-mono border px-1.5 py-0.5 ${t("border-border-dark/40 text-text-dark/30", "border-border-light/40 text-text-light/30")}`}
                  >
                    coming soon
                  </span>
                </div>

                <p className="mt-3 text-[11px] leading-relaxed line-clamp-5">
                  additional page templates (blog showcase, documentation hub, product landing page)
                  are coming soon.
                </p>
              </div>

              <div
                className={`flex items-center justify-between border-t pt-3 ${t("border-border-dark/40", "border-border-light/40")}`}
              >
                <span className="text-[10px] font-mono">verso engine</span>
                <span className="text-[10px] font-mono opacity-60">v0.5</span>
              </div>
            </div>

            {/* Status strip — attached to card */}
            <div
              className={`flex items-center px-2.5 py-1 border border-t-0 text-[9px] lowercase ${t("border-border-dark/60 text-text-dark/25", "border-border-light/60 text-text-light/25")}`}
            >
              coming soon
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <p
        className={`sticky bottom-0 mt-auto pb-4 pt-8 text-center text-[10px] lowercase transition-colors duration-500 ease-out ${t("text-text-dark/20 bg-bg-dark/80", "text-text-light/20 bg-bg-light/80")}`}
      >
        verso template engine • 1 template active
      </p>
    </div>
  );
};
