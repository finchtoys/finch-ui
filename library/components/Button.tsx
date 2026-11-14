import { forwardRef } from "react";
import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  KeyboardEventHandler,
  MouseEvent as ReactMouseEvent,
  MouseEventHandler,
  ReactNode,
  Ref,
} from "react";

export type ButtonVariant = "primary" | "brand" | "secondary" | "ghost" | "outline" | "danger" | "link";
export type ButtonSize = "sm" | "md" | "lg";
export type ButtonRound = "sm" | "md" | "lg" | "full";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Corner radius. Default: "sm". */
  round?: ButtonRound;

  // ── Text mode (has children) ─────────────────────────────────────────────
  children?: ReactNode;
  /** Icon placed before the label. */
  leadingIcon?: ReactNode;
  /** Icon placed after the label (e.g. dropdown chevron). */
  trailingIcon?: ReactNode;

  // ── Icon-only mode (icon prop → square compact button, no children) ──────
  /** When set, renders a square compact icon button. children are ignored. */
  icon?: ReactNode;
  /** Toggle / active state — persistent hover background + aria-pressed. */
  pressed?: boolean;
  /**
   * Rendered element. Defaults to a native `<button>`. Use `"span"` when the
   * button must live inside another interactive element (e.g. a menu row that
   * is itself a `<button>`), where nesting `<button>` is invalid HTML. In span
   * mode the element gets `role="button"`, keyboard activation, and maps
   * `disabled` to `aria-disabled` + pointer-events-none.
   */
  as?: "button" | "span";
}

// ─── Design language ──────────────────────────────────────────────────────────
//
//  Text mode (has children):
//    primary   Solid accent fill. No border. Main CTA.
//    brand     Solid brand-green fill. No border. High-emphasis CTA.
//    secondary Surface background. No border. Standard action.
//    ghost     Transparent. No border. Low-emphasis / toolbar.
//    outline   Transparent + visible border. Needs frame without fill.
//    danger    Danger-tint fill. No border. Destructive action.
//    link      No bg, no border. Text with hover underline + accent. Inline link.
//
//  Icon-only mode (has `icon`, no children):
//    Same variant names; ghost/secondary/outline/danger are the common ones.
//    All share a semi-transparent hover bg (lighter than text-mode hover).
//    primary/brand keep their solid fill (rare — e.g. round FAB).
//
// ─────────────────────────────────────────────────────────────────────────────

const BASE =
  "inline-flex items-center justify-center font-medium! select-none cursor-pointer " +
  // transition-colors 只覆盖 background-color/border-color/color，不含 opacity。
  // disabled:opacity-40 之前完全没有过渡，异步 loading/executing 结束后
  // opacity 100%→40%→100% 是瞬间跳变（没有 transition-opacity），在
  // ComposerAction 这类"点击后短暂 disabled 一下"的按钮上会显出一次生硬的
  // "闪一下"。这里用同一个 transition-property 列表同时覆盖颜色和 opacity，
  // 避免用两个互斥的 transition-* 工具类（谁生效取决于 Tailwind 生成顺序，不可靠）。
  "transition-[background-color,border-color,color,opacity] duration-120 " +
  "disabled:opacity-40 disabled:pointer-events-none";

// Shared semi-transparent hover/active bg for icon-only mode (feels lighter)
const ICON_BG =
  "hover:bg-[color-mix(in_srgb,var(--ui-bg-hover)_80%,transparent)] hover:brightness-95 dark:hover:brightness-135 " +
  "active:bg-[color-mix(in_srgb,var(--ui-bg-active)_80%,transparent)]";

const ICON_DANGER_BG =
  "hover:bg-[color-mix(in_srgb,var(--ui-danger-dim)_80%,transparent)] " +
  "active:bg-[color-mix(in_srgb,var(--ui-danger-dim)_80%,transparent)]";

// ── Text-mode variant styles ──────────────────────────────────────────────────
const TEXT_VARIANT: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-white " +
    "hover:bg-[color-mix(in_srgb,var(--ui-accent)_90%,transparent)] active:brightness-95",
  brand:
    "bg-accent text-white " +
    "hover:bg-[color-mix(in_srgb,var(--ui-accent)_90%,#666)] active:brightness-95",
  secondary:
    "bg-[color-mix(in_srgb,var(--ui-bg-inset)_30%,var(--ui-bg-hover)_70%)] text-[var(--ui-text-secondary)] " +
    "hover:bg-[var(--ui-bg-hover)] hover:text-[var(--ui-text-primary)] active:bg-[var(--ui-bg-active)]",
  ghost:
    "text-[var(--ui-text-secondary)] " +
    "hover:bg-[var(--ui-bg-hover)] hover:text-[var(--ui-text-primary)] active:bg-[var(--ui-bg-active)]",
  outline:
    "border border-[var(--ui-border-subtle)] text-[var(--ui-text-secondary)] " +
    "hover:bg-[var(--ui-bg-hover)] hover:text-[var(--ui-text-primary)] hover:border-[var(--ui-border-subtle)] " +
    "active:bg-[var(--ui-bg-active)]",
  danger:
    "bg-[var(--ui-danger-dim)] text-[var(--ui-danger-text)] " +
    "hover:bg-[color-mix(in_srgb,var(--ui-danger)_16%,transparent)] " +
    "active:bg-[color-mix(in_srgb,var(--ui-danger)_22%,transparent)]",
  link:
    "text-[var(--ui-text-secondary)] no-underline " +
    "hover:text-[var(--ui-text-secondary)] hover:underline hover:underline-offset-3 " +
    "active:text-[var(--ui-text-secondary)]",
};

// ── Icon-mode variant styles ──────────────────────────────────────────────────
const ICON_VARIANT: Record<ButtonVariant, string> = {
  // Solid fill (rare; same as text mode)
  primary:
    "bg-[var(--ui-accent)] text-[var(--ui-text-inverse)] " +
    "hover:bg-[var(--ui-bg-hover)] active:brightness-95",
  brand:
    "bg-[var(--ui-accent)] text-white " +
    "hover:brightness-105 active:brightness-95",
  // Text-color-only; shared semi-transparent hover bg
  secondary: "text-[var(--ui-text-secondary)] hover:text-[var(--ui-text-primary)] " + ICON_BG,
  ghost:     "text-[var(--ui-text-secondary)] hover:text-[var(--ui-text-primary)] " + ICON_BG,
  outline:
    "border border-[var(--ui-border-subtle)] text-[var(--ui-text-secondary)] hover:text-[var(--ui-text-primary)] " +
    ICON_BG,
  danger:    "text-[var(--ui-text-tertiary)] hover:text-[var(--ui-danger)] " + ICON_DANGER_BG,
  link:      "text-[var(--ui-text-secondary)] hover:text-[var(--ui-text-secondary)]",
};

// ── Size: text mode (rectangular) ────────────────────────────────────────────
const TEXT_SIZE: Record<ButtonSize, string> = {
  sm: "h-[21px] px-2 gap-1.5 text-[13px]",
  md: "h-[28px] px-4 gap-2 text-[14px]",
  lg: "h-[36px] px-5 gap-2.5 text-[14px]",
};

// ── Size: icon mode (square / compact) ───────────────────────────────────────
const ICON_SIZE: Record<ButtonSize, string> = {
  sm: "h-[21px] w-[21px] p-[4px]",
  md: "h-[28px] w-[28px]",
  lg: "h-[36px] w-[36px]",
};

// ── Corner radius ─────────────────────────────────────────────────────────────
const ROUND: Record<ButtonRound, string> = {
  sm:   "rounded-[var(--ui-radius-sm)]",
  md:   "rounded-[var(--ui-radius-md)]",
  lg:   "rounded-[var(--ui-radius-lg)]",
  full: "rounded-full",
};

// ── Component ─────────────────────────────────────────────────────────────────
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "ghost",
    size = "md",
    round = "sm",
    leadingIcon,
    trailingIcon,
    children,
    icon,
    pressed,
    as = "button",
    className = "active:scale-95",
    type = "button",
    disabled,
    ...props
  },
  ref,
) {
  const isIconMode = icon != null;

  // Pressed: lock in the hover-state background
  const pressedCls =
    pressed
      ? variant === "danger"
        ? "bg-[color-mix(in_srgb,var(--ui-danger-dim)_80%,transparent)]"
        : variant === "link"
        ? "text-[var(--ui-accent)] underline"
        : "bg-[color-mix(in_srgb,var(--ui-bg-hover)_80%,transparent)]"
      : "";

  const composedClassName = [
    BASE,
    isIconMode ? ICON_VARIANT[variant] : TEXT_VARIANT[variant],
    isIconMode ? ICON_SIZE[size] : TEXT_SIZE[size],
    ROUND[round],
    pressedCls,
    className,
  ].filter(Boolean).join(" ");

  const content = isIconMode ? icon : (
    <>
      {leadingIcon}
      {children}
      {trailingIcon}
    </>
  );

  // Span mode: valid when nested inside another interactive element. Emulates
  // button semantics with role/tabIndex/keyboard activation.
  if (as === "span") {
    const { onClick, onKeyDown, ...spanProps } = props;
    const spanClick = onClick as unknown as MouseEventHandler<HTMLSpanElement> | undefined;
    return (
      <span
        ref={ref as unknown as Ref<HTMLSpanElement>}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-pressed={pressed !== undefined ? pressed : props["aria-pressed"]}
        aria-disabled={disabled || undefined}
        className={[composedClassName, disabled ? "pointer-events-none opacity-40" : ""].filter(Boolean).join(" ")}
        onClick={disabled ? undefined : spanClick}
        onKeyDown={(event) => {
          (onKeyDown as unknown as KeyboardEventHandler<HTMLSpanElement> | undefined)?.(event);
          if (disabled) return;
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            spanClick?.(event as unknown as ReactMouseEvent<HTMLSpanElement>);
          }
        }}
        {...(spanProps as HTMLAttributes<HTMLSpanElement>)}
      >
        {content}
      </span>
    );
  }

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      aria-pressed={pressed !== undefined ? pressed : props["aria-pressed"]}
      className={composedClassName}
      {...props}
    >
      {content}
    </button>
  );
});

Button.displayName = "Button";
