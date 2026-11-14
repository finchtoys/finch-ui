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

// ─── Empty ───────────────────────────────────────────────────────────────────

export function emptyClassName({
  compact = false,
  className = "",
}: { compact?: boolean; className?: string } = {}): string {
  return [
    "flex min-w-0 w-full flex-col items-center justify-center text-center",
    compact
      ? "gap-2 rounded-sm border border-dotted border-border-subtle px-3 py-4"
      : "gap-3 px-4 py-6",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export const EMPTY_PLAIN_ICON_CLASS = "text-txt-tertiary";
export const EMPTY_ICON_BOX_CLASS = "flex items-center justify-center rounded-md bg-sf-hover p-3 text-txt-tertiary";
export const EMPTY_TITLE_CLASS = "m-0 text-[16px] font-medium text-txt-secondary py-0.5";
export const EMPTY_DESCRIPTION_CLASS = "m-0 text-[14px] text-txt-tertiary";

// ─── InlineActionLink ────────────────────────────────────────────────────────

export const INLINE_ACTION_LINK_CLASS =
  "group inline-flex align-baseline min-w-0 cursor-pointer items-center gap-[7px] rounded-[var(--ui-radius-sm)] border-0 bg-transparent px-[3px] py-[2px] text-left text-accent-text transition-colors duration-[var(--ui-duration-fast)] ease-[var(--ui-ease-out)] hover:bg-[color-mix(in_srgb,var(--ui-accent)_8%,transparent)] hover:text-[var(--ui-accent-hover)]";

export function inlineActionLinkClassName(className = ""): string {
  return [INLINE_ACTION_LINK_CLASS, className].filter(Boolean).join(" ");
}

export const INLINE_ACTION_LINK_ICON_CLASS =
  "inline-flex flex-none text-current opacity-[0.82] transition-opacity duration-[var(--ui-duration-fast)] ease-[var(--ui-ease-out)] group-hover:opacity-100";

export const INLINE_ACTION_LINK_LABEL_CLASS =
  "block self-baseline min-w-0 overflow-hidden text-ellipsis whitespace-nowrap underline decoration-[color-mix(in_srgb,currentColor_36%,transparent)] decoration-1 underline-offset-4";

// ─── OptionCard ──────────────────────────────────────────────────────────────

export function optionCardClassName({
  active = false,
  selected = false,
  disabled = false,
  className = "",
}: { active?: boolean; selected?: boolean; disabled?: boolean; className?: string } = {}): string {
  const state = selected
    ? "bg-sf-active text-txt"
    : active
      ? "bg-sf-hover text-txt"
      : "text-txt-secondary hover:bg-sf-hover/40 hover:text-txt";

  return [
    "flex min-h-[36px] items-center gap-2 px-[12px] rounded-[var(--ui-radius-sm)] select-none transition-colors duration-120",
    disabled ? "cursor-default opacity-60" : "cursor-pointer",
    state,
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export const OPTION_CARD_TEXT_CLASS = "composerQuestion__optionText min-w-0 flex-1";

// ─── TypingDots ──────────────────────────────────────────────────────────────

export const TYPING_DOTS_CLASS = "runningDots";
export const TYPING_DOTS_SMALL_CLASS = "runningDots--small";
export const TYPING_DOTS_TINY_CLASS = "runningDots--tiny";

export function typingDotsClassName({
  size = "default",
  className = "",
}: { size?: "default" | "small" | "tiny"; className?: string } = {}): string {
  const sizeClass = size === "small" ? ` ${TYPING_DOTS_SMALL_CLASS}` : size === "tiny" ? ` ${TYPING_DOTS_TINY_CLASS}` : "";
  return `${TYPING_DOTS_CLASS}${sizeClass}${className ? ` ${className}` : ""}`;
}

// ─── WorkingText ─────────────────────────────────────────────────────────────

const WORKING_TEXT_BASE: Record<"primary" | "secondary" | "tertiary" | "accent", string> = {
  primary: "var(--ui-text-primary)",
  secondary: "var(--ui-text-secondary)",
  tertiary: "var(--ui-text-tertiary)",
  accent: "var(--ui-accent)",
};

const WORKING_TEXT_HIGHLIGHT: Record<"primary" | "secondary" | "tertiary" | "accent", string> = {
  primary: "color-mix(in srgb, white 58%, var(--ui-text-primary))",
  secondary: "color-mix(in srgb, white 58%, var(--ui-text-secondary))",
  tertiary: "color-mix(in srgb, white 60%, var(--ui-text-tertiary))",
  accent: "color-mix(in srgb, var(--ui-accent) 64%, var(--ui-accent))",
};

export function workingTextClassName({
  active = false,
  className = "",
}: { active?: boolean; className?: string } = {}): string {
  return ["workingText", active ? "workingText--active" : "", className].filter(Boolean).join(" ");
}

/** CSS custom properties the `.workingText` keyframes read. */
export function workingTextStyle({
  tone = "secondary",
}: { tone?: "primary" | "secondary" | "tertiary" | "accent" } = {}): Record<string, string> {
  return {
    "--working-text-base": WORKING_TEXT_BASE[tone],
    "--working-text-highlight": WORKING_TEXT_HIGHLIGHT[tone],
  };
}

// ─── SkeletonBlock ───────────────────────────────────────────────────────────

export const USAGE_SKELETON_CLASS = "usageSkeleton";

export function skeletonBlockClassName(className = ""): string {
  return [USAGE_SKELETON_CLASS, className].filter(Boolean).join(" ");
}

export const SKELETON_CARD_CLASS =
  "flex w-full min-w-0 max-w-full flex-col overflow-hidden rounded-[var(--ui-radius-lg)] bg-sf-elevated px-4.5 py-5 gap-2 select-none";
export const SKELETON_CARD_HEADER_CLASS = "flex min-w-0 items-center gap-2 h-[28px]";
export const SKELETON_CARD_TITLE_WRAP_CLASS = "min-w-0 flex-1 overflow-hidden";
export const SKELETON_CARD_ACTION_WRAP_CLASS = "flex flex-none items-center";
export const SKELETON_CARD_DESC_CLASS = "flex flex-col gap-[7px] pt-0.5";
export const SKELETON_CARD_GRID_CLASS = "grid w-full min-w-0 grid-cols-3 gap-3";
export const SKELETON_CARD_TITLE_BAR_CLASS = "h-[14px] rounded";
export const SKELETON_CARD_ACTION_CLASS = "h-[26px] w-[52px] rounded-[var(--ui-radius-md)]";
export const SKELETON_CARD_LINE_CLASS = "h-[11px] rounded";
export const SKELETON_CARD_LINE_FULL_CLASS = "h-[11px] w-full rounded";

export function skeletonCatalogCardClassName(className = ""): string {
  return [SKELETON_CARD_CLASS, className].filter(Boolean).join(" ");
}

// ─── Alert ───────────────────────────────────────────────────────────────────

export type AlertVariant = "info" | "warning" | "error" | "success";

export function alertClassName(className = ""): string {
  return [
    "flex shrink-0 items-start gap-2 rounded-[var(--ui-radius-md)] border px-3 py-2 text-[13px] leading-relaxed",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function alertVariantStyle(variant: AlertVariant = "info"): Record<string, string> {
  switch (variant) {
    case "warning":
      return {
        borderColor: "color-mix(in srgb, var(--ui-warning) 34%, transparent)",
        background: "var(--ui-warning-dim)",
        color: "var(--ui-warning-text)",
      };
    case "error":
      return {
        borderColor: "color-mix(in srgb, var(--ui-danger) 34%, transparent)",
        background: "var(--ui-danger-dim)",
        color: "var(--ui-danger-text)",
      };
    case "success":
      return {
        borderColor: "color-mix(in srgb, var(--ui-positive) 34%, transparent)",
        background: "var(--ui-positive-dim)",
        color: "var(--ui-positive-text)",
      };
    default:
      return {
        borderColor: "color-mix(in srgb, var(--ui-info) 34%, transparent)",
        background: "var(--ui-info-soft)",
        color: "var(--ui-text-secondary)",
      };
  }
}

export const ALERT_CUSTOM_ICON_CLASS = "mt-1.5 flex flex-none items-center";
export const ALERT_BODY_CLASS = "min-w-0 flex-1";
export const ALERT_TITLE_CLASS = "mb-1 font-semibold text-current";
export const ALERT_CONTENT_CLASS = "select-text break-words text-current";
export const ALERT_ICON_CLASS = "mt-0.5 flex-none";

// ─── SegmentedControl ────────────────────────────────────────────────────────

export const SEGMENTED_CONTROL_CLASS = "inline-flex gap-0.5 rounded-full bg-[var(--ui-bg-inset)] p-[3px]";

export function segmentedItemClassName(active: boolean): string {
  return [
    "flex items-center gap-[5px] whitespace-nowrap",
    "rounded-full px-3 py-1",
    "cursor-pointer text-[13px]",
    "transition-[background,color,box-shadow] duration-[160ms]",
    active
      ? "bg-accent font-medium text-white shadow-[0_1px_3px_rgba(0,0,0,0.18),0_0_0_0.5px_rgba(0,0,0,0.08)]"
      : "font-[450] text-[var(--ui-text-tertiary)] hover:text-[var(--ui-text-secondary)]",
  ].join(" ");
}

export function segmentedIconClassName(active: boolean): string {
  return `flex items-center ${active ? "opacity-90" : "opacity-70"}`;
}

// ─── CheckBox ────────────────────────────────────────────────────────────────

export type CheckBoxSize = "sm" | "md" | "lg";
export type CheckBoxRound = "full" | "md";

const CHECKBOX_SIZE: Record<CheckBoxSize, string> = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

const CHECKBOX_ROUND: Record<CheckBoxRound, string> = {
  full: "rounded-full",
  md: "rounded-[var(--ui-radius-sm)]",
};

const CHECKBOX_DOT_SIZE: Record<CheckBoxSize, string> = {
  sm: "h-2 w-2",
  md: "h-2.5 w-2.5",
  lg: "h-3 w-3",
};

export const CHECKBOX_CHECK_SIZE: Record<CheckBoxSize, number> = {
  sm: 10,
  md: 12,
  lg: 14,
};

export function checkBoxClassName({
  disabled = false,
  className = "",
}: { disabled?: boolean; className?: string } = {}): string {
  return [
    "inline-flex min-w-0 items-center gap-2",
    disabled ? "cursor-default opacity-55" : "cursor-pointer",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function checkBoxIndicatorClassName({
  size = "md",
  round = "full",
  active,
}: {
  size?: CheckBoxSize;
  round?: CheckBoxRound;
  active: boolean;
}): string {
  return [
    "inline-flex shrink-0 items-center justify-center overflow-hidden border transition-colors duration-150",
    CHECKBOX_SIZE[size],
    CHECKBOX_ROUND[round],
    active ? "border-accent bg-accent text-sf-primary" : "border-border bg-transparent text-transparent",
  ].join(" ");
}

export function checkBoxDotClassName(size: CheckBoxSize = "md"): string {
  return `rounded-full bg-current ${CHECKBOX_DOT_SIZE[size]}`;
}

export const CHECKBOX_LABEL_GROUP_CLASS = "grid min-w-0 gap-0.5";

export function checkBoxLabelClassName({
  size = "md",
  active,
}: {
  size?: CheckBoxSize;
  active: boolean;
}): string {
  return [
    "truncate",
    size === "sm" ? "text-[12px]" : "text-[13px]",
    "font-medium",
    active ? "text-txt" : "text-txt-secondary",
  ].join(" ");
}

export const CHECKBOX_DESC_CLASS = "whitespace-normal text-[11px] font-normal leading-4 text-txt-tertiary";

// ─── TextArea ────────────────────────────────────────────────────────────────

export function textAreaClassName({
  unstyled = false,
  variant = "default",
  round = "md",
  error = false,
  className = "",
}: {
  unstyled?: boolean;
  variant?: InputVariant;
  round?: InputRound;
  error?: boolean;
  className?: string;
} = {}): string {
  const base = [
    // 默认不给右下角拖拽手柄：多行输入框在弹窗/面板里被拖到变形的概率远高于
    // 真需要它；要放开由调用方自己传 style={{ resize: "vertical" }}。
    "appScrollbar block w-full resize-none",
    INPUT_BASE_CLASS,
    INPUT_ROUND_CLASS[round],
    inputStateClass({ error, variant }),
  ].join(" ");

  return ["p-1.5", unstyled ? "" : base, className].filter(Boolean).join(" ");
}

// ─── ListRow ─────────────────────────────────────────────────────────────────

export function listRowClassName({
  isActive = false,
  hasIcon = true,
  hasInteraction = false,
  className = "",
}: {
  isActive?: boolean;
  hasIcon?: boolean;
  hasInteraction?: boolean;
  className?: string;
} = {}): string {
  return [
    "listRow group relative flex w-full min-w-0 items-center gap-2 px-[8px] py-[8px] rounded-sm text-left transition-colors duration-120",
    isActive ? "listRow--active text-txt" : "text-txt-secondary hover:bg-sf-hover hover:text-txt",
    hasIcon ? "" : "listRow--noIcon",
    hasInteraction ? "cursor-pointer" : "cursor-default",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export const LIST_ROW_ICON_CLASS =
  "listRow__icon flex-none flex items-center text-txt-tertiary group-hover:text-txt-secondary transition-colors duration-120";

export function listRowTitleClassName({
  hoverFade = false,
  mono = false,
}: { hoverFade?: boolean; mono?: boolean } = {}): string {
  return [
    "listRow__title overflow-hidden whitespace-nowrap text-[14px] font-medium select-none leading-5 listRow__title--fade",
    hoverFade ? "listRow__title--hoverFade" : "",
    mono ? "font-mono" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export const LIST_ROW_TITLE_WRAP_CLASS = "min-w-0 flex-1";
export const LIST_ROW_SUBTITLE_CLASS = "listRow__subtitle mt-0.5 truncate text-[12px] leading-4 select-none";
export const LIST_ROW_RIGHT_CLASS = "listRow__right relative flex-none flex h-5 items-center justify-end";

export function listRowMetaClassName({ hasFloat = false, floatVisible = false }: { hasFloat?: boolean; floatVisible?: boolean } = {}): string {
  const fade = hasFloat ? (floatVisible ? "opacity-0" : "group-hover:opacity-0") : "";
  return ["listRow__meta flex items-center transition-opacity duration-120", fade].filter(Boolean).join(" ");
}

export function listRowFloatClassName({ floatVisible = false }: { floatVisible?: boolean } = {}): string {
  return [
    "listRow__float absolute right-0 flex items-center whitespace-nowrap transition-opacity duration-120",
    floatVisible ? "opacity-100" : "opacity-0 group-hover:opacity-100",
  ].join(" ");
}

export function listRowFloatOverlayClassName({ floatVisible = false }: { floatVisible?: boolean } = {}): string {
  return [
    "listRow__float listRow__float--overlay absolute right-2 flex items-center transition-opacity duration-120",
    floatVisible ? "opacity-100" : "opacity-0 group-hover:opacity-100",
  ].join(" ");
}

// ─── Tooltip ─────────────────────────────────────────────────────────────────

export type TooltipPlacement = "top" | "bottom" | "left" | "right";
export type TooltipAlign = "center" | "start" | "end";

export function tooltipClassName({
  placement = "bottom",
  closing = false,
  className = "",
}: { placement?: TooltipPlacement; closing?: boolean; className?: string } = {}): string {
  const hasArrow = placement === "left" || placement === "right";
  return [
    "tooltip",
    hasArrow ? `tooltip--arrow tooltip--${placement}` : "",
    closing ? "tooltip--out" : "tooltip--in",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export const TOOLTIP_CONTENT_CLASS = "tooltip__content";

export const TOOLTIP_OUT_DURATION = 150;

export const TOOLTIP_ANCHOR_STYLE = "display:contents";

function alignedLeft(align: TooltipAlign, anchor: { left: number; right: number; width: number }, width: number): number {
  if (align === "start") return anchor.left;
  if (align === "end") return anchor.right - width;
  return anchor.left + anchor.width / 2 - width / 2;
}

/** Pure placement math for a tooltip bubble (viewport-clamped, gutter 8). */
export function tooltipPosition(
  placement: TooltipPlacement,
  anchor: { left: number; right: number; top: number; bottom: number; width: number; height: number },
  tooltip: { width: number; height: number },
  gap: number,
  align: TooltipAlign = "center",
): MenuPosition {
  let left = 0;
  let top = 0;

  switch (placement) {
    case "bottom":
      left = alignedLeft(align, anchor, tooltip.width);
      top = anchor.bottom + gap;
      break;
    case "top":
      left = alignedLeft(align, anchor, tooltip.width);
      top = anchor.top - tooltip.height - gap;
      break;
    case "left":
      left = anchor.left - tooltip.width - gap;
      top = anchor.top + anchor.height / 2 - tooltip.height / 2;
      break;
    case "right":
      left = anchor.right + gap;
      top = anchor.top + anchor.height / 2 - tooltip.height / 2;
      break;
  }

  const gutter = 8;
  return {
    left: clampPosition(left, gutter, window.innerWidth - tooltip.width - gutter),
    top: clampPosition(top, gutter, window.innerHeight - tooltip.height - gutter),
  };
}

// ─── HoverCard ───────────────────────────────────────────────────────────────

export type HoverCardPlacement = "top" | "bottom" | "left" | "right";

export function hoverCardClassName({
  placement = "bottom",
  closing = false,
  className = "",
}: { placement?: HoverCardPlacement; closing?: boolean; className?: string } = {}): string {
  return [`hoverCard hoverCard--${placement}`, closing ? "hoverCard--out" : "hoverCard--in", className]
    .filter(Boolean)
    .join(" ");
}

export const HOVER_CARD_CONTENT_CLASS = "hoverCard__content";
export const HOVER_CARD_OUT_DURATION = 120;

function chooseHoverPlacement(
  preferred: HoverCardPlacement,
  anchor: { left: number; right: number; top: number; bottom: number },
  card: { width: number; height: number },
  gap: number,
): HoverCardPlacement {
  const gutter = 8;
  if (preferred === "right" && anchor.right + gap + card.width > window.innerWidth - gutter) return "left";
  if (preferred === "left" && anchor.left - gap - card.width < gutter) return "right";
  if (preferred === "bottom" && anchor.bottom + gap + card.height > window.innerHeight - gutter) return "top";
  if (preferred === "top" && anchor.top - gap - card.height < gutter) return "bottom";
  return preferred;
}

/** Pure placement math for a hover card; also reports the placement it chose. */
export function hoverCardPosition(
  placement: HoverCardPlacement,
  anchor: { left: number; right: number; top: number; bottom: number; width: number; height: number },
  card: { width: number; height: number },
  gap: number,
): { left: number; top: number; placement: HoverCardPlacement } {
  const actual = chooseHoverPlacement(placement, anchor, card, gap);
  let left = 0;
  let top = 0;

  switch (actual) {
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
    placement: actual,
    left: clampPosition(left, gutter, window.innerWidth - card.width - gutter),
    top: clampPosition(top, gutter, window.innerHeight - card.height - gutter),
  };
}

// ─── Breadcrumb ──────────────────────────────────────────────────────────────

export function breadcrumbNavClassName(className = ""): string {
  return [
    "grid min-w-0 max-w-full grid-flow-col auto-cols-[minmax(0,max-content)] items-center",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export const BREADCRUMB_ITEM_CLASS = "flex min-w-0 items-center";
export const BREADCRUMB_BUTTON_CLASS = "min-w-0 flex-1 text-txt-tertiary hover:text-txt py-3.5";
export const BREADCRUMB_ICON_CLASS = "inline-flex shrink-0 items-center";
export const BREADCRUMB_BUTTON_LABEL_CLASS = "min-w-0 truncate font-medium";
export const BREADCRUMB_LEAF_LABEL_CLASS = "min-w-0 truncate";

export function breadcrumbLeafClassName(active = false): string {
  return [
    "inline-flex h-7 min-w-0 flex-1 items-center gap-1.5 px-2 text-[14px] font-medium",
    active ? "text-txt" : "text-txt-tertiary",
  ].join(" ");
}

export const BREADCRUMB_SEPARATOR_CLASS = "mx-0.5 shrink-0 text-txt-tertiary/60";

// ─── ButtonGroup ─────────────────────────────────────────────────────────────

const BUTTON_GROUP_VARIANT: Record<ButtonVariant, string> = {
  primary: "bg-accent text-white",
  brand: "bg-accent text-white",
  secondary: "bg-[var(--ui-bg-inset)] text-[var(--ui-text-secondary)]",
  ghost: "bg-transparent text-[var(--ui-text-secondary)]",
  outline: "border border-[var(--ui-border-subtle)] bg-transparent text-[var(--ui-text-secondary)]",
  danger: "bg-[var(--ui-danger-dim)] text-[var(--ui-danger-text)]",
  link: "bg-transparent text-[var(--ui-text-secondary)]",
};

const BUTTON_GROUP_DIVIDER: Record<ButtonVariant, string> = {
  primary: "border-white/25",
  brand: "border-white/25",
  secondary: "border-[var(--ui-border-subtle)]",
  ghost: "border-[var(--ui-border-subtle)]",
  outline: "border-[var(--ui-border-subtle)]",
  danger: "border-[color-mix(in_srgb,var(--ui-danger)_24%,transparent)]",
  link: "border-[var(--ui-border-subtle)]",
};

const BUTTON_GROUP_ITEM_VARIANT: Record<ButtonVariant, string> = {
  primary:
    "!text-white hover:!bg-[color-mix(in_srgb,var(--ui-accent)_90%,transparent)] active:!brightness-95",
  brand:
    "!text-white hover:!bg-[color-mix(in_srgb,var(--ui-accent)_90%,#666)] active:!brightness-95",
  secondary:
    "hover:!bg-[var(--ui-bg-hover)] hover:!text-[var(--ui-text-primary)] active:!bg-[var(--ui-bg-active)]",
  ghost:
    "hover:!bg-[var(--ui-bg-hover)] hover:!text-[var(--ui-text-primary)] active:!bg-[var(--ui-bg-active)]",
  outline:
    "hover:!bg-[var(--ui-bg-hover)] hover:!text-[var(--ui-text-primary)] hover:!border-[var(--ui-border-subtle)] active:!bg-[var(--ui-bg-active)]",
  danger:
    "hover:!bg-[color-mix(in_srgb,var(--ui-danger)_16%,transparent)] active:!bg-[color-mix(in_srgb,var(--ui-danger)_22%,transparent)]",
  link:
    "hover:!text-[var(--ui-text-secondary)] hover:underline hover:underline-offset-3 active:!text-[var(--ui-text-secondary)]",
};

const BUTTON_GROUP_ICON_SIZE: Record<ButtonSize, string> = {
  sm: "!h-[21px] !w-[21px]",
  md: "!h-[28px] !w-[28px]",
  lg: "!h-[36px] !w-[36px]",
};

export function buttonGroupClassName({
  variant = "secondary",
  round = "sm",
  disabled = false,
  className = "",
}: {
  variant?: ButtonVariant;
  round?: ButtonRound;
  disabled?: boolean;
  className?: string;
} = {}): string {
  return [
    "inline-flex items-stretch overflow-hidden select-none",
    BUTTON_GROUP_VARIANT[variant],
    BUTTON_ROUND[round],
    disabled ? "opacity-40 pointer-events-none" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export const BUTTON_GROUP_ITEM_WRAP_CLASS = "flex items-stretch";

/** Classes a group appends to each child Button (React clones, Vue clones vnodes). */
export function buttonGroupItemClassName({
  variant = "secondary",
  index = 0,
  iconMode = false,
  size = "md",
  className = "",
}: {
  variant?: ButtonVariant;
  index?: number;
  iconMode?: boolean;
  size?: ButtonSize;
  className?: string;
} = {}): string {
  return [
    "rounded-none !border-0 shadow-none active:scale-100",
    index > 0 ? `!border-l ${BUTTON_GROUP_DIVIDER[variant]}` : "",
    iconMode ? BUTTON_GROUP_ICON_SIZE[size] : " pl-2.5",
    BUTTON_GROUP_ITEM_VARIANT[variant],
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

// ─── IconTabBar ──────────────────────────────────────────────────────────────

export function iconTabBarClassName(className = ""): string {
  return ["flex items-center gap-1", className].filter(Boolean).join(" ");
}

export function iconTabClassName({
  active,
  pushEnd = false,
}: {
  active: boolean;
  pushEnd?: boolean;
}): string {
  return [
    "iconTab",
    pushEnd ? "ml-auto" : "",
    "flex items-center overflow-hidden rounded-[var(--ui-radius-md)] transition-all duration-200 ease-out",
    active ? "iconTab--active text-txt" : "text-txt-tertiary hover:text-txt-secondary",
  ]
    .filter(Boolean)
    .join(" ");
}

export const ICON_TAB_ICON_WRAP_CLASS = "relative inline-flex flex-none items-center justify-center";

export function iconTabIconInnerClassName(iconClassName?: string): string {
  return ["inline-flex items-center justify-center", iconClassName ?? ""].filter(Boolean).join(" ");
}

export const ICON_TAB_BADGE_CLASS =
  "pointer-events-none absolute top-[-4px] right-[-4px] flex h-[11px] min-w-[11px] items-center justify-center rounded-full bg-badge px-[3px] text-[8px] font-bold leading-none text-white";

export function iconTabLabelClassName(active: boolean): string {
  return [
    "iconTabLabel whitespace-nowrap text-[14px] font-bold transition-all duration-150",
    active ? "ml-1 opacity-100" : "ml-0 max-w-0 opacity-0",
  ].join(" ");
}

// ─── StepSlider ──────────────────────────────────────────────────────────────

export const STEP_SLIDER_ROOT_CLASS = "flex w-[160px] flex-col gap-2 px-1";
export const STEP_SLIDER_LABELS_ROW_CLASS = "relative h-[18px]";
export const STEP_SLIDER_TRACK_CLASS = "relative my-1.5 h-0.5 rounded-[1px] bg-[var(--ui-border-subtle)]";
export const STEP_SLIDER_FILL_CLASS =
  "absolute left-0 top-0 h-full rounded-[1px] bg-[var(--ui-accent)] transition-[width] duration-200 ease-in-out";
export const STEP_SLIDER_THUMB_CLASS =
  "pointer-events-none absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--ui-bg-elevated)] bg-[var(--ui-accent)] shadow-[0_0_0_3px_color-mix(in_srgb,var(--ui-accent)_20%,transparent)] transition-[left] duration-200 ease-in-out";

export function stepSliderLabelClassName(active: boolean): string {
  return [
    "absolute top-0 -translate-x-1/2 cursor-pointer whitespace-nowrap border-0 bg-transparent p-0 text-[13px] font-medium leading-[13px] text-[var(--ui-text-secondary)] transition-colors duration-150",
    active ? "font-semibold text-[var(--ui-accent)]" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export function stepSliderDotClassName(active: boolean): string {
  return [
    "group absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full border-0 bg-transparent",
    "after:absolute after:left-1/2 after:top-1/2 after:h-1.5 after:w-1.5 after:-translate-x-1/2 after:-translate-y-1/2 after:rounded-full after:bg-[color-mix(in_srgb,var(--ui-accent)_80%,transparent)] after:transition-[background,transform] after:duration-150 hover:after:bg-[var(--ui-accent)] hover:after:scale-[1.3]",
    active ? "after:bg-transparent hover:after:bg-transparent hover:after:scale-100" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

// ─── SecretInput ─────────────────────────────────────────────────────────────

export const SECRET_INPUT_ROOT_CLASS = "relative";
export const SECRET_INPUT_REVEAL_CLASS =
  "absolute right-1.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-sm text-txt-tertiary transition-colors duration-120 hover:text-txt-secondary hover:bg-sf-hover disabled:opacity-40 disabled:cursor-default";

export function secretInputInputClassName(className?: string): string {
  return ["pr-9", className ?? ""].filter(Boolean).join(" ");
}

// ─── InlineSelect ────────────────────────────────────────────────────────────

export function inlineSelectButtonClassName(buttonClassName?: string): string {
  return [
    "!h-auto min-w-0 gap-1.5 !px-2 !py-1 !text-[14px] !text-[var(--ui-text-secondary)] tabular-nums hover:!text-[var(--ui-primary)]",
    buttonClassName ?? "",
  ]
    .filter(Boolean)
    .join(" ");
}

export function inlineSelectChevronClassName(open: boolean): string {
  return [
    "shrink-0 text-[var(--ui-text-tertiary)] transition-transform duration-120",
    open ? "rotate-180" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export const INLINE_SELECT_LABEL_CLASS = "min-w-0 overflow-hidden text-ellipsis whitespace-nowrap";

export function inlineSelectMenuClassName(menuClassName?: string): string {
  return ["min-w-[160px]", menuClassName ?? ""].filter(Boolean).join(" ");
}

// ─── Select triggers (DropdownSelect / MultiSelect / InputSelect) ───────────

export interface SelectTriggerMetrics {
  /** Horizontal padding of the value area. */
  px: string;
  /** Vertical padding of the value area — this is what sets the control height. */
  py: string;
  text: string;
  /** Chevron glyph size in px. */
  chevron: number;
  /** Square hit box behind the chevron. */
  chevronBox: string;
}

/**
 * Trigger metrics shared by `DropdownSelect`, `MultiSelect` and `InputSelect`.
 * Keeping one table is what makes the three controls line up pixel-for-pixel
 * when they sit next to each other in the same form.
 */
export const SELECT_TRIGGER_SIZE: Record<InputSize, SelectTriggerMetrics> = {
  sm: { px: "px-2.5", py: "py-0.5", text: "text-[12px]", chevron: 12, chevronBox: "h-[18px] w-[18px]" },
  md: { px: "px-3",   py: "py-1.5", text: "text-[14px]", chevron: 15, chevronBox: "h-[24px] w-[24px]" },
  lg: { px: "px-3",   py: "py-2",   text: "text-[15px]", chevron: 16, chevronBox: "h-[26px] w-[26px]" },
};

/**
 * Radius of the chevron hit box. It is intentionally one step tighter than the
 * outer shell so the box never pokes out of a rounded corner.
 */
export const SELECT_CHEVRON_ROUND: Record<InputRound, string> = {
  sm:   "rounded-[var(--ui-radius-sm)]",
  md:   "rounded-[var(--ui-radius-sm)]",
  lg:   "rounded-[var(--ui-radius-md)]",
  full: "rounded-full",
};

/** Classes for the value area of a trigger (everything left of the chevron). */
export function selectValueClass(size: InputSize): string {
  return `min-w-0 flex-1 truncate ${SELECT_TRIGGER_SIZE[size].px} ${SELECT_TRIGGER_SIZE[size].py}`;
}

/**
 * An empty value area collapses its line box, which would make the trigger
 * shorter than a filled one (the chevron box would end up setting the height).
 * Falling back to a non-breaking space keeps every trigger the same height,
 * with or without a value or a placeholder.
 */
export function selectValueText(text: string | undefined): string {
  return text === undefined || text === "" ? "\u00A0" : text;
}

/** Chevron box classes for a given size / radius / open state. */
export function selectChevronClass(size: InputSize, round: InputRound, open: boolean): string {
  return [
    "grid flex-none place-items-center text-txt-tertiary transition-colors duration-120",
    SELECT_TRIGGER_SIZE[size].chevronBox,
    SELECT_CHEVRON_ROUND[round],
    open ? "bg-sf-hover text-txt" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

// ─── InputSelect ─────────────────────────────────────────────────────────────

export const INPUT_SELECT_ROOT_CLASS = "relative block";

export function inputSelectShellClassName({
  size = "md",
  round = "md",
  variant = "default",
  error = false,
  active = false,
  open = false,
}: {
  size?: InputSize;
  round?: InputRound;
  variant?: InputVariant;
  error?: boolean;
  active?: boolean;
  open?: boolean;
} = {}): string {
  return [
    "flex min-w-0 items-center overflow-hidden pr-1 text-txt transition-all duration-120",
    SELECT_TRIGGER_SIZE[size].text,
    INPUT_ROUND_CLASS[round],
    inputStateClass({ error, variant: active ? "default" : variant }),
    // focus-within covers both input focus and button focus at CSS level
    !error
      ? "focus-within:border-[color-mix(in_srgb,var(--ui-accent)_36%,var(--ui-border-subtle))] focus-within:shadow-[0_0_0_3px_color-mix(in_srgb,var(--ui-accent)_5%,transparent)]"
      : "",
    // open state: apply accent ring directly via JS since CSS can't detect prop changes
    open && !error
      ? "border-[color-mix(in_srgb,var(--ui-accent)_36%,var(--ui-border-subtle))] shadow-[0_0_0_3px_color-mix(in_srgb,var(--ui-accent)_5%,transparent)]"
      : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export function inputSelectInputClassName({
  size = "md",
  mono = false,
  className = "",
}: { size?: InputSize; mono?: boolean; className?: string } = {}): string {
  return [
    INPUT_BASE_CLASS,
    SELECT_TRIGGER_SIZE[size].px,
    SELECT_TRIGGER_SIZE[size].py,
    // The shell draws the border, ring and background for the whole control.
    "border-0 bg-transparent text-inherit shadow-none focus:shadow-none",
    mono ? "font-mono" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function selectChevronIconClassName(open: boolean): string {
  return ["transition-transform duration-150", open ? "rotate-180" : ""].filter(Boolean).join(" ");
}

export function inputSelectChevronClassName({
  size = "md",
  round = "md",
  open = false,
}: { size?: InputSize; round?: InputRound; open?: boolean } = {}): string {
  return [
    selectChevronClass(size, round, open),
    "cursor-pointer border-0 p-0 outline-none hover:bg-sf-hover hover:text-txt",
    open ? "" : "bg-transparent",
  ]
    .filter(Boolean)
    .join(" ");
}

// ─── DropdownSelect / MultiSelect trigger + menu ────────────────────────────

export function dropdownRootClassName(className = ""): string {
  return ["relative block", className].filter(Boolean).join(" ");
}

export function dropdownTriggerClassName({
  round = "md",
  size = "md",
  block = false,
  open = false,
}: {
  round?: InputRound;
  size?: InputSize;
  block?: boolean;
  open?: boolean;
} = {}): string {
  return [
    "flex min-w-0 items-center border bg-sf-elevated pr-1 text-left text-txt outline-none transition-all duration-120 hover:border-border focus:border-[color-mix(in_srgb,var(--ui-accent)_36%,var(--ui-border-subtle))] focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--ui-accent)_5%,transparent)]",
    INPUT_ROUND_CLASS[round],
    SELECT_TRIGGER_SIZE[size].text,
    block ? "w-full" : "",
    open
      ? "border-[color-mix(in_srgb,var(--ui-accent)_36%,var(--ui-border-subtle))] shadow-[0_0_0_3px_color-mix(in_srgb,var(--ui-accent)_5%,transparent)]"
      : "border-border",
  ]
    .filter(Boolean)
    .join(" ");
}

export function dropdownMenuPanelClassName({
  block = false,
  placement = "bottom",
}: { block?: boolean; placement?: "top" | "bottom" } = {}): string {
  return [
    "absolute max-w-[min(420px,calc(100vw-24px))] p-2",
    block ? "left-0 w-full" : "right-0 min-w-full",
    placement === "top" ? "bottom-[calc(100%+8px)]" : "top-[calc(100%+2px)]",
  ].join(" ");
}

export function dropdownMenuPopoverClassName(block = false): string {
  return block ? "p-2" : "max-w-[min(420px,calc(100vw-24px))] p-2";
}

export const DROPDOWN_OPTION_ROW_CLASS = "min-h-[42px] justify-between gap-4 px-3.5";
export const DROPDOWN_OPTION_LABEL_CLASS = "min-w-0 truncate";
export const DROPDOWN_OPTION_DETAIL_CLASS = "font-mono text-[12px] text-txt-tertiary";

// ─── SearchField ─────────────────────────────────────────────────────────────

export function searchFieldRootClassName({
  focused = false,
  active = false,
  rootClassName = "",
}: { focused?: boolean; active?: boolean; rootClassName?: string } = {}): string {
  return [
    "group/searchField sidebarSearchControl flex min-h-[28px] w-full items-center gap-2 rounded-sm px-2 transition-colors duration-120",
    focused ? "sidebarSearchControl--focused" : "",
    active ? "sidebarSearchControl--active" : "",
    rootClassName,
  ]
    .filter(Boolean)
    .join(" ");
}

export function searchFieldInputClassName({
  focused = false,
  inputClassName = "",
}: { focused?: boolean; inputClassName?: string } = {}): string {
  return [
    "sidebarSearchControl__input",
    focused ? "cursor-text!" : "",
    "min-w-0 flex-1 bg-transparent border-0 outline-none",
    inputClassName,
  ]
    .filter(Boolean)
    .join(" ");
}

export const SEARCH_FIELD_ICON_CLASS = "sidebarSearchControl__icon flex-none";

export function searchFieldActionClassName(actionClassName = ""): string {
  return ["sidebarSearchControl__action", actionClassName].filter(Boolean).join(" ");
}

export function searchFieldKbdClassName(kbdClassName = ""): string {
  return [
    "sidebarSearchControl__kbd opacity-0 transition-opacity duration-120 group-hover/searchField:opacity-100",
    kbdClassName,
  ]
    .filter(Boolean)
    .join(" ");
}

export function searchFieldClearClassName(clearClassName = ""): string {
  return [
    "sidebarSearchControl__clear grid place-items-center w-6 h-6 rounded-sm text-txt-tertiary hover:bg-sf-hover hover:text-txt-secondary transition-colors duration-120",
    clearClassName,
  ]
    .filter(Boolean)
    .join(" ");
}

// ─── MultiSelect ─────────────────────────────────────────────────────────────

export function multiSelectRootClassName(className = ""): string {
  return ["relative block", className].filter(Boolean).join(" ");
}

export function multiSelectTriggerClassName({
  round = "md",
  size = "md",
  empty = false,
  open = false,
}: {
  round?: InputRound;
  size?: InputSize;
  empty?: boolean;
  open?: boolean;
} = {}): string {
  return [
    "flex w-full min-w-0 items-center border bg-sf-elevated pr-1 text-left outline-none transition-all duration-120 disabled:opacity-50 hover:border-border focus:border-[color-mix(in_srgb,var(--ui-accent)_36%,var(--ui-border-subtle))] focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--ui-accent)_5%,transparent)]",
    INPUT_ROUND_CLASS[round],
    SELECT_TRIGGER_SIZE[size].text,
    empty ? "text-txt-tertiary" : "text-txt",
    open
      ? "border-[color-mix(in_srgb,var(--ui-accent)_36%,var(--ui-border-subtle))] shadow-[0_0_0_3px_color-mix(in_srgb,var(--ui-accent)_5%,transparent)]"
      : "border-border",
  ].join(" ");
}

export const MULTISELECT_TRAILING_CLASS = "flex items-center gap-2";

export function multiSelectCheckClassName(active: boolean): string {
  return active ? "text-accent" : "opacity-0";
}

// ─── TimePicker ──────────────────────────────────────────────────────────────

export function timePickerRootClassName(className = ""): string {
  return ["relative inline-block", className].filter(Boolean).join(" ");
}

export function timePickerChevronClassName(open: boolean): string {
  return [
    "shrink-0 text-[var(--ui-text-tertiary)] transition-transform duration-120",
    open ? "rotate-180" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export const TIME_PICKER_CLOCK_CLASS = "shrink-0 text-[var(--ui-text-tertiary)]";
export const TIME_PICKER_PLAIN_TRIGGER_CLASS =
  "!h-auto min-w-0 gap-1.5 !px-2 !py-1 !text-[14px] !text-[var(--ui-text-secondary)] tabular-nums hover:!text-[var(--ui-text-primary)]";

export function timePickerTriggerClassName(open: boolean): string {
  return [
    "tabular-nums !text-[13.5px] !px-2.5",
    open
      ? "!border-[color-mix(in_srgb,var(--ui-accent)_60%,transparent)] ring-2 ring-[color-mix(in_srgb,var(--ui-accent)_15%,transparent)]"
      : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export const TIME_PICKER_PANEL_CLASS = "absolute left-0 top-[calc(100%+6px)] z-50 flex gap-1 p-2 min-w-0";
export const TIME_PICKER_COLUMN_CLASS = "flex flex-col";
export const TIME_PICKER_COLUMN_LABEL_CLASS =
  "mb-1.5 text-center text-[12px] font-semibold uppercase tracking-widest text-[var(--ui-text-tertiary)] select-none";
export const TIME_PICKER_COLUMN_SCROLL_CLASS = "h-[168px] w-[52px] flex flex-col gap-0.5";

export function timePickerItemClassName(active: boolean): string {
  return [
    "menuActionRow h-auto max-h-[16px] justify-center !py-[7px] !px-0 w-[52px] shrink-0 font-mono !text-[13px] !font-normal",
    active ? "menuActionRow--active" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

// ─── ConfirmDialog ───────────────────────────────────────────────────────────

export const CONFIRM_CLOSE_BUTTON_CLASS = "absolute right-3 top-3 z-10";
export const CONFIRM_TITLE_CLASS = "m-0 text-[15px] font-semibold leading-5 text-txt";
export const CONFIRM_DESCRIPTION_CLASS = "mt-2 mb-0 text-[13px] leading-5 text-txt-secondary";
export const CONFIRM_FOOTER_CLASS = "flex shrink-0 items-center justify-end gap-2 border-t border-border-subtle px-4 py-3";
export const CONFIRM_ACTION_CLASS = "min-w-[76px]";

export function confirmShellClassName(shellClassName?: string): string {
  return `relative ${shellClassName ?? "w-[min(360px,calc(100vw-32px))]"}`;
}

export function confirmBodyClassName({
  showCloseButton = false,
  hideTitle = false,
  bodyClassName = "",
}: { showCloseButton?: boolean; hideTitle?: boolean; bodyClassName?: string } = {}): string {
  return ["px-5 pt-5 pb-[18px]", showCloseButton && !hideTitle ? "pr-12" : "", bodyClassName]
    .filter(Boolean)
    .join(" ");
}

export function confirmContentClassName({
  contentClassName,
  hideTitle = false,
}: { contentClassName?: string; hideTitle?: boolean } = {}): string {
  return [contentClassName ?? "max-h-[50vh]", hideTitle ? "" : "mt-3"].filter(Boolean).join(" ");
}

// ─── DialogMessage ───────────────────────────────────────────────────────────

export function dialogMessageClassName(className = ""): string {
  return ["space-y-1.5 text-[13px] leading-[20px]", className].filter(Boolean).join(" ");
}

export const DIALOG_MESSAGE_BLANK_LINE_CLASS = "h-2";
export const DIALOG_MESSAGE_IMAGE_ROW_CLASS = "flex justify-center py-1.5";
export const DIALOG_MESSAGE_IMAGE_CLASS =
  "max-h-[min(60vh,420px)] max-w-full rounded-[var(--ui-radius-md)] object-contain";

export function dialogMessageLineClassName(tone: "default" | "muted" | "warning" = "default"): string {
  const toneClass =
    tone === "muted" ? "text-txt-tertiary" : tone === "warning" ? "text-amber-500" : "text-txt-secondary";
  return ["m-0 whitespace-pre-wrap", toneClass].join(" ");
}

export const DIALOG_INLINE_CODE_CLASS = "font-mono text-[0.95em] text-txt";

export const DIALOG_INLINE_SUFFIX_CLASS: Record<string, string> = {
  g: "text-ok-text",
  r: "text-err-text",
  y: "text-amber-400",
  m: "text-txt-tertiary",
  a: "text-accent",
  b: "font-medium text-txt",
  i: "italic",
};

// ─── ScrollArea ──────────────────────────────────────────────────────────────

export function scrollAreaClassName({
  orientation = "vertical",
  className = "",
}: { orientation?: "vertical" | "horizontal"; className?: string } = {}): string {
  return [
    "appScrollbar",
    orientation === "horizontal" ? "overflow-x-auto overflow-y-hidden" : "overflow-y-auto",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}
