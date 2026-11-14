import type { ReactNode } from "react";
import { SEGMENTED_CONTROL_CLASS, segmentedIconClassName, segmentedItemClassName } from "../styles/classes";

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
      className={SEGMENTED_CONTROL_CLASS}
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
            className={segmentedItemClassName(isActive)}
          >
            {option.icon && (
              <span className={segmentedIconClassName(isActive)}>
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
