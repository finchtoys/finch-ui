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
import {
  INPUT_ERROR_TEXT_CLASS,
  INPUT_HINT_CLASS,
  INPUT_LABEL_CLASS,
  INPUT_SELECT_ROOT_CLASS,
  inputSelectChevronClassName,
  inputSelectInputClassName,
  inputSelectShellClassName,
  selectChevronIconClassName,
} from "../styles/classes";

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
  const shellClass = inputSelectShellClassName({ size, round, variant, error: hasError, active, open });
  const inputClass = inputSelectInputClassName({ size, mono, className });

  return (
    <div className={INPUT_SELECT_ROOT_CLASS}>
      {label ? <span className={INPUT_LABEL_CLASS}>{label}</span> : null}
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
          className={inputSelectChevronClassName({ size, round, open })}
          title={buttonTitle}
          aria-expanded={open}
          {...buttonProps}
          onClick={onToggleOpen}
        >
          <ChevronDown
            size={SELECT_TRIGGER_SIZE[size].chevron}
            className={selectChevronIconClassName(open)}
          />
        </button>
      </span>
      {children}
      {error ? <span className={INPUT_ERROR_TEXT_CLASS}>{error}</span> : null}
      {!error && hint ? <span className={INPUT_HINT_CLASS}>{hint}</span> : null}
    </div>
  );
});

InputSelect.displayName = "InputSelect";
