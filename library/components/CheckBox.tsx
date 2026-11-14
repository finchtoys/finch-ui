import type { ReactNode } from "react";
import { Check } from "lucide-react";

interface CheckBoxProps {
  active: boolean;
  onToggle: () => void;
  disabled?: boolean;
  title?: string;
  size?: "sm" | "md" | "lg";
  round?: "full" | "md";
  className?: string;
  activeContent?: ReactNode;
  inactiveContent?: ReactNode;
  desc?: ReactNode;
  children?: ReactNode;
}

const SIZE_CLASS: Record<NonNullable<CheckBoxProps["size"]>, string> = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

const ROUND_CLASS: Record<NonNullable<CheckBoxProps["round"]>, string> = {
  full: "rounded-full",
  md: "rounded-[var(--ui-radius-sm)]",
};

const DOT_SIZE: Record<NonNullable<CheckBoxProps["size"]>, string> = {
  sm: "h-2 w-2",
  md: "h-2.5 w-2.5",
  lg: "h-3 w-3",
};

const CHECK_SIZE: Record<NonNullable<CheckBoxProps["size"]>, number> = {
  sm: 10,
  md: 12,
  lg: 14,
};

export function CheckBox({
  active,
  onToggle,
  disabled = false,
  title,
  size = "md",
  round = "full",
  className = "",
  children,
  desc,
  activeContent,
  inactiveContent = null,
}: CheckBoxProps) {
  const sizeClass = SIZE_CLASS[size];
  const roundClass = ROUND_CLASS[round];

  // 根据 round 类型自动选择默认图标
  const defaultActiveContent =
    round === "full" ? (
      <span className={`rounded-full bg-current ${DOT_SIZE[size]}`} />
    ) : (
      <Check size={CHECK_SIZE[size]} strokeWidth={3}  />
    );

  return (
    <span
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-pressed={active}
      title={title}
      className={`inline-flex min-w-0 items-center gap-2 ${disabled ? "cursor-default opacity-55" : "cursor-pointer"} ${className}`.trim()}
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) onToggle();
      }}
      onKeyDown={(e) => {
        if (!disabled && (e.key === " " || e.key === "Enter")) {
          e.preventDefault();
          onToggle();
        }
      }}
    >
      {/* 指示器 */}
      <span
        className={`inline-flex shrink-0 items-center justify-center overflow-hidden border transition-colors duration-150 ${sizeClass} ${roundClass} ${
          active
            ? "border-accent bg-accent text-sf-primary"
            : "border-border bg-transparent text-transparent"
        }`}
      >
        {active ? (activeContent ?? defaultActiveContent) : inactiveContent}
      </span>

      {/* 标签文字 */}
      {(children || desc) && (
        <span className="grid min-w-0 gap-0.5">
          {children ? (
            <span className={`truncate ${size === "sm" ? "text-[12px]" : "text-[13px]"} font-medium ${active ? "text-txt" : "text-txt-secondary"}`}>
              {children}
            </span>
          ) : null}
          {desc ? (
            <span className="whitespace-normal text-[11px] font-normal leading-4 text-txt-tertiary">
              {desc}
            </span>
          ) : null}
        </span>
      )}
    </span>
  );
}
