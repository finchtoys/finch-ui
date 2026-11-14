import type { ReactNode } from "react";

interface SegmentOption<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedControl<T extends string>({ options, value, onChange }: SegmentedControlProps<T>) {
  return (
    <div
      role="group"
      className="inline-flex gap-0.5 rounded-full bg-[var(--ui-bg-inset)] p-[3px]"
    >
      {options.map((option) => {
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(option.value)}
            className={[
              // layout
              "flex items-center gap-[5px] whitespace-nowrap",
              // shape
              "rounded-full px-3 py-1",
              // typography
              "cursor-pointer text-[13px]",
              // transition
              "transition-[background,color,box-shadow] duration-[160ms]",
              // state
              isActive
                ? "bg-accent font-medium text-white shadow-[0_1px_3px_rgba(0,0,0,0.18),0_0_0_0.5px_rgba(0,0,0,0.08)]"
                : "font-[450] text-[var(--ui-text-tertiary)] hover:text-[var(--ui-text-secondary)]",
            ].join(" ")}
          >
            {option.icon && (
              <span className={`flex items-center ${isActive ? "opacity-90" : "opacity-70"}`}>
                {option.icon}
              </span>
            )}
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
