import { cloneElement, isValidElement, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ReactElement, ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  HOVER_CARD_CONTENT_CLASS,
  HOVER_CARD_OUT_DURATION,
  hoverCardClassName,
  hoverCardPosition,
} from "../styles/classes";
import type { HoverCardPlacement } from "../styles/classes";

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
    }, HOVER_CARD_OUT_DURATION);
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
      setPosition(hoverCardPosition(placement, trigger.getBoundingClientRect(), card.getBoundingClientRect(), gap));
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
              className={hoverCardClassName({ placement: position?.placement ?? placement, closing: isClosing, className: className ?? "" })}
              style={{
                position: "fixed",
                left: position?.left ?? -10000,
                top: position?.top ?? -10000,
                visibility: position ? "visible" : "hidden",
                pointerEvents: "none",
                zIndex: 9999,
              }}
            >
              <div className={HOVER_CARD_CONTENT_CLASS}>{content}</div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
