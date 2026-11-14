import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

export type InputVariant = "default" | "ghost" | "plain";
export type InputRound = "sm" | "md" | "lg" | "full";
export type InputSize = "sm" | "md" | "lg";

// ── Size: padding + font ──────────────────────────────────────────────────────
export const INPUT_SIZE_CLASS: Record<InputSize, string> = {
  sm: "px-2.5 py-0.5 text-[12px]",
  md: "px-3 py-1.5 text-[14px]",
  lg: "px-4 py-2.5 text-[15px]",
};

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: ReactNode;
  /** Override the label's typography/colour (defaults to secondary text). */
  labelClassName?: string;
  hint?: ReactNode;
  error?: ReactNode;
  endAdornment?: ReactNode;
  /** Classes applied to the outer label element. */
  rootClassName?: string;
  mono?: boolean;
  variant?: InputVariant;
  /** Corner radius. Default: "md". */
  round?: InputRound;
  /** Height / font size. Default: "md". */
  size?: InputSize;
}

export const INPUT_ROUND_CLASS: Record<InputRound, string> = {
  sm: "rounded-[var(--ui-radius-sm)]",
  md: "rounded-[var(--ui-radius-md)]",
  lg: "rounded-[var(--ui-radius-lg)]",
  full: "rounded-full",
};

export const INPUT_BASE_CLASS = "min-w-0 flex-1 font-medium text-txt outline-none placeholder:text-txt-tertiary transition-all duration-120";
export const INPUT_DEFAULT_CLASS = "border border-border bg-sf-elevated focus:border-[color-mix(in_srgb,var(--ui-accent)_36%,var(--ui-border-subtle))] focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--ui-accent)_5%,transparent)]";
export const INPUT_GHOST_CLASS = "border-1 border-transparent bg-transparent hover:bg-[var(--ui-accent-dim)] focus:border-[color-mix(in_srgb,var(--ui-accent)_30%,transparent)] focus:bg-sf-elevated focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--ui-accent)_5%,transparent)]";
/** 完全融入页面：没有背景、边框与聚焦框，只留下文字本身。 */
export const INPUT_PLAIN_CLASS = "border-0 bg-transparent";
export const INPUT_ERROR_CLASS = "border border-err shadow-[0_0_0_2px_var(--ui-danger-dim)] focus:border-err focus:shadow-[0_0_0_3px_var(--ui-danger-dim)]";

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

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({
  label,
  labelClassName,
  hint,
  error,
  endAdornment,
  rootClassName = "",
  className = "",
  mono = false,
  variant = "default",
  round = "md",
  size = "md",
  ...props
}, ref) {
  const hasError = Boolean(error);
  const inputClass = [
    INPUT_BASE_CLASS,
    INPUT_SIZE_CLASS[size],
    INPUT_ROUND_CLASS[round],
    inputStateClass({ error: hasError, variant }),
    mono ? "font-mono" : "",
    className,
  ].filter(Boolean).join(" ");

  return (
    <label className={`block ${rootClassName}`.trim()}>
      {label ? (
        <span className={`mb-1.5 block text-[12px] font-medium text-txt-secondary ${labelClassName ?? ""}`.trim()}>
          {label}
        </span>
      ) : null}
      <span className="flex items-center gap-2">
        <input
          ref={ref}
          className={inputClass}
          {...props}
          aria-invalid={hasError || props["aria-invalid"]}
        />
        {endAdornment}
      </span>
      {error ? <span className="mt-1.5 block text-[12px] font text-err-text">{error}</span> : null}
      {!error && hint ? <span className="mt-1.5 block text-[12px] font text-txt-tertiary">{hint}</span> : null}
    </label>
  );
});
