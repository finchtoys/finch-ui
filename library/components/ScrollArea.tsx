import React, { useCallback, useEffect, useRef, useState } from "react";
import { scrollAreaClassName } from "../styles/classes";

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Scroll direction. Default: "vertical". */
  orientation?: "vertical" | "horizontal";
  /** Show fade mask at the top edge. Vertical only. Default: true */
  fadeTop?: boolean;
  /** Show fade mask at the bottom edge. Vertical only. Default: true */
  fadeBottom?: boolean;
  /** Height of the top fade in px. Vertical only. Default: 12 */
  topFadeSize?: number;
  /** Height of the bottom fade in px. Vertical only. Default: 16 */
  bottomFadeSize?: number;
  /** Show fade mask at the left edge. Horizontal only. Default: true */
  fadeLeft?: boolean;
  /** Show fade mask at the right edge. Horizontal only. Default: true */
  fadeRight?: boolean;
  /** Width of the left fade in px. Horizontal only. Default: 12 */
  leftFadeSize?: number;
  /** Width of the right fade in px. Horizontal only. Default: 16 */
  rightFadeSize?: number;
  children: React.ReactNode;
}

/**
 * ScrollArea — unified scrollable container with edge fade masks.
 *
 * Uses CSS `mask-image` (gradient) rather than overlay divs, so it works
 * with any background colour without needing to know it. The top/bottom
 * masks are hidden dynamically when the content is already scrolled to
 * that edge so you never see a fade over nothing.
 *
 * Drop-in replacement for `<div className="appScrollbar overflow-y-auto …">`.
 * Extra layout classes (flex, min-h-0, etc.) should be added via `className`.
 */
const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  (
    {
      orientation = "vertical",
      fadeTop = true,
      fadeBottom = true,
      topFadeSize = 12,
      bottomFadeSize = 16,
      fadeLeft = true,
      fadeRight = true,
      leftFadeSize = 12,
      rightFadeSize = 16,
      className = "",
      style,
      onScroll,
      children,
      ...rest
    },
    forwardedRef,
  ) => {
    const innerRef = useRef<HTMLDivElement>(null);

    // Merge the forwarded ref with our internal one.
    const setRef = useCallback(
      (node: HTMLDivElement | null) => {
        (innerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        if (typeof forwardedRef === "function") {
          forwardedRef(node);
        } else if (forwardedRef) {
          (forwardedRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }
      },
      [forwardedRef],
    );

    // `null` means "not yet measured" — we render without masks until first tick
    // so we don't flash a bottom fade on very short lists.
    const [atStart, setAtStart] = useState(true);
    const [atEnd, setAtEnd] = useState(false);

    const measure = useCallback(() => {
      const el = innerRef.current;
      if (!el) return;
      const scrollPosition = orientation === "horizontal" ? el.scrollLeft : el.scrollTop;
      const clientSize = orientation === "horizontal" ? el.clientWidth : el.clientHeight;
      const scrollSize = orientation === "horizontal" ? el.scrollWidth : el.scrollHeight;
      // Value-guarded setState: returning the previous state when nothing
      // changed avoids the ResizeObserver → setState → re-render loop.
      setAtStart((prev) => (prev === (scrollPosition <= 0) ? prev : scrollPosition <= 0));
      setAtEnd(
        (prev) =>
          prev === (scrollPosition + clientSize >= scrollSize - 1)
            ? prev
            : scrollPosition + clientSize >= scrollSize - 1,
      );
    }, [orientation]);

    useEffect(() => {
      measure();
      const el = innerRef.current;
      if (!el) return;
      const ro = new ResizeObserver(measure);
      ro.observe(el);
      return () => ro.disconnect();
      // Deliberately not depending on `children`: children is a fresh React
      // element reference on every render, which would disconnect/re-observe
      // the ResizeObserver each render and restart the measure→setState loop.
    }, [measure]);

    const handleScroll = useCallback(
      (e: React.UIEvent<HTMLDivElement>) => {
        measure();
        onScroll?.(e);
      },
      [measure, onScroll],
    );

    // Build the CSS mask-image value. The mask disappears at a reached edge.
    const isHorizontal = orientation === "horizontal";
    const showStart = (isHorizontal ? fadeLeft : fadeTop) && !atStart;
    const showEnd = (isHorizontal ? fadeRight : fadeBottom) && !atEnd;
    const startFadeSize = isHorizontal ? leftFadeSize : topFadeSize;
    const endFadeSize = isHorizontal ? rightFadeSize : bottomFadeSize;

    let maskImage: string | undefined;
    if (showStart || showEnd) {
      const startStart = showStart ? "transparent 0px" : "black 0px";
      const startEnd = showStart ? `black ${startFadeSize}px` : "black 0px";
      const endStart = showEnd ? `black calc(100% - ${endFadeSize}px)` : "black 100%";
      const endEnd = showEnd ? "transparent 100%" : "black 100%";
      const stops = [...new Set([startStart, startEnd, endStart, endEnd])].join(", ");
      maskImage = `linear-gradient(to ${isHorizontal ? "right" : "bottom"}, ${stops})`;
    }

    return (
      <div
        ref={setRef}
        className={scrollAreaClassName({ orientation, className })}
        style={maskImage ? { WebkitMaskImage: maskImage, maskImage, ...style } : style}
        onScroll={handleScroll}
        {...rest}
      >
        {children}
      </div>
    );
  },
);

ScrollArea.displayName = "ScrollArea";

export { ScrollArea };
export type { ScrollAreaProps };
