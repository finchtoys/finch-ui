import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  LoaderCircle,
  OctagonX,
} from "lucide-react";
import { Button } from "./Button";
import { GlassFilterDef, TOAST_GLASS_BASE, useLiquidGlassInstance } from "./LiquidGlassFilter";
import type { GlassTarget } from "./LiquidGlassFilter";

export type ToastVariant = "default" | "success" | "info" | "warning" | "error" | "promise";
export type ToastPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

type ToastPhase = "entering" | "visible" | "exiting";

export interface ToastItem {
  id: string;
  variant?: ToastVariant;
  title: ReactNode;
  description?: ReactNode;
  duration?: number;
  phase?: ToastPhase;
  position?: ToastPosition;
  action?: ToastAction;
}

export interface ToastAction {
  label: string;
  onClick?: () => void;
}

export interface ToastOptions extends Omit<ToastItem, "id" | "phase"> {
  id?: string;
}

export interface ToastViewportProps {
  toasts: ToastItem[];
  position?: ToastPosition;
  maxVisible?: number;
  onDismiss: (id: string) => void;
  className?: string;
}

export interface ToastApi {
  toasts: ToastItem[];
  push: (toast: ToastOptions) => string;
  dismiss: (id: string) => void;
  clear: () => void;
}

const DEFAULT_DURATION = 3000;
const DEFAULT_POSITION: ToastPosition = "top-center";
const MAX_VISIBLE_TOASTS = 3;
const ANIMATION_MS = 500;
const TOAST_HEIGHT_FALLBACK = 74;
const TOAST_TITLE_ONLY_HEIGHT_FALLBACK = 54;
const ENTER_OFFSET = 64;
const STACK_OFFSET = 13;
const EXPANDED_GAP = 16;

let toastSeed = 0;

const positionClass: Record<ToastPosition, string> = {
  "top-left": `left-5 top-[44px] `,
  "top-center": `left-1/2 top-[44px] -translate-x-1/2`,
  "top-right": `right-5 top-[44px] `,
  "bottom-left": `bottom-5 left-5`,
  "bottom-center": `bottom-5 left-1/2 -translate-x-1/2`,
  "bottom-right": `bottom-5 right-5`,
};

const alignClass: Record<ToastPosition, string> = {
  "top-left": "items-start",
  "top-center": "items-center",
  "top-right": "items-end",
  "bottom-left": "items-start",
  "bottom-center": "items-center",
  "bottom-right": "items-end",
};

const toneClass: Record<ToastVariant, string> = {
  default: "text-txt-secondary",
  success: "text-[var(--ui-positive)]",
  info: "text-[var(--ui-info)]",
  warning: "text-[var(--ui-warning)]",
  error: "text-[var(--ui-danger)]",
  promise: "text-[var(--ui-accent)]",
};

function toastIcon(variant: ToastVariant) {
  const props = { size: 18, strokeWidth: 1.9, className: "block flex-none" };
  if (variant === "success") return <CheckCircle2 {...props} />;
  if (variant === "info") return <Info {...props} />;
  if (variant === "warning") return <AlertTriangle {...props} />;
  if (variant === "error") return <OctagonX {...props} />;
  if (variant === "promise") return <LoaderCircle {...props} className="mt-0.5 flex-none animate-spin" />;
  return <Info {...props} />;
}

function isBottomPosition(position: ToastPosition) {
  return position.startsWith("bottom");
}

function visibleKey(item: ToastItem) {
  return item.phase !== "exiting";
}

function getToastPosition(item: ToastItem) {
  return item.position ?? DEFAULT_POSITION;
}

export function useToastApi(maxVisible = MAX_VISIBLE_TOASTS): ToastApi {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const exitTimersRef = useRef<Map<string, number>>(new Map());
  const enterTimersRef = useRef<Map<string, number>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts((items) => items.map((item) => item.id === id ? { ...item, phase: "exiting" } : item));
    const existing = exitTimersRef.current.get(id);
    if (existing) window.clearTimeout(existing);
    const timeout = window.setTimeout(() => {
      exitTimersRef.current.delete(id);
      setToasts((items) => items.filter((item) => item.id !== id));
    }, ANIMATION_MS);
    exitTimersRef.current.set(id, timeout);
  }, []);

  const clear = useCallback(() => {
    for (const timeout of exitTimersRef.current.values()) window.clearTimeout(timeout);
    for (const timeout of enterTimersRef.current.values()) window.clearTimeout(timeout);
    exitTimersRef.current.clear();
    enterTimersRef.current.clear();
    setToasts([]);
  }, []);

  const push = useCallback((toast: ToastOptions) => {
    const id = toast.id ?? `toast-${Date.now()}-${toastSeed++}`;
    const position = toast.position ?? DEFAULT_POSITION;
    const item: ToastItem = {
      ...toast,
      id,
      position,
      duration: toast.duration ?? DEFAULT_DURATION,
      phase: "entering",
    };

    setToasts((items) => {
      const deduped = items.filter((existing) => existing.id !== id);
      const visibleItems = deduped.filter((existing) => visibleKey(existing) && getToastPosition(existing) === position);
      const overflowCount = Math.max(0, visibleItems.length + 1 - maxVisible);
      const overflowIds = new Set(visibleItems.slice(0, overflowCount).map((existing) => existing.id));
      return [
        ...deduped.map((existing) => overflowIds.has(existing.id) ? { ...existing, phase: "exiting" as const } : existing),
        item,
      ];
    });

    for (const timeout of exitTimersRef.current.values()) window.clearTimeout(timeout);
    exitTimersRef.current.clear();
    window.setTimeout(() => {
      setToasts((items) => items.filter((existing) => existing.phase !== "exiting"));
    }, ANIMATION_MS);

    const enterTimeout = window.setTimeout(() => {
      enterTimersRef.current.delete(id);
      setToasts((items) => items.map((existing) => existing.id === id ? { ...existing, phase: "visible" } : existing));
    }, 16);
    enterTimersRef.current.set(id, enterTimeout);

    return id;
  }, [maxVisible]);

  useEffect(() => () => clear(), [clear]);

  return useMemo(() => ({ toasts, push, dismiss, clear }), [toasts, push, dismiss, clear]);
}

/**
 * Global toast bridge. The app-level `ToastViewport` owner registers its
 * controller here so deeply nested components can surface toasts without
 * threading the controller through props or context.
 */
let activeToastApi: ToastApi | null = null;

export function registerToastApi(controller: ToastApi | null): void {
  activeToastApi = controller;
}

export const toast = {
  push(options: ToastOptions): string {
    if (!activeToastApi) {
      if (typeof console !== "undefined") console.warn("[toast] no controller registered; dropping toast", options);
      return "";
    }
    return activeToastApi.push(options);
  },
  dismiss(id: string): void {
    activeToastApi?.dismiss(id);
  },
};

interface ToastCardProps {
  toast: ToastItem;
  index: number;
  stack: ToastItem[];
  heights: Record<string, number>;
  expanded: boolean;
  bottom: boolean;
  onMeasured: (id: string, height: number) => void;
}

function getToastHeight(toast: ToastItem | undefined, heights: Record<string, number>) {
  if (!toast) return TOAST_TITLE_ONLY_HEIGHT_FALLBACK;
  return heights[toast.id] ?? (toast.description ? TOAST_HEIGHT_FALLBACK : TOAST_TITLE_ONLY_HEIGHT_FALLBACK);
}

function getExpandedOffset(toasts: ToastItem[], index: number, heights: Record<string, number>) {
  return toasts.slice(0, index).reduce((sum, toast) => sum + getToastHeight(toast, heights) + EXPANDED_GAP, 0);
}

function getToastStyle(stack: ToastItem[], heights: Record<string, number>, index: number, phase: ToastPhase, expanded: boolean, bottom: boolean): CSSProperties {
  const entering = phase === "entering";
  const exiting = phase === "exiting";
  const enterY = bottom ? ENTER_OFFSET : -ENTER_OFFSET;
  const expandedY = getExpandedOffset(stack, index, heights) * (bottom ? -1 : 1);
  const stackedY = index * STACK_OFFSET * (bottom ? -1 : 1);
  const y = entering ? enterY : expanded ? expandedY : stackedY;
  const scale = entering || expanded ? 1 : 1 - index * 0.045;
  const collapsedHeight = getToastHeight(stack.find((item) => item.phase !== "exiting") ?? stack[0], heights);

  return {
    height: expanded ? getToastHeight(stack[index], heights) : collapsedHeight,
    opacity: entering || exiting ? 0 : 1,
    transform: `translate3d(0, ${y}px, 0) scale(${scale})`,
    zIndex: 40 - index,
    filter: expanded || index === 0 ? "none" : "saturate(0.96) brightness(0.98)",
    pointerEvents: exiting ? "none" : "auto",
  };
}

// Toast 可能同时堆叠好几个、彼此高度不同，不能像 Composer/返回底部按钮那样
// 共用一份位移图——否则除了被追踪的那个，其余会顶着错误尺寸被拉伸/错位
// （见 LiquidGlassFilter.tsx 顶部说明）。这里每个 ToastCard 实例按自己的
// toast.id 派生唯一 filter/map id，各自独立同步。
function toastGlassTarget(id: string): GlassTarget {
  return {
    ...TOAST_GLASS_BASE,
    filterId: `finch-liquid-glass-toast-${id}`,
    mapId: `finch-liquid-glass-toast-${id}-map`,
  };
}

function ToastCard({ toast, index, stack, heights, expanded, bottom, onMeasured }: ToastCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const measuredRef = useRef<HTMLDivElement>(null);
  const variant = toast.variant ?? "default";
  const tone = toneClass[variant];
  const hasIcon = variant !== "default";
  const hasDescription = Boolean(toast.description);
  const hideContent = !expanded && index > 0;
  const glassTarget = useMemo(() => toastGlassTarget(toast.id), [toast.id]);

  // 挂载即同步一份专属位移图（不等轮询），尺寸变化（比如 expanded 展开、
  // 描述文字换行撑高卡片）时防抖跟随重建，见 useLiquidGlassInstance 说明。
  useLiquidGlassInstance(glassTarget, cardRef);

  useEffect(() => {
    const node = measuredRef.current;
    if (!node) return undefined;
    const report = () => onMeasured(toast.id, Math.ceil(node.getBoundingClientRect().height));
    report();
    const observer = new ResizeObserver(report);
    observer.observe(node);
    return () => observer.disconnect();
  }, [onMeasured, toast.id]);

  return (
    <div
      ref={cardRef}
      role={variant === "error" ? "alert" : "status"}
      className={[
        "toastCard",
        "pointer-events-auto absolute left-0 min-h-[46px] w-[min(420px,calc(100vw-40px))] overflow-hidden",
        bottom ? "bottom-0" : "top-0",
        "rounded-[var(--ui-radius-md)] border border-border bg-[color-mix(in_srgb,var(--ui-bg-main)_80%,transparent)]",
        "shadow-[0_1px_12px_rgba(0,0,0,0.08)] backdrop-blur-2xl",
        "transition-[opacity,transform,filter] duration-500 ease-out will-change-transform",
      ].join(" ")}
      style={{
        ...getToastStyle(stack, heights, index, toast.phase ?? "visible", expanded, bottom),
        // 液态玻璃开启时用到的 backdrop-filter 值，绑在这个实例自己的 filter
        // id 上；CSS 里只在 :root[data-liquid-glass="true"] 时读取这个变量
        // （见 styles.css .toastCard 规则），关闭时这个变量单纯不生效。
        ["--toast-liquid-glass-backdrop" as string]: `url(#${glassTarget.filterId}) blur(4px) saturate(1.05)`,
      } as CSSProperties}
    >
      <svg
        aria-hidden="true"
        focusable="false"
        width="0"
        height="0"
        style={{ position: "absolute", overflow: "hidden", pointerEvents: "none" }}
      >
        <defs>
          <GlassFilterDef target={glassTarget} />
        </defs>
      </svg>
      <div
        ref={measuredRef}
        className={[
          "absolute inset-x-0 top-0 flex w-full gap-3 transition-opacity duration-150",
          hasDescription ? "items-start px-4 py-3.5" : "items-center px-4 py-3.5",
          hideContent ? "opacity-0" : "opacity-100",
        ].join(" ")}
      >
      {hasIcon ? <div className={`${tone} grid h-[18px] w-[18px] flex-none place-items-center ${hasDescription ? "mt-[1px]" : ""}`}>{toastIcon(variant)}</div> : null}
      <div className={`min-w-0 flex-1 ${hasDescription ? "pt-0.5" : ""}`}>
        <div className="text-[13px] font-medium leading-snug text-txt">{toast.title}</div>
        {toast.description ? (
          <div className="mt-1 text-[13px] leading-relaxed text-txt-secondary font-normal">{toast.description}</div>
        ) : null}
      </div>
      {toast.action ? (
        <Button
          variant="secondary"
          size="sm"
          round="sm"
          className="ml-2 flex-none self-center"
          onClick={(event) => {
            event.stopPropagation();
            toast.action?.onClick?.();
          }}
        >
          {toast.action.label}
        </Button>
      ) : null}
      </div>
    </div>
  );
}

interface ToastStackProps {
  toasts: ToastItem[];
  position: ToastPosition;
  maxVisible: number;
  onDismiss: (id: string) => void;
  className?: string;
}

function ToastStack({ toasts, position, maxVisible, onDismiss, className = "" }: ToastStackProps) {
  const [expanded, setExpanded] = useState(false);
  const [heights, setHeights] = useState<Record<string, number>>({});
  const timeoutsRef = useRef<Map<string, number>>(new Map());
  const orderedToasts = toasts.slice(-maxVisible - 1).reverse();
  const visibleCount = Math.min(maxVisible, orderedToasts.filter((toast) => toast.phase !== "exiting").length);
  const bottom = isBottomPosition(position);
  const visibleToasts = orderedToasts.filter((toast) => toast.phase !== "exiting").slice(0, visibleCount);
  const collapsedHeight = getToastHeight(visibleToasts[0] ?? orderedToasts[0], heights);
  const containerHeight = expanded && visibleCount > 1
    ? visibleToasts.reduce((sum, toast) => sum + getToastHeight(toast, heights), 0) + (visibleCount - 1) * EXPANDED_GAP
    : collapsedHeight + Math.max(0, visibleCount - 1) * STACK_OFFSET;
  const handleMeasured = useCallback((id: string, height: number) => {
    setHeights((current) => current[id] === height ? current : { ...current, [id]: height });
  }, []);

  useEffect(() => {
    for (const timeout of timeoutsRef.current.values()) window.clearTimeout(timeout);
    timeoutsRef.current.clear();

    if (expanded) return undefined;

    toasts.forEach((toast) => {
      if (toast.phase === "exiting" || toast.duration === 0) return;
      const timeout = window.setTimeout(() => {
        onDismiss(toast.id);
      }, toast.duration ?? DEFAULT_DURATION);
      timeoutsRef.current.set(toast.id, timeout);
    });

    return () => {
      for (const timeout of timeoutsRef.current.values()) window.clearTimeout(timeout);
      timeoutsRef.current.clear();
    };
  }, [expanded, onDismiss, toasts]);

  if (orderedToasts.length === 0) return null;

  return (
    <div
      className={[
        "pointer-events-none fixed z-[9999] flex w-[min(420px,calc(100vw-40px))] flex-col transition-[height] duration-100 ease-out",
        positionClass[position],
        alignClass[position],
        className,
      ].filter(Boolean).join(" ")}
      style={{ height: containerHeight }}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <div className="pointer-events-auto relative h-full w-[min(420px,calc(100vw-40px))]">
        {orderedToasts.map((toast, index) => (
          <ToastCard
            key={toast.id}
            toast={toast}
            index={index}
            stack={orderedToasts}
            heights={heights}
            expanded={expanded && visibleCount > 1}
            bottom={bottom}
            onMeasured={handleMeasured}
          />
        ))}
      </div>
    </div>
  );
}

export function ToastViewport({
  toasts,
  position = DEFAULT_POSITION,
  maxVisible = MAX_VISIBLE_TOASTS,
  onDismiss,
  className = "",
}: ToastViewportProps) {
  const groupedToasts = useMemo(() => {
    const groups = new Map<ToastPosition, ToastItem[]>();
    toasts.forEach((toast) => {
      const toastPosition = toast.position ?? position;
      const group = groups.get(toastPosition) ?? [];
      group.push(toast);
      groups.set(toastPosition, group);
    });
    return Array.from(groups.entries());
  }, [position, toasts]);

  if (groupedToasts.length === 0) return null;

  return createPortal(
    <>
      {groupedToasts.map(([toastPosition, group]) => (
        <ToastStack
          key={toastPosition}
          toasts={group}
          position={toastPosition}
          maxVisible={maxVisible}
          onDismiss={onDismiss}
          className={className}
        />
      ))}
    </>,
    document.body,
  );
}
