import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { Search, X } from "lucide-react";
import { Kbd } from "./Kbd";
import {
  SEARCH_FIELD_ICON_CLASS,
  searchFieldActionClassName,
  searchFieldClearClassName,
  searchFieldInputClassName,
  searchFieldKbdClassName,
  searchFieldRootClassName,
} from "../styles/classes";

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
      className={searchFieldRootClassName({ focused, active, rootClassName })}
      onClick={() => inputRef.current?.focus()}
    >
      <span className={SEARCH_FIELD_ICON_CLASS}>
        {leadingIcon ?? <Search size={16} />}
      </span>
      <input
        ref={inputRef}
        type="text"
        className={searchFieldInputClassName({ focused, inputClassName })}
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
      <div className={searchFieldActionClassName(actionClassName)}>
        {shortcut ? (
          <Kbd className={searchFieldKbdClassName(kbdClassName)}>
            {shortcut}
          </Kbd>
        ) : null}
        {(value || focused) && (
          <button
            type="button"
            className={searchFieldClearClassName(clearClassName)}
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
