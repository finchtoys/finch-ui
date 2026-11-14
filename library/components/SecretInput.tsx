import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input, type InputRound } from "./Input";
import { SECRET_INPUT_REVEAL_CLASS, SECRET_INPUT_ROOT_CLASS, secretInputInputClassName } from "../styles/classes";

interface SecretInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
  showPasswordLabel: string;
  hidePasswordLabel: string;
  /** Corner radius forwarded to the underlying Input. Default: "md". */
  round?: InputRound;
}

/**
 * Masked text input with an eye/eye-off reveal toggle floating inside the right
 * edge. Shared by the mini tool dialog forms (`ExtensionFormFields`) and the
 * native settings form so both render secrets identically.
 */
export const SecretInput = forwardRef<HTMLInputElement, SecretInputProps>(function SecretInput(
  { showPasswordLabel, hidePasswordLabel, round = "md", className, disabled, ...rest },
  ref,
) {
  const [revealed, setRevealed] = useState(false);
  const revealLabel = revealed ? hidePasswordLabel : showPasswordLabel;

  return (
    <div className={SECRET_INPUT_ROOT_CLASS}>
      <Input
        ref={ref}
        type={revealed ? "text" : "password"}
        round={round}
        disabled={disabled}
        className={secretInputInputClassName(className)}
        {...rest}
      />
      <button
        type="button"
        tabIndex={-1}
        disabled={disabled}
        aria-label={revealLabel}
        title={revealLabel}
        className={SECRET_INPUT_REVEAL_CLASS}
        onClick={() => setRevealed((prev) => !prev)}
      >
        {revealed ? <EyeOff size={15} strokeWidth={1.5} /> : <Eye size={15} strokeWidth={1.5} />}
      </button>
    </div>
  );
});
