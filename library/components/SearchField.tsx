import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { Search, X } from "lucide-react";
import { Kbd } from "./Kbd";

interface SearchFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "onChange"> {
  value: string;
  onValueChange: (value: string) => void;
  onClear?: () => void;
  shortcut?: string;
  clearLabel?: string;
  leadingIcon?: ReactNode;
  active?: boolean;
  rootClassName?: string;
  inputClassName?: string;
  actionClassName?: string;
  kbdClassName?: string;
  clearClassName?: string;
}

export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(function SearchField(
  {
    value,
    onValueChange,
    onClear,
    shortcut,
    clearLabel = "Clear search",
    leadingIcon,
    active = false,
    rootClassName = "",
    inputClassName = "",
    actionClassName = "",
    kbdClassName = "",
    clearClassName = "",
    onFocus,
    onBlur,
    onKeyDown,
    ...props
  },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement, []);

  const clear = useCallback(() => {
    onValueChange("");
    onClear?.();
  }, [onClear, onValueChange]);

  return (
    <div
      className={`group/searchField sidebarSearchControl flex min-h-[28px] w-full items-center gap-2 rounded-sm px-2 transition-colors duration-120 ${focused ? "sidebarSearchControl--focused" : ""} ${active ? "sidebarSearchControl--active" : ""} ${rootClassName}`.trim()}
      onClick={() => inputRef.current?.focus()}
    >
      <span className="sidebarSearchControl__icon flex-none">
        {leadingIcon ?? <Search size={16} />}
      </span>
      <input
        ref={inputRef}
        type="text"
        className={`sidebarSearchControl__input ${focused ? "cursor-text!" : ""} min-w-0 flex-1 bg-transparent border-0 outline-none ${inputClassName}`.trim()}
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            if (value) clear();
            else event.currentTarget.blur();
          }
          onKeyDown?.(event);
        }}
        {...props}
      />
      <div className={`sidebarSearchControl__action ${actionClassName}`.trim()}>
        {shortcut ? (
          <Kbd className={`sidebarSearchControl__kbd opacity-0 transition-opacity duration-120 group-hover/searchField:opacity-100 ${kbdClassName}`.trim()}>
            {shortcut}
          </Kbd>
        ) : null}
        {(value || focused) && (
          <button
            type="button"
            className={`sidebarSearchControl__clear grid place-items-center w-6 h-6 rounded-sm text-txt-tertiary hover:bg-sf-hover hover:text-txt-secondary transition-colors duration-120 ${clearClassName}`.trim()}
            title={clearLabel}
            onMouseDown={(event) => event.preventDefault()}
            onClick={(event) => {
              event.stopPropagation();
              clear();
              inputRef.current?.blur();
            }}
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
});
