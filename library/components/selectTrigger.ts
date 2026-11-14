import type { InputRound, InputSize } from "./Input";

/**
 * Trigger metrics shared by `DropdownSelect`, `MultiSelect` and `InputSelect`.
 * Keeping one table is what makes the three controls line up pixel-for-pixel
 * when they sit next to each other in the same form.
 */
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
  ].filter(Boolean).join(" ");
}
