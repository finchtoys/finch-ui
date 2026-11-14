import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input, type InputRound } from "./Input";

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
    <div className="relative">
      <Input
        ref={ref}
        type={revealed ? "text" : "password"}
        round={round}
        disabled={disabled}
        className={`pr-9 ${className ?? ""}`}
        {...rest}
      />
      <button
        type="button"
        tabIndex={-1}
        disabled={disabled}
        aria-label={revealLabel}
        title={revealLabel}
        className="absolute right-1.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-sm text-txt-tertiary transition-colors duration-120 hover:text-txt-secondary hover:bg-sf-hover disabled:opacity-40 disabled:cursor-default"
        onClick={() => setRevealed((prev) => !prev)}
      >
        {revealed ? <EyeOff size={15} strokeWidth={1.5} /> : <Eye size={15} strokeWidth={1.5} />}
      </button>
    </div>
  );
});
