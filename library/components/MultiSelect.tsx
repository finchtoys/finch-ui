import { useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { MenuItem, MenuPopover } from "./Menu";
import { ScrollArea } from "./ScrollArea";
import {
  DROPDOWN_OPTION_DETAIL_CLASS,
  dropdownMenuPopoverClassName,
  DROPDOWN_OPTION_LABEL_CLASS,
  DROPDOWN_OPTION_ROW_CLASS,
  INPUT_ERROR_TEXT_CLASS,
  INPUT_HINT_CLASS,
  INPUT_LABEL_CLASS,
  MULTISELECT_TRAILING_CLASS,
  multiSelectCheckClassName,
  multiSelectRootClassName,
  multiSelectTriggerClassName,
  selectChevronIconClassName,
} from "../styles/classes";
import { INPUT_ROUND_CLASS, type InputRound, type InputSize } from "./Input";
import { SELECT_TRIGGER_SIZE, selectChevronClass, selectValueClass, selectValueText } from "./selectTrigger";

export interface MultiSelectOption {
  value: string;
  label: string;
  detail?: string;
}

// Shared with DropdownSelect / InputSelect so a multi-select sitting next to a
// single-select in the same form lines up exactly.
const TRIGGER_SIZE = SELECT_TRIGGER_SIZE;

interface MultiSelectProps {
  /** Caption rendered above the trigger, same as `DropdownSelect`. */
  label?: string;
  /** Currently selected values, in the order the caller wants them stored. */
  value: readonly string[];
  options: readonly MultiSelectOption[];
  onChange: (next: string[]) => void;
  /** Shown on the trigger when nothing is selected. */
  placeholder?: string;
  /** Renders "N selected" once the selection exceeds this many labels. Default: 3. */
  summaryThreshold?: number;
  /** Builds the "N selected" summary; defaults to a bare count. */
  summaryLabel?: (count: number) => string;
  className?: string;
  disabled?: boolean;
  /** Native tooltip on the trigger. */
  title?: string;
  size?: InputSize;
  round?: InputRound;
  maxMenuHeight?: number;
}

/**
 * Multi-value picker built from the same trigger + portalled popup as
 * `DropdownSelect`, with a check column instead of single-select semantics.
 * The popup always portals, so it survives scroll containers (settings dialog,
 * composer waiting area) without being clipped.
 */
export function MultiSelect({
  label,
  value,
  options,
  onChange,
  placeholder,
  summaryThreshold = 3,
  summaryLabel,
  className,
  disabled = false,
  title,
  size = "md",
  round = "md",
  maxMenuHeight = 320,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [menuPlacement, setMenuPlacement] = useState<"top" | "bottom">("bottom");
  const [menuMaxHeight, setMenuMaxHeight] = useState(maxMenuHeight);
  const [triggerWidth, setTriggerWidth] = useState<number | undefined>(undefined);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuGap = 8;
  const menuGutter = 12;

  const selected = new Set(value);
  const selectedLabels = options.filter((option) => selected.has(option.value)).map((option) => option.label);
  const triggerText =
    selectedLabels.length === 0
      ? placeholder ?? ""
      : selectedLabels.length > summaryThreshold
        ? summaryLabel?.(selectedLabels.length) ?? String(selectedLabels.length)
        : selectedLabels.join("、");

  const measureMenuSpace = () => {
    const button = buttonRef.current;
    if (!button) return;
    const rect = button.getBoundingClientRect();
    const bottomSpace = window.innerHeight - rect.bottom - menuGap - menuGutter;
    const topSpace = rect.top - menuGap - menuGutter;
    const nextPlacement = bottomSpace < 180 && topSpace > bottomSpace ? "top" : "bottom";
    setMenuPlacement(nextPlacement);
    setMenuMaxHeight(Math.max(120, Math.min(maxMenuHeight, nextPlacement === "top" ? topSpace : bottomSpace)));
    setTriggerWidth(rect.width);
  };

  // Toggling keeps the popup open — that is the whole point of a multi-select —
  // and preserves the declared option order rather than click order.
  const toggle = (optionValue: string) => {
    const next = selected.has(optionValue)
      ? value.filter((v) => v !== optionValue)
      : options.filter((o) => o.value === optionValue || selected.has(o.value)).map((o) => o.value);
    onChange([...next]);
  };

  return (
    <div className={multiSelectRootClassName(className)}>
      {label ? <span className={INPUT_LABEL_CLASS}>{label}</span> : null}
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        title={title}
        className={multiSelectTriggerClassName({ round, size, empty: selectedLabels.length === 0, open })}
        onClick={() => {
          measureMenuSpace();
          setOpen((next) => !next);
        }}
        aria-expanded={open}
      >
        <span className={selectValueClass(size)}>{selectValueText(triggerText)}</span>
        <span className={selectChevronClass(size, round, open)}>
          <ChevronDown size={TRIGGER_SIZE[size].chevron} className={selectChevronIconClassName(open)} />
        </span>
      </button>
      <MenuPopover
        open={open}
        onClose={() => setOpen(false)}
        anchorRef={buttonRef}
        placement={menuPlacement === "top" ? "top-start" : "bottom-start"}
        className={dropdownMenuPopoverClassName(false)}
      >
        <div style={triggerWidth ? { width: triggerWidth } : undefined}>
          <ScrollArea style={{ maxHeight: menuMaxHeight }}>
            {options.map((option) => {
              const active = selected.has(option.value);
              return (
                <MenuItem
                  key={option.value}
                  active={active}
                  className={DROPDOWN_OPTION_ROW_CLASS}
                  onClick={() => toggle(option.value)}
                  trailing={
                    <span className={MULTISELECT_TRAILING_CLASS}>
                      {option.detail ? <span className={DROPDOWN_OPTION_DETAIL_CLASS}>{option.detail}</span> : null}
                      <Check size={14} strokeWidth={2} className={multiSelectCheckClassName(active)} />
                    </span>
                  }
                >
                  <span className={DROPDOWN_OPTION_LABEL_CLASS}>{option.label}</span>
                </MenuItem>
              );
            })}
          </ScrollArea>
        </div>
      </MenuPopover>
    </div>
  );
}
