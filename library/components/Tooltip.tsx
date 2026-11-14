import { useEffect, useLayoutEffect, useRef, useState, cloneElement, isValidElement } from "react";
import type { ReactElement, ReactNode } from "react";
import { createPortal } from "react-dom";
import { isAnyMenuOpen, subscribeMenuState } from "./menuState";

type TooltipPlacement = "top" | "bottom" | "left" | "right";
/** Horizontal alignment against the trigger for top/bottom placements.
 *  "center" (default) centers the bubble; "start" pins its left edge to the
 *  trigger's left edge; "end" pins its right edge to the trigger's right edge. */
type TooltipAlign = "center" | "start" | "end";

interface TooltipProps {
  /** Trigger element. Optional in controlled mode (drive with `open`+`anchorRect`). */
  children?: ReactElement;
  content: ReactNode;
  placement?: TooltipPlacement;
  /** Horizontal alignment for top/bottom placements. Default "center". */
  align?: TooltipAlign;
  delay?: number;
  disabled?: boolean;
  /** Keep the tooltip open when its trigger is clicked; outside clicks still close it. */
  dismissOnTriggerClick?: boolean;
  /** Gap between trigger and tooltip (px). */
  gap?: number;
  /** Controlled visibility. When provided, hover handling is bypassed — useful
   *  for imperative anchors (e.g. raw DOM nodes inside a contentEditable). */
  open?: boolean;
  /** Virtual anchor rect for controlled mode when there is no child trigger. */
  anchorRect?: DOMRect | null;
  /** Extra class names applied to the tooltip bubble, for one-off style overrides. */
  className?: string;
}

const TOOLTIP_OUT_DURATION = 150;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function alignedLeft(align: TooltipAlign, anchor: DOMRect, tooltipRect: DOMRect) {
  if (align === "start") return anchor.left;
  if (align === "end") return anchor.right - tooltipRect.width;
  return anchor.left + anchor.width / 2 - tooltipRect.width / 2;
}

function getPosition(
  placement: TooltipPlacement,
  anchor: DOMRect,
  tooltipRect: DOMRect,
  gap: number,
  align: TooltipAlign
) {
  let left = 0;
  let top = 0;

  switch (placement) {
    case "bottom": {
      left = alignedLeft(align, anchor, tooltipRect);
      top = anchor.bottom + gap;
      break;
    }
    case "top": {
      left = alignedLeft(align, anchor, tooltipRect);
      top = anchor.top - tooltipRect.height - gap;
      break;
    }
    case "left": {
      left = anchor.left - tooltipRect.width - gap;
      top = anchor.top + anchor.height / 2 - tooltipRect.height / 2;
      break;
    }
    case "right": {
      left = anchor.right + gap;
      top = anchor.top + anchor.height / 2 - tooltipRect.height / 2;
      break;
    }
  }

  const gutter = 8;
  return {
    left: clamp(left, gutter, window.innerWidth - tooltipRect.width - gutter),
    top: clamp(top, gutter, window.innerHeight - tooltipRect.height - gutter),
  };
}

export function Tooltip({
  children,
  content,
  placement = "bottom",
  align = "center",
  delay = 300,
  disabled = false,
  dismissOnTriggerClick = true,
  gap = 6,
  open: controlledOpen,
  anchorRect,
  className,
}: TooltipProps) {
  const isControlled = controlledOpen !== undefined;
  const triggerRef = useRef<HTMLElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [hoverVisible, setHoverVisible] = useState(false);
  const setVisible = setHoverVisible;
  const [isClosing, setIsClosing] = useState(false);
  const [position, setPosition] = useState<{ left: number; top: number } | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suppressOpenRef = useRef(false);
  const visible = !disabled && !!content && (isControlled ? !!controlledOpen : hoverVisible);

  // A trigger can stop needing its tooltip while hovered (e.g. text no longer
  // overflows after a resize). Cancel pending opens and discard stale hover state.
  useEffect(() => {
    if (!disabled && content) return;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setHoverVisible(false);
    setIsClosing(false);
    setPosition(null);
  }, [disabled, content]);

  // Close tooltip (and block future opens) while any menu is visible.
  useEffect(() => {
    return subscribeMenuState(() => {
      if (isAnyMenuOpen()) {
        // Cancel pending open and close if already visible.
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
        suppressOpenRef.current = true;
        setIsClosing(true);
        closeTimerRef.current = setTimeout(() => {
          setIsClosing(false);
          setVisible(false);
          setPosition(null);
        }, TOOLTIP_OUT_DURATION);
      } else {
        // All menus closed — lift suppression after a short guard so the
        // trigger's own pointerdown handler has had time to run first.
        setTimeout(() => {
          suppressOpenRef.current = false;
        }, 200);
      }
    });
  }, []);

  const open = () => {
    if (disabled || !content) return;
    if (suppressOpenRef.current) return;
    if (isAnyMenuOpen()) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setIsClosing(false);
      setVisible(true);
    }, delay);
  };

  const close = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (visible) {
      setIsClosing(true);
      closeTimerRef.current = setTimeout(() => {
        setIsClosing(false);
        setVisible(false);
        setPosition(null);
      }, TOOLTIP_OUT_DURATION);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  useLayoutEffect(() => {
    if (!visible || isClosing) {
      if (!visible) setPosition(null);
      return;
    }

    const updatePosition = () => {
      const tooltip = tooltipRef.current;
      if (!tooltip) return;
      // Prefer the real trigger element; fall back to the virtual anchor rect
      // (controlled mode for imperative anchors with no child trigger).
      const anchor = triggerRef.current?.getBoundingClientRect() ?? anchorRect;
      if (!anchor) return;
      const tooltipRect = tooltip.getBoundingClientRect();
      setPosition(getPosition(placement, anchor, tooltipRect, gap, align));
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [visible, isClosing, placement, align, gap, anchorRect]);

  // Close on scroll / resize to avoid drift
  useEffect(() => {
    if (!visible) return;
    const handleScroll = () => close();
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleScroll);
    };
  }, [visible]);

  // Close on outside clicks; some informational triggers remain hover-only on click.
  useEffect(() => {
    if (!visible) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!dismissOnTriggerClick && triggerRef.current?.contains(event.target as Node)) return;
      suppressOpenRef.current = true;
      close();
      setTimeout(() => {
        suppressOpenRef.current = false;
      }, 500);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [visible, dismissOnTriggerClick]);

  const trigger = isValidElement(children)
    ? cloneElement(
        children as React.ReactElement<any>,
        {
          ref: (node: HTMLElement | null) => {
            triggerRef.current = node;
            // React 19: ref is a regular prop on props.ref
            const origRef = (children.props as Record<string, unknown>).ref as
              React.Ref<HTMLElement> | undefined;
            if (typeof origRef === "function") {
              origRef(node);
            } else if (origRef && "current" in origRef) {
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
            // 只响应键盘导航产生的可见焦点。鼠标点击按钮打开独立窗口后，
            // 关闭窗口会把 focus 还给原按钮；这种焦点恢复不应弹出 tooltip。
            if (e.currentTarget.matches(":focus-visible")) {
              open();
            } else if (dismissOnTriggerClick) {
              close();
            }
            (children.props as any).onFocus?.(e);
          },
          onBlur: (e: React.FocusEvent) => {
            close();
            (children.props as any).onBlur?.(e);
          },
        } as any,
      )
    : children;

  const hasArrow = placement === "left" || placement === "right";

  return (
    <>
      {trigger}
      {visible &&
        createPortal(
          <div
            ref={tooltipRef}
            className={`tooltip ${hasArrow ? `tooltip--arrow tooltip--${placement}` : ""} ${isClosing ? "tooltip--out" : "tooltip--in"} ${className ?? ""}`}
            style={{
              position: "fixed",
              left: position?.left ?? 0,
              top: position?.top ?? 0,
              visibility: position ? "visible" : "hidden",
              pointerEvents: "none",
              zIndex: 9999,
            }}
          >
            <div className="tooltip__content">{content}</div>
          </div>,
          document.body
        )}
    </>
  );
}
