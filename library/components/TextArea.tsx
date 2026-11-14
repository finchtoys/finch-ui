import { forwardRef } from "react";
import type { TextareaHTMLAttributes } from "react";
import { textAreaClassName } from "../styles/classes";
import type { InputRound, InputVariant } from "../styles/classes";

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  unstyled?: boolean;
  variant?: InputVariant;
  round?: InputRound;
  error?: boolean;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  { className = "", unstyled = false, variant = "default", round = "md", error = false, ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      className={textAreaClassName({ unstyled, variant, round, error, className })}
      {...props}
      aria-invalid={error || props["aria-invalid"]}
    />
  );
});
