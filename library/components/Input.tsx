import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import {
  INPUT_ERROR_TEXT_CLASS,
  INPUT_HINT_CLASS,
  INPUT_LABEL_CLASS,
  INPUT_ROOT_CLASS,
  INPUT_ROW_CLASS,
  inputClassName,
} from "../styles/classes";
import type { InputRound, InputSize, InputVariant } from "../styles/classes";

// Class strings, size/round tables and state composition live in
// styles/classes.ts. Re-exported here because they are part of this module's
// public surface (InputSelect / TextArea build on them).
export {
  INPUT_BASE_CLASS,
  INPUT_DEFAULT_CLASS,
  INPUT_ERROR_CLASS,
  INPUT_GHOST_CLASS,
  INPUT_PLAIN_CLASS,
  INPUT_ROUND_CLASS,
  INPUT_SIZE_CLASS,
  inputStateClass,
} from "../styles/classes";
export type { InputRound, InputSize, InputVariant };

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
  const inputClass = inputClassName({ error: hasError, variant, round, size, mono, className });

  return (
    <label className={`${INPUT_ROOT_CLASS} ${rootClassName}`.trim()}>
      {label ? (
        <span className={`${INPUT_LABEL_CLASS} ${labelClassName ?? ""}`.trim()}>
          {label}
        </span>
      ) : null}
      <span className={INPUT_ROW_CLASS}>
        <input
          ref={ref}
          className={inputClass}
          {...props}
          aria-invalid={hasError || props["aria-invalid"]}
        />
        {endAdornment}
      </span>
      {error ? <span className={INPUT_ERROR_TEXT_CLASS}>{error}</span> : null}
      {!error && hint ? <span className={INPUT_HINT_CLASS}>{hint}</span> : null}
    </label>
  );
});
