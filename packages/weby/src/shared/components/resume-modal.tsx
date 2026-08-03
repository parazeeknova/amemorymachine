import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { gsap } from "gsap";
import { XIcon } from "@phosphor-icons/react";
import { useTheme } from "#/shared/hooks/use-theme";

interface ResumeModalProps {
  onClose: () => void;
  url: string;
}

// ResumeModal shows a resume PDF in a simple centered frame. It closes on the
// close button, on Escape, or on a click outside the frame.
export const ResumeModal = ({ onClose, url }: ResumeModalProps) => {
  const { isDarkMode } = useTheme();
  const overlayRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const overlay = overlayRef.current;
    const frame = frameRef.current;
    if (overlay) {
      gsap.fromTo(overlay, { opacity: 0 }, { duration: 0.15, opacity: 1 });
    }
    if (frame) {
      gsap.fromTo(
        frame,
        { opacity: 0, scale: 0.96, y: 10 },
        { duration: 0.2, ease: "power2.out", opacity: 1, scale: 1, y: 0 },
      );
    }
    return () => {
      if (overlay) {
        gsap.killTweensOf(overlay);
      }
      if (frame) {
        gsap.killTweensOf(frame);
      }
    };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) {
          onClose();
        }
      }}
      role="presentation"
    >
      <div
        ref={frameRef}
        className={`relative flex h-[85vh] w-full max-w-3xl flex-col border ${
          isDarkMode ? "border-border-dark bg-bg-dark" : "border-border-light bg-bg-light"
        }`}
        role="dialog"
        aria-label="Resume"
      >
        <div
          className={`flex shrink-0 items-center justify-between px-2 py-1 border-b ${
            isDarkMode ? "border-border-dark" : "border-border-light"
          }`}
        >
          <span className="text-[10px] lowercase opacity-50">resume</span>
          <button
            aria-label="close resume"
            className={`flex h-4 w-4 items-center justify-center rounded-sm transition-colors ${
              isDarkMode
                ? "text-text-dark/70 hover:text-text-dark hover:bg-white/10"
                : "text-text-light/70 hover:text-text-light hover:bg-black/10"
            }`}
            onClick={onClose}
            type="button"
          >
            <XIcon size={10} />
          </button>
        </div>
        <iframe className="min-h-0 flex-1 w-full border-0" src={url} title="resume" />
      </div>
    </div>,
    document.body,
  );
};
