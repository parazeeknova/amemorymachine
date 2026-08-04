import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { gsap } from "gsap";
import { XIcon } from "@phosphor-icons/react";
import { useTheme } from "#/shared/hooks/use-theme";

interface IframeModalProps {
  onClose: () => void;
  title: string;
  url: string;
}

// IframeModal shows a page or PDF in a simple centered frame. It closes on the
// close button, on Escape, or on a click outside the frame. Used for the
// resume PDF and the portfolio site.
export const IframeModal = ({ onClose, title, url }: IframeModalProps) => {
  const { isDarkMode } = useTheme();
  const overlayRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDialogElement>(null);

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
        {
          duration: 0.2,
          ease: "power2.out",
          onComplete: () => {
            // Drop the transform once the entrance finishes: a transform on
            // the frame creates a containing block, which breaks internal
            // scrolling of the PDF viewer inside the iframe.
            gsap.set(frame, { clearProps: "transform" });
          },
          opacity: 1,
          scale: 1,
          y: 0,
        },
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
      <dialog
        ref={frameRef}
        aria-label={title}
        className={`relative m-0 flex h-[90vh] w-[90vw] max-w-[90vw] flex-col overflow-hidden border bg-transparent p-0 ${
          isDarkMode ? "border-border-dark bg-bg-dark" : "border-border-light bg-bg-light"
        }`}
        open
      >
        <div
          className={`flex shrink-0 items-center justify-between px-2 py-1 border-b ${
            isDarkMode ? "border-border-dark" : "border-border-light"
          }`}
        >
          <span className="text-[10px] lowercase opacity-50">{title}</span>
          <button
            aria-label={`close ${title}`}
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
        <iframe
          className="min-w-0 w-full flex-1 overflow-auto border-0"
          scrolling="auto"
          src={url}
          title={title}
        />
      </dialog>
    </div>,
    document.body,
  );
};
