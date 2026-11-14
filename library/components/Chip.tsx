import { forwardRef } from "react";
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { X } from "lucide-react";

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

const CHIP_CLASS = "inline-flex items-center gap-1.5 rounded-[var(--ui-radius-sm)] px-2.5 py-1.5 text-[12px] font-normal text-txt-secondary";

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
    <span ref={ref} className={`${CHIP_CLASS} ${className}`.trim()} {...props}>
      {leadingIcon}
      {children}
      {trailing}
      {onRemove ? (
        <button
          className="inline-flex h-4 w-4 items-center justify-center rounded-full text-txt-tertiary transition-colors duration-120 hover:bg-err-dim hover:text-err"
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
      className={`${CHIP_CLASS} bg-sf hover:bg-sf-hover hover:text-txt transition-colors duration-120 disabled:opacity-50 ${className}`.trim()}
      {...props}
    >
      {leadingIcon}
      {children}
      {trailing}
    </button>
  );
}
