import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { MenuItem, MenuPanel, MenuPopover, MenuSeparator } from "./Menu";
import { ScrollArea } from "./ScrollArea";
import { INPUT_ROUND_CLASS } from "./Input";
import {
  SELECT_CHEVRON_ROUND,
  SELECT_TRIGGER_SIZE,
  selectChevronClass,
  selectValueClass,
  selectValueText,
} from "./selectTrigger";
import {
  DROPDOWN_OPTION_DETAIL_CLASS,
  INPUT_LABEL_CLASS,
  DROPDOWN_OPTION_LABEL_CLASS,
  DROPDOWN_OPTION_ROW_CLASS,
  dropdownMenuPanelClassName,
  dropdownMenuPopoverClassName,
  dropdownRootClassName,
  dropdownTriggerClassName,
  selectChevronIconClassName,
} from "../styles/classes";

export interface DropdownSelectOption<T extends string | number> {
  value: T;
  label: string;
  detail?: string;
  separatorBefore?: boolean;
  /** Leading glyph rendered before the label. */
  icon?: ReactNode;
}

export type DropdownSelectSize = "sm" | "md" | "lg";
export type DropdownSelectRound = "sm" | "md" | "lg" | "full";

// Trigger metrics live in `selectTrigger.ts` so DropdownSelect / MultiSelect /
// InputSelect stay dimensionally identical.
const TRIGGER_SIZE = SELECT_TRIGGER_SIZE;
const ROUND = INPUT_ROUND_CLASS;
const ROUND_INNER = SELECT_CHEVRON_ROUND;

interface DropdownSelectProps<T extends string | number> {
  label?: string;
  value: T;
  options: DropdownSelectOption<T>[];
  onChange: (value: T) => void;
  className?: string;
  title?: string;
  maxMenuHeight?: number;
  /** Trigger height / font size. Default: "md". */
  size?: DropdownSelectSize;
  /** Corner radius. Default: "md". */
  round?: DropdownSelectRound;
  /**
   * When true the trigger fills its container width and the popup menu matches the
   * trigger width, left-aligned to it (default false = trigger sizes to content and
   * the menu is right-aligned, at least as wide as the trigger).
   */
  block?: boolean;
  /**
   * Render the popup through a portal with fixed positioning instead of an
   * absolutely positioned sibling. Required when the select lives inside a
   * scroll container (`overflow` + mask would otherwise clip the menu).
   */
  portal?: boolean;
}

export function DropdownSelect<T extends string | number>({
  label,
  value,
  options,
  onChange,
  className,
  title,
  maxMenuHeight = 320,
  size = "md",
  round = "md",
  block = false,
  portal = false,
}: DropdownSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const [menuPlacement, setMenuPlacement] = useState<"top" | "bottom">("bottom");
  const [menuMaxHeight, setMenuMaxHeight] = useState(maxMenuHeight);
  const [triggerWidth, setTriggerWidth] = useState<number | undefined>(undefined);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const selected = options.find((option) => option.value === value) ?? options[0];
  const menuGap = 8;
  const menuGutter = 12;

  const measureMenuSpace = () => {
    const button = buttonRef.current;
    if (!button) return;
    const rect = button.getBoundingClientRect();
    // A portalled menu escapes a modal's overflow, but it must not treat the
    // action footer below the form's scroll area as usable room. Otherwise a
    // long select opens downward across the modal buttons even though the
    // viewport itself has plenty of space. Use the dialog content's bottom edge
    // only for the placement decision; an upward menu may still extend above
    // the dialog and is clamped safely to the viewport by MenuPopover.
    const dialog = portal ? button.closest<HTMLElement>("[role='dialog']") : null;
    const dialogContent = dialog ? button.closest<HTMLElement>(".appScrollbar") : null;
    const lowerBoundary = Math.min(
      window.innerHeight,
      dialogContent?.getBoundingClientRect().bottom ?? dialog?.getBoundingClientRect().bottom ?? window.innerHeight,
    );
    const bottomSpace = lowerBoundary - rect.bottom - menuGap - menuGutter;
    const topSpace = rect.top - menuGap - menuGutter;
    const nextPlacement = bottomSpace < 180 && topSpace > bottomSpace ? "top" : "bottom";
    const availableSpace = nextPlacement === "top" ? topSpace : bottomSpace;
    setMenuPlacement(nextPlacement);
    setMenuMaxHeight(Math.max(120, Math.min(maxMenuHeight, availableSpace)));
    setTriggerWidth(rect.width);
  };

  const toggleOpen = () => {
    measureMenuSpace();
    setOpen((next) => !next);
  };

  useEffect(() => {
    // Portal mode: MenuPopover owns outside-click / Escape dismissal. Running
    // this handler too would close the menu on the item's own pointerdown,
    // since the portalled panel lives outside `rootRef`.
    if (!open || portal) return;
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (target && rootRef.current?.contains(target)) return;
      setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, portal]);

  const optionRows = (
    <ScrollArea style={{ maxHeight: menuMaxHeight }}>
      {options.map((option) => (
        <Fragment key={option.value}>
          {option.separatorBefore ? <MenuSeparator /> : null}
          <MenuItem
            active={option.value === value}
            icon={option.icon}
            className={DROPDOWN_OPTION_ROW_CLASS}
            onClick={() => {
              onChange(option.value);
              setOpen(false);
            }}
            trailing={option.detail ? <span className={DROPDOWN_OPTION_DETAIL_CLASS}>{option.detail}</span> : null}
          >
            <span className={DROPDOWN_OPTION_LABEL_CLASS}>{option.label}</span>
          </MenuItem>
        </Fragment>
      ))}
    </ScrollArea>
  );

  // Portal mode: fixed-positioned popup that survives scroll containers whose
  // `overflow` / mask would clip an absolutely positioned sibling.
  const optionList = portal ? (
    <MenuPopover
      open={open}
      onClose={() => setOpen(false)}
      anchorRef={buttonRef}
      placement={menuPlacement === "top" ? "top-start" : "bottom-start"}
      className={dropdownMenuPopoverClassName(block)}
      style={block && triggerWidth ? { width: triggerWidth } : undefined}
    >
      {optionRows}
    </MenuPopover>
  ) : open ? (
    <MenuPanel
      className={dropdownMenuPanelClassName({ block, placement: menuPlacement })}
    >
      {optionRows}
    </MenuPanel>
  ) : null;

  return (
    <div ref={rootRef} className={dropdownRootClassName(className)}>
      {label ? <span className={INPUT_LABEL_CLASS}>{label}</span> : null}
      <button
        ref={buttonRef}
        type="button"
        className={dropdownTriggerClassName({ round, size, block, open })}
      >
        <span className={selectValueClass(size)}>{selectValueText(selected?.label)}</span>
        <span className={selectChevronClass(size, round, open)}>
          <ChevronDown size={TRIGGER_SIZE[size].chevron} className={selectChevronIconClassName(open)} />
        </span>
      </button>
      {optionList}
    </div>
  );
}
