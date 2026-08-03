import { useLayoutEffect } from "react";
import type { RefObject } from "react";
import { gsap } from "gsap";

interface SquiggleOptions {
  delay?: number;
  duration?: number;
  stagger?: number;
}

// useSquiggleDraw animates the purple squiggly underlines inside a
// .prose-desc block, drawing each wave in left-to-right via the
// --squiggle-progress CSS var (see styles.css). Runs after the parent
// content reveal so the text and the underline appear together.
export const useSquiggleDraw = (
  isReady: boolean,
  containerRef: RefObject<HTMLElement | null>,
  options: SquiggleOptions = {},
): void => {
  const { delay = 0.3, duration = 0.5, stagger = 0.12 } = options;

  useLayoutEffect(() => {
    if (!isReady) {
      return;
    }
    const container = containerRef.current;
    if (!container) {
      return;
    }
    const links = [...container.querySelectorAll<HTMLElement>(".prose-desc a")];
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
};
