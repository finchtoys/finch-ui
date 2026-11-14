import { useRef, useState } from "react";
import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "./Button";
import { MenuItem, MenuPopover, MenuSeparator } from "./Menu";

export interface InlineSelectOption<T extends string | number> {
  value: T;
  label: string;
  icon?: ReactNode;
  separatorBefore?: boolean;
}

export interface InlineSelectProps<T extends string | number> {
  value: T;
  options: InlineSelectOption<T>[];
  onChange: (value: T) => void;
  renderLabel?: (option: InlineSelectOption<T>) => string;
  className?: string;
  /** Extra classes appended to the trigger Button itself (e.g. `font-bold`). */
  buttonClassName?: string;
  menuClassName?: string;
  align?: "left" | "right";
}

/**
 * Compact inline selector: ghost Button + chevron + menu.
 * For prop rows and low-chrome settings where a full Field is too heavy.
 */
export function InlineSelect<T extends string | number>({
  value,
  options,
  onChange,
  renderLabel,
  className,
  buttonClassName,
  menuClassName,
  align = "left",
}: InlineSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const selected = options.find((option) => option.value === value) ?? options[0];
  const displayLabel = selected
    ? renderLabel?.(selected) ?? selected.label
    : String(value);

  return (
    <div className={className}>
      <Button
        ref={buttonRef}
        variant="ghost"
        size="sm"
        pressed={open}
        className={`!h-auto min-w-0 gap-1.5 !px-2 !py-1 !text-[14px] !text-[var(--ui-text-secondary)] tabular-nums hover:!text-[var(--ui-primary)] ${buttonClassName ?? ""}`}
        trailingIcon={
          <ChevronDown
            size={14}
            className={`shrink-0 text-[var(--ui-text-tertiary)] transition-transform duration-120 ${open ? "rotate-180" : ""}`}
            strokeWidth={2}
          />
        }
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{displayLabel}</span>
      </Button>
      <MenuPopover
        open={open}
        onClose={() => setOpen(false)}
        anchorRef={buttonRef}
        placement={align === "right" ? "bottom-end" : "bottom-start"}
        gap={6}
        className={`min-w-[160px] ${menuClassName ?? ""}`.trim()}
      >
        {options.map((option) => (
          <div key={String(option.value)}>
            {option.separatorBefore ? <MenuSeparator /> : null}
            <MenuItem
              icon={option.icon}
              active={option.value === value}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              {option.label}
            </MenuItem>
          </div>
        ))}
      </MenuPopover>
    </div>
  );
}
