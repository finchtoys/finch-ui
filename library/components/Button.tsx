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
import {
  BUTTON_DEFAULT_CLASS,
  buttonClassName,
  buttonSpanClassName,
} from "../styles/classes";
import type { ButtonRound, ButtonSize, ButtonVariant } from "../styles/classes";

export type { ButtonRound, ButtonSize, ButtonVariant };

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

// Design language, variant tables and class composition live in
// styles/classes.ts — shared with every other renderer of these components.
// ─────────────────────────────────────────────────────────────────────────────

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
    className = BUTTON_DEFAULT_CLASS,
    type = "button",
    disabled,
    ...props
  },
  ref,
) {
  const isIconMode = icon != null;

  const composedClassName = buttonClassName({
    variant,
    size,
    round,
    iconMode: isIconMode,
    pressed,
    className,
  });

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
        className={buttonSpanClassName(composedClassName, disabled)}
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
