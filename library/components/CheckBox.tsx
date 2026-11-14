import type { ReactNode } from "react";
import { Check } from "lucide-react";
import {
  CHECKBOX_CHECK_SIZE,
  CHECKBOX_DESC_CLASS,
  CHECKBOX_LABEL_GROUP_CLASS,
  checkBoxClassName,
  checkBoxDotClassName,
  checkBoxIndicatorClassName,
  checkBoxLabelClassName,
} from "../styles/classes";
import type { CheckBoxRound, CheckBoxSize } from "../styles/classes";

interface CheckBoxProps {
  active: boolean;
  onToggle: () => void;
  disabled?: boolean;
  title?: string;
  size?: CheckBoxSize;
  round?: CheckBoxRound;
  className?: string;
  activeContent?: ReactNode;
  inactiveContent?: ReactNode;
  desc?: ReactNode;
  children?: ReactNode;
}

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
  // 根据 round 类型自动选择默认图标
  const defaultActiveContent =
    round === "full" ? (
      <span className={checkBoxDotClassName(size)} />
    ) : (
      <Check size={CHECKBOX_CHECK_SIZE[size]} strokeWidth={3}  />
    );

  return (
    <span
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-pressed={active}
      title={title}
      className={checkBoxClassName({ disabled, className })}
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
        className={checkBoxIndicatorClassName({ size, round, active })}
      >
        {active ? (activeContent ?? defaultActiveContent) : inactiveContent}
      </span>

      {/* 标签文字 */}
      {(children || desc) && (
        <span className={CHECKBOX_LABEL_GROUP_CLASS}>
          {children ? (
            <span className={checkBoxLabelClassName({ size, active })}>
              {children}
            </span>
          ) : null}
          {desc ? (
            <span className={CHECKBOX_DESC_CLASS}>
              {desc}
            </span>
          ) : null}
        </span>
      )}
    </span>
  );
}
