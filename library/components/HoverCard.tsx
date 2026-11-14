import { cloneElement, isValidElement, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ReactElement, ReactNode } from "react";
import { createPortal } from "react-dom";

type HoverCardPlacement = "top" | "bottom" | "left" | "right";

interface HoverCardProps {
  children: ReactElement;
  content: ReactNode;
  placement?: HoverCardPlacement;
  /** Controlled visibility. Useful when list keyboard-active state should count as hover. */
  open?: boolean;
  delay?: number;
  disabled?: boolean;
  gap?: number;
  className?: string;
}

const OUT_DURATION = 120;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function choosePlacement(preferred: HoverCardPlacement, anchor: DOMRect, card: DOMRect, gap: number): HoverCardPlacement {
  const gutter = 8;
  if (preferred === "right" && anchor.right + gap + card.width > window.innerWidth - gutter) return "left";
  if (preferred === "left" && anchor.left - gap - card.width < gutter) return "right";
  if (preferred === "bottom" && anchor.bottom + gap + card.height > window.innerHeight - gutter) return "top";
  if (preferred === "top" && anchor.top - gap - card.height < gutter) return "bottom";
  return preferred;
}

function getPosition(placement: HoverCardPlacement, anchor: DOMRect, card: DOMRect, gap: number) {
  const actualPlacement = choosePlacement(placement, anchor, card, gap);
  let left = 0;
  let top = 0;

  switch (actualPlacement) {
    case "bottom":
      left = anchor.left + anchor.width / 2 - card.width / 2;
      top = anchor.bottom + gap;
      break;
    case "top":
      left = anchor.left + anchor.width / 2 - card.width / 2;
      top = anchor.top - card.height - gap;
      break;
    case "left":
      left = anchor.left - card.width - gap;
      top = anchor.top + anchor.height / 2 - card.height / 2;
      break;
    case "right":
      left = anchor.right + gap;
      top = anchor.top + anchor.height / 2 - card.height / 2;
      break;
  }

  const gutter = 8;
  return {
    placement: actualPlacement,
    left: clamp(left, gutter, window.innerWidth - card.width - gutter),
    top: clamp(top, gutter, window.innerHeight - card.height - gutter),
  };
}

export function HoverCard({
  children,
  content,
  placement = "right",
  open: controlledOpen,
  delay = 240,
  disabled = false,
  gap = 8,
  className,
}: HoverCardProps) {
  const triggerRef = useRef<HTMLElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [hoverOpen, setHoverOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [position, setPosition] = useState<{ left: number; top: number; placement: HoverCardPlacement } | null>(null);
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const visible = !disabled && !!content && (controlledOpen ?? hoverOpen);

  // Mirrors controlledOpen in a ref so the delayed setTimeout callback below
  // can re-check the *latest* value instead of the one captured when the
  // timer was scheduled. Without this, a real mouseenter that fires while
  // controlledOpen is still undefined (e.g. the same tick a sibling row's
  // keyboard-driven "open" prop hasn't landed yet) schedules a delayed open
  // that later fires after the caller switched this row back to controlled —
  // popping the card back up as a stale ghost alongside the newly focused row.
  const controlledOpenRef = useRef(controlledOpen);
  controlledOpenRef.current = controlledOpen;

  const open = () => {
    if (disabled || !content || controlledOpen !== undefined) return;
    if (openTimerRef.current) clearTimeout(openTimerRef.current);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    openTimerRef.current = setTimeout(() => {
      if (controlledOpenRef.current !== undefined) return;
      setIsClosing(false);
      setHoverOpen(true);
    }, delay);
  };

  const close = () => {
    if (openTimerRef.current) {
      clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
    if (controlledOpen !== undefined) return;
    if (!hoverOpen) return;
    setIsClosing(true);
    closeTimerRef.current = setTimeout(() => {
      setIsClosing(false);
      setHoverOpen(false);
      setPosition(null);
    }, OUT_DURATION);
  };

  useEffect(() => {
    if (controlledOpen) setIsClosing(false);
    if (!controlledOpen && controlledOpen !== undefined) setPosition(null);
  }, [controlledOpen]);

  useEffect(() => {
    return () => {
      if (openTimerRef.current) clearTimeout(openTimerRef.current);
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  useLayoutEffect(() => {
    if (!visible || isClosing) return;

    const update = () => {
      const trigger = triggerRef.current;
      const card = cardRef.current;
      if (!trigger || !card) return;
      setPosition(getPosition(placement, trigger.getBoundingClientRect(), card.getBoundingClientRect(), gap));
    };

    update();
    // The trigger may still be moving into place when the card first mounts
    // (e.g. inside a popover/submenu that positions itself in its own layout
    // effect, which runs after this child's). Re-measure on the next frame and
    // whenever either box changes. Watching the card itself is important for
    // async content such as quota data: its loading placeholder is narrower,
    // and keeping that stale width would let a left-side card grow rightward.
    const raf = requestAnimationFrame(update);
    const trigger = triggerRef.current;
    const observedCard = cardRef.current;
    const observer = typeof ResizeObserver !== "undefined"
      ? new ResizeObserver(update)
      : null;
    if (observer) {
      if (trigger) observer.observe(trigger);
      if (observedCard) observer.observe(observedCard);
    }
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      cancelAnimationFrame(raf);
      observer?.disconnect();
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [visible, isClosing, placement, gap]);

  const trigger = isValidElement(children)
    ? cloneElement(children as React.ReactElement<any>, {
        ref: (node: HTMLElement | null) => {
          triggerRef.current = node;
          const origRef = (children.props as Record<string, unknown>).ref as React.Ref<HTMLElement> | undefined;
          if (typeof origRef === "function") origRef(node);
          else if (origRef && "current" in origRef) {
            (origRef as React.MutableRefObject<HTMLElement | null>).current = node;
          }
        },
        onMouseEnter: (e: React.MouseEvent) => {
          open();
          (children.props as any).onMouseEnter?.(e);
        },
        onMouseLeave: (e: React.MouseEvent) => {
          close();
          (children.props as any).onMouseLeave?.(e);
        },
        onFocus: (e: React.FocusEvent) => {
          open();
          (children.props as any).onFocus?.(e);
        },
        onBlur: (e: React.FocusEvent) => {
          close();
          (children.props as any).onBlur?.(e);
        },
      } as any)
    : children;

  return (
    <>
      {trigger}
      {visible
        ? createPortal(
            <div
              ref={cardRef}
              className={`hoverCard hoverCard--${position?.placement ?? placement} ${isClosing ? "hoverCard--out" : "hoverCard--in"} ${className ?? ""}`}
              style={{
                position: "fixed",
                left: position?.left ?? -10000,
                top: position?.top ?? -10000,
                visibility: position ? "visible" : "hidden",
                pointerEvents: "none",
                zIndex: 9999,
              }}
            >
              <div className="hoverCard__content">{content}</div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
