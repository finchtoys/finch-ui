import { forwardRef } from "react";
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { X } from "lucide-react";
import { CHIP_REMOVE_BUTTON_CLASS, actionChipClassName, chipClassName } from "../styles/classes";

interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  leadingIcon?: ReactNode;
  trailing?: ReactNode;
  removeLabel?: string;
  onRemove?: () => void;
}

interface ActionChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  leadingIcon?: ReactNode;
  trailing?: ReactNode;
}

// forwardRef so `Chip` can sit inside `Tooltip`, which needs the trigger's DOM
// node to position itself.
export const Chip = forwardRef<HTMLSpanElement, ChipProps>(function Chip({
  leadingIcon,
  trailing,
  removeLabel = "Remove",
  onRemove,
  className = "",
  children,
  ...props
}, ref) {
  return (
    <span ref={ref} className={chipClassName(className)} {...props}>
      {leadingIcon}
      {children}
      {trailing}
      {onRemove ? (
        <button
          className={CHIP_REMOVE_BUTTON_CLASS}
          title={removeLabel}
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          type="button"
        >
          <X size={13} />
        </button>
      ) : null}
    </span>
  );
});

export function ActionChip({
  leadingIcon,
  trailing,
  className = "",
  children,
  type = "button",
  ...props
}: ActionChipProps) {
  return (
    <button
      type={type}
      className={actionChipClassName(className)}
      {...props}
    >
      {leadingIcon}
      {children}
      {trailing}
    </button>
  );
}
