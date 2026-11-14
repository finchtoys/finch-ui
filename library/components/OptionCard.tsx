import type { HTMLAttributes, ReactNode } from "react";

interface OptionCardProps extends HTMLAttributes<HTMLDivElement> {
  marker?: ReactNode;
  trailing?: ReactNode;
  active?: boolean;
  selected?: boolean;
  disabled?: boolean;
}

export function OptionCard({
  marker,
  trailing,
  active = false,
  selected = false,
  disabled = false,
  className = "",
  children,
  ...props
}: OptionCardProps) {
  const stateClass = selected
    ? "bg-sf-active text-txt"
    : active
      ? "bg-sf-hover text-txt"
      : "text-txt-secondary hover:bg-sf-hover/40 hover:text-txt";

  return (
    <div
      className={`flex min-h-[36px] items-center gap-2 px-[12px] rounded-[var(--ui-radius-sm)] select-none transition-colors duration-120 ${disabled ? "cursor-default opacity-60" : "cursor-pointer"} ${stateClass} ${className}`.trim()}
      {...props}
    >
      {marker}
      <span className="composerQuestion__optionText min-w-0 flex-1">{children}</span>
      {trailing}
    </div>
  );
}
