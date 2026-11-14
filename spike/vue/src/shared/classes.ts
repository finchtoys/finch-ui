/**
 * PROPOSAL UNDER TEST — single source of truth for class strings.
 *
 * Framework-neutral by construction: pure TypeScript, no runtime imports, no
 * React/Vue types. Both a React component and a Vue SFC can import it.
 *
 * Every literal below is copied verbatim from `library/components/*.tsx`
 * (Button.tsx, Input.tsx, ToggleSwitch.tsx, ModalShell.tsx, Menu.tsx). The
 * spike harness asserts that the class string a Vue component renders is
 * byte-identical to the one the unmodified React component renders — which is
 * also a proof that swapping the React components over to this module would be
 * a no-op.
 *
 * Rule for the real library: this file owns *composition*, components own
 * *markup*. No JSX, no template strings, no DOM access.
 */

// ─── Button ──────────────────────────────────────────────────────────────────

export type ButtonVariant = "primary" | "brand" | "secondary" | "ghost" | "outline" | "danger" | "link";
export type ButtonSize = "sm" | "md" | "lg";
export type ButtonRound = "sm" | "md" | "lg" | "full";

const BUTTON_BASE =
  "inline-flex items-center justify-center font-medium! select-none cursor-pointer " +
  // transition-colors only covers background-color/border-color/color, not opacity.
  // disabled:opacity-40 used to have no transition at all (opacity jumped
  // 100%→40%→100%) which flashed on "click → briefly disabled" buttons.
  "transition-[background-color,border-color,color,opacity] duration-120 " +
  "disabled:opacity-40 disabled:pointer-events-none";

const BUTTON_ICON_BG =
  "hover:bg-[color-mix(in_srgb,var(--ui-bg-hover)_80%,transparent)] hover:brightness-95 dark:hover:brightness-135 " +
  "active:bg-[color-mix(in_srgb,var(--ui-bg-active)_80%,transparent)]";

const BUTTON_ICON_DANGER_BG =
  "hover:bg-[color-mix(in_srgb,var(--ui-danger-dim)_80%,transparent)] " +
  "active:bg-[color-mix(in_srgb,var(--ui-danger-dim)_80%,transparent)]";

const BUTTON_TEXT_VARIANT: Record<ButtonVariant, string> = {
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

const BUTTON_ICON_VARIANT: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--ui-accent)] text-[var(--ui-text-inverse)] " +
    "hover:bg-[var(--ui-bg-hover)] active:brightness-95",
  brand:
    "bg-[var(--ui-accent)] text-white " +
    "hover:brightness-105 active:brightness-95",
  secondary: "text-[var(--ui-text-secondary)] hover:text-[var(--ui-text-primary)] " + BUTTON_ICON_BG,
  ghost:     "text-[var(--ui-text-secondary)] hover:text-[var(--ui-text-primary)] " + BUTTON_ICON_BG,
  outline:
    "border border-[var(--ui-border-subtle)] text-[var(--ui-text-secondary)] hover:text-[var(--ui-text-primary)] " +
    BUTTON_ICON_BG,
  danger:    "text-[var(--ui-text-tertiary)] hover:text-[var(--ui-danger)] " + BUTTON_ICON_DANGER_BG,
  link:      "text-[var(--ui-text-secondary)] hover:text-[var(--ui-text-secondary)]",
};

const BUTTON_TEXT_SIZE: Record<ButtonSize, string> = {
  sm: "h-[21px] px-2 gap-1.5 text-[13px]",
  md: "h-[28px] px-4 gap-2 text-[14px]",
  lg: "h-[36px] px-5 gap-2.5 text-[14px]",
};

const BUTTON_ICON_SIZE: Record<ButtonSize, string> = {
  sm: "h-[21px] w-[21px] p-[4px]",
  md: "h-[28px] w-[28px]",
  lg: "h-[36px] w-[36px]",
};

const BUTTON_ROUND: Record<ButtonRound, string> = {
  sm:   "rounded-[var(--ui-radius-sm)]",
  md:   "rounded-[var(--ui-radius-md)]",
  lg:   "rounded-[var(--ui-radius-lg)]",
  full: "rounded-full",
};

export interface ButtonClassInput {
  variant?: ButtonVariant;
  size?: ButtonSize;
  round?: ButtonRound;
  /** Icon-only mode: `icon` prop was supplied. */
  iconMode?: boolean;
  pressed?: boolean;
  /** Caller-supplied classes; appended last, exactly like the React version. */
  className?: string;
}

/** Mirrors Button.tsx's `composedClassName`, including token order. */
export function buttonClassName({
  variant = "ghost",
  size = "md",
  round = "sm",
  iconMode = false,
  pressed,
  className = "active:scale-95",
}: ButtonClassInput = {}): string {
  const pressedCls = pressed
    ? variant === "danger"
      ? "bg-[color-mix(in_srgb,var(--ui-danger-dim)_80%,transparent)]"
      : variant === "link"
        ? "text-[var(--ui-accent)] underline"
        : "bg-[color-mix(in_srgb,var(--ui-bg-hover)_80%,transparent)]"
    : "";

  return [
    BUTTON_BASE,
    iconMode ? BUTTON_ICON_VARIANT[variant] : BUTTON_TEXT_VARIANT[variant],
    iconMode ? BUTTON_ICON_SIZE[size] : BUTTON_TEXT_SIZE[size],
    BUTTON_ROUND[round],
    pressedCls,
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

/** Button `as="span"` adds disabled affordances on top of the button classes. */
export function buttonSpanClassName(base: string, disabled?: boolean): string {
  return [base, disabled ? "pointer-events-none opacity-40" : ""].filter(Boolean).join(" ");
}

// ─── Input ───────────────────────────────────────────────────────────────────

export type InputVariant = "default" | "ghost" | "plain";
export type InputRound = "sm" | "md" | "lg" | "full";
export type InputSize = "sm" | "md" | "lg";

export const INPUT_SIZE_CLASS: Record<InputSize, string> = {
  sm: "px-2.5 py-0.5 text-[12px]",
  md: "px-3 py-1.5 text-[14px]",
  lg: "px-4 py-2.5 text-[15px]",
};

export const INPUT_ROUND_CLASS: Record<InputRound, string> = {
  sm: "rounded-[var(--ui-radius-sm)]",
  md: "rounded-[var(--ui-radius-md)]",
  lg: "rounded-[var(--ui-radius-lg)]",
  full: "rounded-full",
};

export const INPUT_BASE_CLASS =
  "min-w-0 flex-1 font-medium text-txt outline-none placeholder:text-txt-tertiary transition-all duration-120";
export const INPUT_DEFAULT_CLASS =
  "border border-border bg-sf-elevated focus:border-[color-mix(in_srgb,var(--ui-accent)_36%,var(--ui-border-subtle))] focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--ui-accent)_5%,transparent)]";
export const INPUT_GHOST_CLASS =
  "border-1 border-transparent bg-transparent hover:bg-[var(--ui-accent-dim)] focus:border-[color-mix(in_srgb,var(--ui-accent)_30%,transparent)] focus:bg-sf-elevated focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--ui-accent)_5%,transparent)]";
export const INPUT_PLAIN_CLASS = "border-0 bg-transparent";
export const INPUT_ERROR_CLASS =
  "border border-err shadow-[0_0_0_2px_var(--ui-danger-dim)] focus:border-err focus:shadow-[0_0_0_3px_var(--ui-danger-dim)]";

export function inputStateClass({
  error,
  variant = "default",
}: {
  error?: boolean;
  variant?: InputVariant;
}): string {
  if (error) return INPUT_ERROR_CLASS;
  if (variant === "ghost") return INPUT_GHOST_CLASS;
  return variant === "plain" ? INPUT_PLAIN_CLASS : INPUT_DEFAULT_CLASS;
}

export interface InputClassInput {
  error?: boolean;
  variant?: InputVariant;
  round?: InputRound;
  size?: InputSize;
  mono?: boolean;
  className?: string;
}

export function inputClassName({
  error,
  variant = "default",
  round = "md",
  size = "md",
  mono = false,
  className = "",
}: InputClassInput = {}): string {
  return [
    INPUT_BASE_CLASS,
    INPUT_SIZE_CLASS[size],
    INPUT_ROUND_CLASS[round],
    inputStateClass({ error: Boolean(error), variant }),
    mono ? "font-mono" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export const INPUT_LABEL_CLASS = "mb-1.5 block text-[12px] font-medium text-txt-secondary";
export const INPUT_ERROR_TEXT_CLASS = "mt-1.5 block text-[12px] font text-err-text";
export const INPUT_HINT_CLASS = "mt-1.5 block text-[12px] font text-txt-tertiary";

// ─── ToggleSwitch ────────────────────────────────────────────────────────────

export function toggleSwitchClassName({
  disabled = false,
  className = "",
}: { disabled?: boolean; className?: string } = {}): string {
  return (
    "relative flex-none shrink-0 rounded-full outline-none transition-opacity duration-120 " +
    "focus-visible:ring-2 focus-visible:ring-accent/35 focus-visible:ring-offset-2 focus-visible:ring-offset-sf " +
    `${disabled ? "cursor-not-allowed" : "cursor-pointer"} ${className}`
  ).trim();
}

export interface ToggleSwitchGeometry {
  trackW: number;
  trackH: number;
  thumb: number;
  pad: number;
}

export function toggleSwitchGeometry(size: "sm" | "md" = "md"): ToggleSwitchGeometry {
  const trackW = size === "sm" ? 32 : 42;
  const trackH = size === "sm" ? 18 : 22;
  const thumb = size === "sm" ? 12 : 16;
  return { trackW, trackH, thumb, pad: (trackH - thumb) / 2 + 1 };
}

export function toggleSwitchTrackColor(checked: boolean, disabled = false): string {
  if (disabled) return "color-mix(in srgb, var(--ui-text-tertiary) 52%, var(--ui-bg-inset))";
  return checked ? "var(--ui-accent)" : "var(--ui-bg-inset)";
}

export const TOGGLE_SWITCH_TRACK_BORDER =
  "1px solid color-mix(in srgb, var(--ui-border) 70%, transparent)";

// ─── ModalShell ──────────────────────────────────────────────────────────────

export function modalBackdropClassName(backdropClassName = "bg-black/40"): string {
  return `fixed inset-0 grid place-items-center ${backdropClassName} animate-overlayIn`;
}

export function modalShellClassName(shellClassName = ""): string {
  return `settingsModalShell rounded-xl overflow-hidden animate-modalIn ${shellClassName}`.trim();
}

export const MODAL_HEADER_CLASS = "flex items-center justify-between px-5 py-3 border-b border-border-subtle";
export const MODAL_TITLE_CLASS = "m-0 font-body text-[16px] font-semibold text-txt";
export const MODAL_HEADER_RIGHT_CLASS = "flex items-center gap-2";

// ─── Menu ────────────────────────────────────────────────────────────────────

export function menuPanelClassName(closing = false, className = ""): string {
  return (
    `menuPanel z-1000 font-normal p-1.5 border border-border-subtle rounded-(--ui-radius-md) ` +
    `bg-sf-elevated shadow-(--ui-shadow-sm) ${closing ? "animate-menuOut" : "animate-menuIn"} ${className}`
  ).trim();
}

export function menuItemClassName({
  active = false,
  danger = false,
  className = "",
}: { active?: boolean; danger?: boolean; className?: string } = {}): string {
  return `menuActionRow ${active ? "menuActionRow--active" : ""} ${
    danger ? "menuActionRow--ui-danger" : ""
  } ${className}`.trim();
}

export function menuSeparatorClassName(className = ""): string {
  return `my-1 border-t border-border-subtle ${className}`.trim();
}

/** MenuPopover's inline positioning style (framework-neutral on purpose). */
export interface MenuPosition {
  left: number;
  top: number;
}

export type MenuPlacement =
  | "top-start"
  | "top-end"
  | "bottom-start"
  | "bottom-end"
  | "right-start"
  | "right-end";

export function menuPanelStyle(position: MenuPosition | null): Record<string, string | number> {
  return {
    position: "fixed",
    left: position?.left ?? 0,
    top: position?.top ?? 0,
    visibility: position ? "visible" : "hidden",
    pointerEvents: position ? "auto" : "none",
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

type AnchorRect = { left: number; right: number; top: number; bottom: number };

function flipPlacement(
  placement: MenuPlacement,
  anchor: AnchorRect,
  menuRect: { width: number; height: number },
  gap: number,
  gutter: number,
): MenuPlacement {
  if (placement.startsWith("bottom")) {
    const bottomSpace = window.innerHeight - anchor.bottom - gap - gutter;
    const topSpace = anchor.top - gap - gutter;
    if (menuRect.height > bottomSpace && topSpace > bottomSpace) {
      return placement === "bottom-start" ? "top-start" : "top-end";
    }
  }

  if (placement.startsWith("top")) {
    const topSpace = anchor.top - gap - gutter;
    const bottomSpace = window.innerHeight - anchor.bottom - gap - gutter;
    if (menuRect.height > topSpace && bottomSpace > topSpace) {
      return placement === "top-start" ? "bottom-start" : "bottom-end";
    }
  }

  return placement;
}

/** Pure positioning math lifted out of Menu.tsx so both frameworks share it. */
export function menuPosition(
  placement: MenuPlacement,
  anchor: AnchorRect,
  menuRect: { width: number; height: number },
  gap: number,
  gutter: number,
): MenuPosition {
  let left = 0;
  let top = 0;
  const resolved = flipPlacement(placement, anchor, menuRect, gap, gutter);

  switch (resolved) {
    case "top-start":
      left = anchor.left;
      top = anchor.top - menuRect.height - gap;
      break;
    case "top-end":
      left = anchor.right - menuRect.width;
      top = anchor.top - menuRect.height - gap;
      break;
    case "bottom-start":
      left = anchor.left;
      top = anchor.bottom + gap;
      break;
    case "bottom-end":
      left = anchor.right - menuRect.width;
      top = anchor.bottom + gap;
      break;
    case "right-start":
      left = anchor.right + gap;
      top = anchor.top;
      break;
    case "right-end":
      left = anchor.right + gap;
      top = anchor.bottom - menuRect.height;
      break;
  }

  return {
    left: clamp(left, gutter, window.innerWidth - menuRect.width - gutter),
    top: clamp(top, gutter, window.innerHeight - menuRect.height - gutter),
  };
}

/** 120ms close animation, shared by MenuPopover and MenuSubmenu. */
export const MENU_OUT_DURATION = 120;
