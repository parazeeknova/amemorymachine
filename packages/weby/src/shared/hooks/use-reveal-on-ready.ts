import { useLayoutEffect } from "react";
import type { RefObject } from "react";
import { gsap } from "gsap";

interface RevealOptions {
  duration?: number;
  stagger?: number;
  y?: number;
}

// useRevealOnReady fades a freshly-mounted block of content in from the same
// blurred, slightly-offset state the loading skeletons are drawn in. It runs
// in useLayoutEffect so GSAP applies the hidden "from" state before the
// browser paints — the skeleton hands off to the reveal with no flash.
export const useRevealOnReady = (
  isReady: boolean,
  ref: RefObject<HTMLElement | null>,
  options: RevealOptions = {},
): void => {
  const { duration = 0.65, stagger = 0.08, y = 16 } = options;

  useLayoutEffect(() => {
    if (!isReady) {
      return;
    }
    const el = ref.current;
    if (!el) {
      return;
    }
    const targets = [...el.children];
    if (targets.length === 0) {
      return;
    }

    gsap.killTweensOf(targets);
    gsap.fromTo(
      targets,
      {
        filter: "blur(12px)",
        opacity: 0,
        scale: 0.98,
        y,
      },
      {
        duration,
        ease: "power2.out",
        filter: "blur(0px)",
        opacity: 1,
        scale: 1,
        stagger,
        y: 0,
      },
    );
  }, [duration, isReady, ref, stagger, y]);
};
