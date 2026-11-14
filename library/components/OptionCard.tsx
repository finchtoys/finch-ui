import type { HTMLAttributes, ReactNode } from "react";
import { OPTION_CARD_TEXT_CLASS, optionCardClassName } from "../styles/classes";

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
  return (
    <div
      className={optionCardClassName({ active, selected, disabled, className })}
      {...props}
    >
      {marker}
      <span className={OPTION_CARD_TEXT_CLASS}>{children}</span>
      {trailing}
    </div>
  );
}
