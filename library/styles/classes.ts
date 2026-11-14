/**
 * Shared, framework-neutral presentation facts for the components that Finch
 * and its mini-tool library both have to render identically.
 *
 * WHY THIS FILE EXISTS
 * Class strings are not private implementation detail here. They are the input
 * to three different things:
 *   1. Tailwind's scanner (`@source "./classes.ts"` in styles/finch-ui.css) —
 *      the entire prebuilt stylesheet is generated from these literals;
 *   2. `verify-build.mjs`, which proves every arbitrary-value utility in these
 *      literals exists in dist/style.css with a non-empty declaration;
 *   3. what the component (React) and any second renderer (e.g. the Vue 3 spike)
 *      actually puts on the element.
 * Keeping one copy is the only way those three stay in agreement.
 *
 * RULES
 * - No imports, no framework types, no DOM access — React and Vue both import
 *   this module as-is.
 * - Full class strings only. Never build a utility out of fragments or inside
 *   a `${}` interpolation: Tailwind scans raw text and will silently drop what
 *   it cannot see as a complete candidate.
 * - Components own markup and behaviour; this file owns class composition,
 *   inline-style values and the pure positioning algebra behind them.
 *
 * Inline styles are deliberately emitted as CSS strings with units (`"12px"`),
 * never bare numbers. React appends `px` to numbers; Vue does not, and drops
 * `style.left = 12` on the floor. Spelling the unit out makes one shared value
 * correct for both.
 */

// ─── Button ──────────────────────────────────────────────────────────────────

export type ButtonVariant = "primary" | "brand" | "secondary" | "ghost" | "outline" | "danger" | "link";
export type ButtonSize = "sm" | "md" | "lg";
export type ButtonRound = "sm" | "md" | "lg" | "full";

const BUTTON_BASE =
  "inline-flex items-center justify-center font-medium! select-none cursor-pointer " +
  // transition-colors only covers background-color/border-color/color, not
  // opacity. disabled:opacity-40 used to have no transition at all, so a
  // "click → briefly disabled" button flashed. One transition-property list
  // covers colours and opacity without relying on utility generation order.
  "transition-[background-color,border-color,color,opacity] duration-120 " +
  "disabled:opacity-40 disabled:pointer-events-none";

/** Caller-supplied classes are appended last; Button's default lives here so
 *  the component file holds no class literals of its own. */
export const BUTTON_DEFAULT_CLASS = "active:scale-95";

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
  /** Icon-only mode: the `icon` prop/slot was supplied. */
  iconMode?: boolean;
  pressed?: boolean;
  /** Caller-supplied classes; appended last, exactly as before extraction. */
  className?: string;
}

export function buttonClassName({
  variant = "ghost",
  size = "md",
  round = "sm",
  iconMode = false,
  pressed,
  className = BUTTON_DEFAULT_CLASS,
}: ButtonClassInput = {}): string {
  // Pressed locks in the hover-state background.
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

/** `as="span"` needs the disabled affordances that a native button gets free. */
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
  "min-w-0 flex-1 text-txt outline-none placeholder:text-txt-tertiary transition-all duration-120";
export const INPUT_DEFAULT_CLASS =
  "border border-border bg-sf-elevated focus:border-[color-mix(in_srgb,var(--ui-accent)_36%,var(--ui-border-subtle))] focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--ui-accent)_5%,transparent)]";
export const INPUT_GHOST_CLASS =
  "border-1 border-transparent bg-transparent hover:bg-[var(--ui-accent-dim)] focus:border-[color-mix(in_srgb,var(--ui-accent)_30%,transparent)] focus:bg-sf-elevated focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--ui-accent)_5%,transparent)]";
/** 完全融入页面：没有背景、边框与聚焦框，只留下文字本身。 */
export const INPUT_PLAIN_CLASS = "border-0 bg-transparent";
export const INPUT_ERROR_CLASS =
  "border border-err shadow-[0_0_0_2px_var(--ui-danger-dim)] focus:border-err focus:shadow-[0_0_0_3px_var(--ui-danger-dim)]";

export const INPUT_ROOT_CLASS = "block";
export const INPUT_ROW_CLASS = "flex items-center gap-2";
export const INPUT_LABEL_CLASS = "mb-1.5 block text-[12px] font-medium text-txt-secondary";
export const INPUT_ERROR_TEXT_CLASS = "mt-1.5 block text-[12px] font text-err-text";
export const INPUT_HINT_CLASS = "mt-1.5 block text-[12px] font text-txt-tertiary";

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

// ─── ToggleSwitch ────────────────────────────────────────────────────────────
//
// The switch is built almost entirely out of inline styles, which is exactly
// the spot where a second renderer drifts (React appends `px`, Vue does not).

export interface ToggleSwitchGeometry {
  trackW: number;
  trackH: number;
  thumb: number;
  pad: number;
}

export const TOGGLE_SWITCH_THUMB_CLASS = "absolute top-1/2 rounded-full shadow-sm";

export function toggleSwitchGeometry(size: "sm" | "md" = "md"): ToggleSwitchGeometry {
  const trackW = size === "sm" ? 32 : 42;
  const trackH = size === "sm" ? 18 : 22;
  const thumb = size === "sm" ? 12 : 16;
  return { trackW, trackH, thumb, pad: (trackH - thumb) / 2 + 1 };
}

const TOGGLE_SWITCH_ROOT =
  "relative flex-none shrink-0 rounded-full outline-none transition-opacity duration-120 " +
  "focus-visible:ring-2 focus-visible:ring-accent/35 focus-visible:ring-offset-2 focus-visible:ring-offset-sf";

export function toggleSwitchClassName({
  disabled = false,
  className = "",
}: { disabled?: boolean; className?: string } = {}): string {
  return [TOGGLE_SWITCH_ROOT, disabled ? "cursor-not-allowed" : "cursor-pointer", className]
    .filter(Boolean)
    .join(" ");
}

export function toggleSwitchTrackStyle({
  size = "md",
  checked,
  disabled = false,
}: {
  size?: "sm" | "md";
  checked: boolean;
  disabled?: boolean;
}): Record<string, string | number> {
  const { trackW, trackH } = toggleSwitchGeometry(size);
  const background = disabled
    ? "color-mix(in srgb, var(--ui-text-tertiary) 52%, var(--ui-bg-inset))"
    : checked
      ? "var(--ui-accent)"
      : "var(--ui-bg-inset)";

  return {
    width: `${trackW}px`,
    height: `${trackH}px`,
    backgroundColor: background,
    border: "1px solid color-mix(in srgb, var(--ui-border) 70%, transparent)",
    transition: "background-color 200ms ease",
    opacity: disabled ? 0.5 : 1,
  };
}

export function toggleSwitchThumbStyle({
  size = "md",
  checked,
}: {
  size?: "sm" | "md";
  checked: boolean;
}): Record<string, string | number> {
  const { trackW, thumb, pad } = toggleSwitchGeometry(size);
  return {
    width: `${thumb}px`,
    height: `${thumb}px`,
    backgroundColor: "var(--ui-fg-primary)",
    left: `${checked ? trackW - pad - thumb : pad}px`,
    transform: "translateY(-50%)",
    transition: "left 200ms cubic-bezier(0.22, 1, 0.36, 1)",
  };
}

// ─── ModalShell ──────────────────────────────────────────────────────────────

/** ModalShell's default backdrop tint (a class string, so it belongs here). */
export const MODAL_DEFAULT_BACKDROP_CLASS = "bg-black/40";

export function modalBackdropClassName(backdropClassName = MODAL_DEFAULT_BACKDROP_CLASS): string {
  return `fixed inset-0 grid place-items-center ${backdropClassName} animate-overlayIn`;
}

export const MODAL_BACKDROP_ONLY_CLASS = "h-full w-full";

export function modalShellClassName(shellClassName = ""): string {
  return `settingsModalShell rounded-xl overflow-hidden animate-modalIn ${shellClassName}`.trim();
}

export const MODAL_HEADER_CLASS = "flex items-center justify-between px-5 py-3 border-b border-border-subtle";
export const MODAL_TITLE_CLASS = "m-0 font-body text-[16px] font-semibold text-txt";
export const MODAL_HEADER_RIGHT_CLASS = "flex items-center gap-2";

// ─── Menu ────────────────────────────────────────────────────────────────────

export function menuPanelClassName(closing = false, className = ""): string {
  const animation = closing ? "animate-menuOut" : "animate-menuIn";
  return [
    "menuPanel z-1000 font-normal p-1.5 border border-border-subtle rounded-(--ui-radius-md) " +
      "bg-sf-elevated shadow-(--ui-shadow-sm)",
    animation,
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function menuItemClassName({
  active = false,
  danger = false,
  className = "",
}: { active?: boolean; danger?: boolean; className?: string } = {}): string {
  return [
    "menuActionRow",
    active ? "menuActionRow--active" : "",
    danger ? "menuActionRow--ui-danger" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export const MENU_ITEM_TRAILING_CLASS = "ml-auto flex shrink-0 items-center";

export function menuSeparatorClassName(className = ""): string {
  return ["my-1 border-t border-border-subtle", className].filter(Boolean).join(" ");
}

/** 120ms close animation, shared by MenuPopover and MenuSubmenu. */
export const MENU_OUT_DURATION = 120;

export type MenuPlacement =
  | "top-start"
  | "top-end"
  | "bottom-start"
  | "bottom-end"
  | "right-start"
  | "right-end";

export interface MenuPosition {
  left: number;
  top: number;
}

/** Viewport-safe inline style for a portalled menu panel (units spelled out). */
export function menuPanelStyle(position: MenuPosition | null): Record<string, string> {
  return {
    position: "fixed",
    left: `${position?.left ?? 0}px`,
    top: `${position?.top ?? 0}px`,
    visibility: position ? "visible" : "hidden",
    pointerEvents: position ? "auto" : "none",
  };
}

export function clampPosition(value: number, min: number, max: number): number {
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

/** Pure placement algebra: rects in, viewport-clamped position out. */
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
    left: clampPosition(left, gutter, window.innerWidth - menuRect.width - gutter),
    top: clampPosition(top, gutter, window.innerHeight - menuRect.height - gutter),
  };
}

// ─── Badge ───────────────────────────────────────────────────────────────────

export type BadgeVariant = "neutral" | "accent" | "warning" | "danger" | "success";
export type BadgeSize = "sm" | "md";

const BADGE_BASE = "inline-flex items-center gap-1 rounded-[var(--ui-radius-sm)] font-medium";

const BADGE_VARIANT: Record<BadgeVariant, string> = {
  neutral: "bg-sf-hover text-txt-tertiary",
  accent: "bg-accent-dim text-accent",
  warning: "bg-warn-dim text-warn-text",
  danger: "bg-err-dim text-err-text",
  success: "bg-ok-dim text-ok-text",
};

const BADGE_SIZE: Record<BadgeSize, string> = {
  sm: "px-1.5 py-0.5 text-[11px]",
  md: "px-2 py-1 text-[12px]",
};

export function badgeClassName({
  variant = "neutral",
  size = "sm",
  className = "",
}: {
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
} = {}): string {
  return [BADGE_BASE, BADGE_VARIANT[variant], BADGE_SIZE[size], className].filter(Boolean).join(" ");
}

export function freeModelBadgeClassName(className = ""): string {
  return ["ml-1 mb-0.5 text-[10px]! h-[16px]! flex-none bg-accent! text-white!", className]
    .filter(Boolean)
    .join(" ");
}

// ─── Chip ────────────────────────────────────────────────────────────────────

export const CHIP_CLASS =
  "inline-flex items-center gap-1.5 rounded-[var(--ui-radius-sm)] px-2.5 py-1.5 text-[12px] font-normal text-txt-secondary";

export function chipClassName(className = ""): string {
  return [CHIP_CLASS, className].filter(Boolean).join(" ");
}

export const CHIP_REMOVE_BUTTON_CLASS =
  "inline-flex h-4 w-4 items-center justify-center rounded-full text-txt-tertiary transition-colors duration-120 hover:bg-err-dim hover:text-err";

export function actionChipClassName(className = ""): string {
  return [
    CHIP_CLASS,
    "bg-sf hover:bg-sf-hover hover:text-txt transition-colors duration-120 disabled:opacity-50",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

// ─── Kbd ─────────────────────────────────────────────────────────────────────

export const KBD_CLASS =
  "finchKbd inline-flex min-w-[24px] items-center justify-center rounded-[var(--ui-radius-sm)] px-1.5 font-mono text-[11px] text-txt-secondary";

export function kbdClassName(className = ""): string {
  return [KBD_CLASS, className].filter(Boolean).join(" ");
}

/** Wrapper for a bare modifier glyph inside a Kbd (`⌘` + `B`). */
export const KBD_SYMBOL_CLASS = "finchKbd__symbol";
