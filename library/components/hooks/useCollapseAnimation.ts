import { useLayoutEffect, useRef, useState } from "react";

const REVEAL_DURATION_MS = 180;
const COLLAPSE_DURATION_MS = 140;
const FLIP_DURATION_MS = 180;
const HEIGHT_DURATION_MS = 200;
const HEIGHT_OPACITY_DURATION_MS = 160;

type PendingFlip = "mount" | "unmount" | null;
type CollapseAnimationMode = "flip" | "integer-height";

type CollapseAnimationOptions = {
  animateOnMount?: boolean;
  mode?: CollapseAnimationMode;
};

function easeOutCubic(progress: number): number {
  return 1 - Math.pow(1 - progress, 3);
}

function animateIntegerHeight(
  element: HTMLElement,
  from: number,
  to: number,
  duration: number,
  onFinish: () => void,
): () => void {
  let frame = 0;
  let cancelled = false;
  let lastHeight = Math.round(from);
  const startedAt = performance.now();

  element.style.height = `${lastHeight}px`;
  element.style.overflow = "hidden";
  element.style.willChange = "height";

  const tick = (now: number) => {
    if (cancelled) return;
    const progress = Math.min(1, (now - startedAt) / duration);
    const nextHeight = Math.round(from + (to - from) * easeOutCubic(progress));
    if (nextHeight !== lastHeight) {
      lastHeight = nextHeight;
      element.style.height = `${nextHeight}px`;
    }
    if (progress >= 1) {
      onFinish();
      return;
    }
    frame = requestAnimationFrame(tick);
  };

  frame = requestAnimationFrame(tick);
  return () => {
    cancelled = true;
    cancelAnimationFrame(frame);
  };
}

/**
 * Lazy rendering with two mutually exclusive animation strategies.
 *
 * `flip` changes layout once, then animates transform + clip-path + opacity.
 * `integer-height` measures once and writes only rounded pixel heights per frame.
 */
export function useCollapseAnimation(expanded: boolean, options: CollapseAnimationOptions = {}) {
  const { animateOnMount = true, mode = "flip" } = options;
  const layoutRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(false);
  const expansionStartsCollapsedRef = useRef(false);
  const previousRectRef = useRef<DOMRect | null>(null);
  const pendingFlipRef = useRef<PendingFlip>(null);
  const layoutAnimationRef = useRef<Animation | null>(null);
  const contentAnimationRef = useRef<Animation | null>(null);
  const heightAnimationCancelRef = useRef<(() => void) | null>(null);
  const opacityFrameRef = useRef(0);
  const [shouldRender, setShouldRender] = useState(expanded);

  const captureLayout = () => {
    previousRectRef.current = layoutRef.current?.getBoundingClientRect() ?? null;
  };

  useLayoutEffect(() => {
    contentAnimationRef.current?.cancel();
    contentAnimationRef.current = null;
    heightAnimationCancelRef.current?.();
    heightAnimationCancelRef.current = null;
    cancelAnimationFrame(opacityFrameRef.current);

    if (expanded) {
      if (!shouldRender) {
        expansionStartsCollapsedRef.current = true;
        if (mode === "flip") {
          captureLayout();
          pendingFlipRef.current = "mount";
        }
        setShouldRender(true);
      }
      return;
    }

    const content = contentRef.current;
    if (!content || !shouldRender) {
      if (shouldRender) {
        if (mode === "flip") {
          captureLayout();
          pendingFlipRef.current = "unmount";
        }
        setShouldRender(false);
      }
      return;
    }

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      if (mode === "flip") {
        captureLayout();
        pendingFlipRef.current = "unmount";
      }
      setShouldRender(false);
    };

    if (mode === "integer-height") {
      const from = Math.round(content.getBoundingClientRect().height);
      content.style.transition = `opacity ${HEIGHT_OPACITY_DURATION_MS}ms ease-out`;
      content.style.opacity = "0";
      const cancel = animateIntegerHeight(content, from, 0, HEIGHT_DURATION_MS, finish);
      heightAnimationCancelRef.current = cancel;
      return () => cancel();
    }

    const animation = content.animate(
      [
        { clipPath: "inset(0 0 0 0)", opacity: 1 },
        { clipPath: "inset(0 0 100% 0)", opacity: 0 },
      ],
      { duration: COLLAPSE_DURATION_MS, easing: "ease-out", fill: "forwards" },
    );
    contentAnimationRef.current = animation;
    animation.addEventListener("finish", finish, { once: true });
    const timer = window.setTimeout(finish, COLLAPSE_DURATION_MS + 50);

    return () => {
      window.clearTimeout(timer);
      animation.cancel();
    };
  }, [expanded, shouldRender, mode]);

  useLayoutEffect(() => {
    if (mode !== "flip") return;
    const pendingFlip = pendingFlipRef.current;
    const layoutChanged =
      (pendingFlip === "mount" && shouldRender) ||
      (pendingFlip === "unmount" && !shouldRender);
    if (!layoutChanged) return;

    pendingFlipRef.current = null;
    const previousRect = previousRectRef.current;
    previousRectRef.current = null;
    const layout = layoutRef.current;
    if (!previousRect || !layout) return;

    const nextRect = layout.getBoundingClientRect();
    const deltaX = previousRect.left - nextRect.left;
    const deltaY = previousRect.top - nextRect.top;
    if (Math.abs(deltaX) < 0.01 && Math.abs(deltaY) < 0.01) return;

    layoutAnimationRef.current?.cancel();
    layoutAnimationRef.current = layout.animate(
      [
        { transform: `translate(${deltaX}px, ${deltaY}px)` },
        { transform: "translate(0, 0)" },
      ],
      { duration: FLIP_DURATION_MS, easing: "ease-out" },
    );
  }, [shouldRender, mode]);

  useLayoutEffect(() => {
    const isInitialExpandedMount = !mountedRef.current && expanded;
    mountedRef.current = true;
    if (!shouldRender || !expanded) return;
    const content = contentRef.current;
    if (!content) return;

    if (isInitialExpandedMount && !animateOnMount) {
      content.style.height = "";
      content.style.overflow = "";
      content.style.willChange = "";
      content.style.opacity = "";
      content.style.transition = "";
      return;
    }

    if (mode === "integer-height") {
      const from = expansionStartsCollapsedRef.current
        ? 0
        : Math.round(content.getBoundingClientRect().height);
      expansionStartsCollapsedRef.current = false;
      const to = Math.round(content.scrollHeight);

      content.style.opacity = "0";
      content.style.transition = "none";
      opacityFrameRef.current = requestAnimationFrame(() => {
        content.style.transition = `opacity ${HEIGHT_OPACITY_DURATION_MS}ms ease-out`;
        content.style.opacity = "1";
      });

      const finish = () => {
        content.style.height = "";
        content.style.overflow = "";
        content.style.willChange = "";
        content.style.opacity = "";
        content.style.transition = "";
        heightAnimationCancelRef.current = null;
      };
      const cancel = animateIntegerHeight(content, from, to, HEIGHT_DURATION_MS, finish);
      heightAnimationCancelRef.current = cancel;
      return () => cancel();
    }

    contentAnimationRef.current?.cancel();
    const animation = content.animate(
      [
        { clipPath: "inset(0 0 100% 0)", opacity: 0 },
        { clipPath: "inset(0 0 0 0)", opacity: 1 },
      ],
      { duration: REVEAL_DURATION_MS, easing: "ease-out" },
    );
    contentAnimationRef.current = animation;

    return () => animation.cancel();
  }, [shouldRender, expanded, animateOnMount, mode]);

  useLayoutEffect(
    () => () => {
      layoutAnimationRef.current?.cancel();
      contentAnimationRef.current?.cancel();
      heightAnimationCancelRef.current?.();
      cancelAnimationFrame(opacityFrameRef.current);
    },
    [],
  );

  return { layoutRef, contentRef, shouldRender };
}
