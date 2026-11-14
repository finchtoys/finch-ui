import { forwardRef, useState } from "react";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import {
  INPUT_BASE_CLASS,
  INPUT_ROUND_CLASS,
  inputStateClass,
  type InputRound,
  type InputSize,
  type InputVariant,
} from "./Input";
import { SELECT_TRIGGER_SIZE, selectChevronClass } from "./selectTrigger";

interface InputSelectProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  mono?: boolean;
  variant?: InputVariant;
  round?: InputRound;
  /** Height / font size, shared with DropdownSelect and MultiSelect. Default: "md". */
  size?: InputSize;
  open?: boolean;
  buttonRef?: React.Ref<HTMLButtonElement>;
  buttonTitle?: string;
  buttonProps?: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "type">;
  onToggleOpen?: () => void;
  children?: ReactNode;
}

export const InputSelect = forwardRef<HTMLInputElement, InputSelectProps>(function InputSelect(
  {
    label,
    hint,
    error,
    mono = false,
    variant = "default",
    round = "md",
    size = "md",
    open = false,
    buttonRef,
    buttonTitle,
    buttonProps,
    onToggleOpen,
    className = "",
    children,
    ...props
  },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const hasError = Boolean(error);
  const active = open || focused;
  // Same shell as the DropdownSelect / MultiSelect trigger: the value area owns
  // the padding, and `pr-1` leaves room for the chevron box.
  const shellClass = [
    "flex min-w-0 items-center overflow-hidden pr-1 text-txt transition-all duration-120",
    SELECT_TRIGGER_SIZE[size].text,
    INPUT_ROUND_CLASS[round],
    inputStateClass({ error: hasError, variant: active ? "default" : variant }),
    // focus-within covers both input focus and button focus at CSS level
    !hasError
      ? "focus-within:border-[color-mix(in_srgb,var(--ui-accent)_36%,var(--ui-border-subtle))] focus-within:shadow-[0_0_0_3px_color-mix(in_srgb,var(--ui-accent)_5%,transparent)]"
      : "",
    // open state: apply accent ring directly via JS since CSS can't detect prop changes
    open && !hasError
      ? "border-[color-mix(in_srgb,var(--ui-accent)_36%,var(--ui-border-subtle))] shadow-[0_0_0_3px_color-mix(in_srgb,var(--ui-accent)_5%,transparent)]"
      : "",
  ].filter(Boolean).join(" ");
  const inputClass = [
    INPUT_BASE_CLASS,
    SELECT_TRIGGER_SIZE[size].px,
    SELECT_TRIGGER_SIZE[size].py,
    // The shell draws the border, ring and background for the whole control.
    "border-0 bg-transparent text-inherit shadow-none focus:shadow-none",
    mono ? "font-mono" : "",
    className,
  ].filter(Boolean).join(" ");

  return (
    <div className="relative block">
      {label ? <span className="mb-1.5 block text-[12px] font-medium text-txt-secondary">{label}</span> : null}
      <span className={shellClass}>
        <input
          ref={ref}
          className={inputClass}
          {...props}
          aria-invalid={hasError || props["aria-invalid"]}
          onFocus={(event) => {
            setFocused(true);
            props.onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            props.onBlur?.(event);
          }}
        />
        <button
          ref={buttonRef}
          type="button"
          // `bg-transparent` is dropped while open so the shared open-state background survives.
          className={[
            selectChevronClass(size, round, open),
            "cursor-pointer border-0 p-0 outline-none hover:bg-sf-hover hover:text-txt",
            open ? "" : "bg-transparent",
          ].filter(Boolean).join(" ")}
          title={buttonTitle}
          aria-expanded={open}
          {...buttonProps}
          onClick={onToggleOpen}
        >
          <ChevronDown
            size={SELECT_TRIGGER_SIZE[size].chevron}
            className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`}
          />
        </button>
      </span>
      {children}
      {error ? <span className="mt-1.5 block text-[12px] font text-err-text">{error}</span> : null}
      {!error && hint ? <span className="mt-1.5 block text-[12px] font text-txt-tertiary">{hint}</span> : null}
    </div>
  );
});

InputSelect.displayName = "InputSelect";
