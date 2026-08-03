import { useEffect, useLayoutEffect } from "react";
import type { RefObject } from "react";
import { gsap } from "gsap";

interface SquiggleOptions {
  delay?: number;
  duration?: number;
  stagger?: number;
  hoverDuration?: number;
}

const SQUIGGLE_SELECTOR = ".prose-desc a, .squiggle-link";
const LOAD_DRAW_SELECTOR = ".prose-desc a";

// useSquiggleDraw animates the purple squiggly underlines via the
// --squiggle-progress CSS var (see styles.css).
//
// Two behaviors:
//  - On load (isReady flips true) the description-link waves draw in once
//    after the parent content reveal. Standalone .squiggle-link elements
//    (portfolio / resume) stay hidden here — their wave appears on hover.
//  - On hover every link's wave draws from left to right, and reverses back
//    when the pointer leaves. Handlers are delegated on the container so they
//    survive re-renders of the links.
export const useSquiggleDraw = (
  isReady: boolean,
  containerRef: RefObject<HTMLElement | null>,
  options: SquiggleOptions = {},
): void => {
  const { delay = 0.3, duration = 0.5, hoverDuration = 0.4, stagger = 0.12 } = options;

  // Initial draw-in after content becomes ready.
  useLayoutEffect(() => {
    if (!isReady) {
      return;
    }
    const container = containerRef.current;
    if (!container) {
      return;
    }
    const links = [...container.querySelectorAll<HTMLElement>(LOAD_DRAW_SELECTOR)];
    if (links.length === 0) {
      return;
    }

    gsap.killTweensOf(links);
    gsap.fromTo(
      links,
      { "--squiggle-progress": 0 },
      {
        "--squiggle-progress": 100,
        delay,
        duration,
        ease: "power3.out",
        stagger,
      },
    );
  }, [containerRef, delay, duration, isReady, stagger]);

  // Hover re-draw via delegated listeners on the container.
  useEffect(() => {
    if (!isReady) {
      return;
    }
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const drawIn = (link: HTMLElement) => {
      gsap.killTweensOf(link);
      gsap.to(link, {
        "--squiggle-progress": 100,
        duration: hoverDuration,
        ease: "power3.out",
      });
    };

    const drawOut = (link: HTMLElement) => {
      gsap.killTweensOf(link);
      gsap.to(link, {
        "--squiggle-progress": 0,
        duration: hoverDuration,
        ease: "power3.in",
        onComplete: () => {
          // Persist the hidden state after GSAP's cleanup (which runs after
          // onComplete and would otherwise revert to the drawn CSS default).
          gsap.delayedCall(0, () => {
            link.style.setProperty("--squiggle-progress", "0");
          });
        },
      });
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest<HTMLElement>(SQUIGGLE_SELECTOR);
      if (link) {
        drawIn(link);
      }
    };

    const onMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest<HTMLElement>(SQUIGGLE_SELECTOR);
      if (link) {
        drawOut(link);
      }
    };

    container.addEventListener("mouseover", onMouseOver);
    container.addEventListener("mouseout", onMouseOut);

    return () => {
      container.removeEventListener("mouseover", onMouseOver);
      container.removeEventListener("mouseout", onMouseOut);
    };
  }, [containerRef, hoverDuration, isReady]);
};
